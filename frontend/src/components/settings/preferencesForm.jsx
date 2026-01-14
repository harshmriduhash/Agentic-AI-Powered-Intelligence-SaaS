/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { onboardingAPI } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { InterestSelector } from '../onboarding/interestSelector';
import { TimeSelector } from '../onboarding/TimeSelector';
import { TONES, TOPICS } from '../../lib/constants';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../ui/toast';

export function PreferencesForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    interests: user?.interests || [],
    keywords: user?.keywords || [],
    deliveryTimes: user?.delivery?.times || [],
    tone: user?.preferences?.tone || 'concise',
    minImportanceScore: user?.preferences?.minImportanceScore || 5,
  });
  const [keywordInput, setKeywordInput] = useState('');

  const { isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      const response = await onboardingAPI.getPreferences();
      return response.data;
    },
    onSuccess: (data) => {
      if (data) {
        setFormData({
          interests: data.interests || [],
          keywords: data.keywords || [],
          deliveryTimes: data.delivery?.times || [],
          tone: data.preferences?.tone || 'concise',
          minImportanceScore: data.preferences?.minImportanceScore || 5,
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: onboardingAPI.updatePreferences,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Preferences updated successfully!',
        variant: 'success',
      });
      // Redirect back to dashboard after a short delay
      setTimeout(() => navigate('/dashboard'), 1500);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update preferences',
        variant: 'error',
      });
    },
  });

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

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        navigate('/dashboard');
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Your Interests</CardTitle>
          <CardDescription>Select up to 4 topics you want to stay informed about</CardDescription>
        </CardHeader>
        <CardContent>
          <InterestSelector
            selected={formData.interests}
            onChange={(interests) => setFormData({ ...formData, interests })}
          />
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Keywords</CardTitle>
          <CardDescription>Add specific keywords to refine your feed (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., React, TypeScript, Docker"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
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
                  <span className="text-sm">{keyword}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Times */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Times</CardTitle>
          <CardDescription>When should we send your daily digest?</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeSelector
            selected={formData.deliveryTimes}
            onChange={(deliveryTimes) => setFormData({ ...formData, deliveryTimes })}
          />
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Content Preferences</CardTitle>
          <CardDescription>Fine-tune how you want to receive information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                  className={`p-4 rounded-xl border transition-all text-left glass-card ${
                    formData.tone === tone.value
                      ? 'border-primary bg-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="font-medium mb-1">{tone.label}</p>
                  <p className="text-sm text-muted-foreground">{tone.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Minimum Importance Score: {formData.minImportanceScore}</Label>
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
            <p className="text-sm text-muted-foreground">
              Only show events with importance score above this threshold
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={updateMutation.isPending || formData.interests.length === 0 || formData.deliveryTimes.length === 0}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

