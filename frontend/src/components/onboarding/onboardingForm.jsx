/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { onboardingAPI } from '../../api/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { InterestSelector } from './interestSelector';
import { TimeSelector } from './TimeSelector';
import { ProgressIndicator } from './progressSelector';
import { TONES } from '../../lib/constants';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function OnboardingForm() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    interests: [],
    keywords: [],
    deliveryTimes: [],
    tone: 'concise',
    minImportanceScore: 5,
  });
  const [keywordInput, setKeywordInput] = useState('');
  const { isAuthenticated, user: authUser } = useAuthStore();

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (authUser?.isOnboarded) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [navigate, authUser]);

  const submitMutation = useMutation({
    mutationFn: onboardingAPI.submit,
    onSuccess: (response) => {
      setUser(response.data.user);
      navigate('/dashboard');
    },
  });

  const steps = [
    {
      title: 'Choose Your Topics',
      description: 'Select up to 4 topics you want to stay informed about',
      field: 'interests',
    },
    {
      title: 'Add Keywords (Optional)',
      description: 'Add specific keywords to refine your feed',
      field: 'keywords',
    },
    {
      title: 'Set Delivery Times',
      description: 'When should we send your daily digest?',
      field: 'deliveryTimes',
    },
    {
      title: 'Customize Preferences',
      description: 'Fine-tune how you want to receive information',
      field: 'preferences',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate(formData);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keyword),
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.interests.length > 0;
      case 1:
        return true; // Keywords are optional
      case 2:
        return formData.deliveryTimes.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2 text-white">{steps[currentStep].title}</h2>
          <p className="text-gray-300">{steps[currentStep].description}</p>
        </motion.div>
      </AnimatePresence>

      <motion.div
        key={`content-${currentStep}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 mb-8 min-h-[450px]"
      >
        {currentStep === 0 && (
          <InterestSelector
            selected={formData.interests}
            onChange={(interests) => setFormData({ ...formData, interests })}
          />
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., React, TypeScript, Docker"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button type="button" onClick={addKeyword}>
                Add
              </Button>
            </div>

            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword) => (
                  <motion.div
                    key={keyword}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full"
                  >
                    <span className="text-sm text-white">{keyword}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-400">
              Keywords help us filter content more precisely. You can skip this step if you prefer.
            </p>
          </div>
        )}

        {currentStep === 2 && (
          <TimeSelector
            selected={formData.deliveryTimes}
            onChange={(deliveryTimes) => setFormData({ ...formData, deliveryTimes })}
          />
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Content Tone</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TONES.map((tone) => (
                  <motion.button
                    key={tone.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, tone: tone.value })}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-lg border-2 transition-all text-left relative z-20 cursor-pointer ${
                      formData.tone === tone.value
                        ? 'border-primary bg-primary/10'
                        : 'border-white/20 hover:border-primary/50 bg-slate-800/50'
                    }`}
                  >
                    <p className="font-medium mb-1 text-white">{tone.label}</p>
                    <p className="text-sm text-gray-300">{tone.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Minimum Importance Score</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.minImportanceScore}
                  onChange={(e) =>
                    setFormData({ ...formData, minImportanceScore: parseInt(e.target.value) })
                  }
                  className="flex-1"
                />
                <span className="font-bold text-2xl w-12 text-center">
                  {formData.minImportanceScore}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Only show events with importance score above this threshold
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={!canProceed() || submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : currentStep === steps.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Complete Setup
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {submitMutation.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
        >
          {submitMutation.error.response?.data?.message || 'Failed to save preferences'}
        </motion.div>
      )}
    </div>
  );
}