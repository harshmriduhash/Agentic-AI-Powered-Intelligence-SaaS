/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Navbar } from '../components/layout/navbar';
import { Footer } from '../components/layout/footer';
import { PreferencesForm } from '../components/settings/preferencesForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';
import { BotBackground } from '../components/ui/botBackground';

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <BotBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your preferences and customize your experience
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Update your interests, delivery times, and content preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PreferencesForm />
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

