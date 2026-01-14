/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { OnboardingForm } from '../components/onboarding/onboardingForm';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { BotBackground } from '../components/ui/botBackground';

export function OnboardingPage() {
  const { user, isLoading } = useAuth();
  
  console.log('OnboardingPage rendering:', { user, isLoading });

  if (isLoading) {
    console.log('OnboardingPage: showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    console.log('OnboardingPage: no user, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (user.isOnboarded) {
    console.log('OnboardingPage: user already onboarded, redirecting to dashboard');
    return <Navigate to="/dashboard" />;
  }

  console.log('OnboardingPage: rendering form');

  return (
    <div className="min-h-screen relative py-12 px-4 bg-transparent overflow-hidden">
      <BotBackground />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-white">
            Welcome to <span className="gradient-text">Contexta AI</span>
          </h1>
          <p className="text-xl text-gray-300">
            Let's personalize your intelligence feed
          </p>
        </motion.div>

        <OnboardingForm />
      </div>
    </div>
  );
}
