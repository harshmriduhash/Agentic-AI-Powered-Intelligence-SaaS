/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SignupForm } from '../components/auth/signupForm';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { SimpleBackground } from '../components/ui/simpleBackground';

export function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <SimpleBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="mb-4"
            >
              <h1 className="text-3xl font-bold gradient-text">Contexta AI</h1>
            </motion.div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Get started with your personalized tech intelligence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">


            <SignupForm />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}