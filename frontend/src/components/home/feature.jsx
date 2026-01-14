/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Brain, Filter, Mail, Shield, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Curation',
    description: 'Advanced AI agents filter noise and surface only what matters to you.',
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Filter,
    title: 'Smart Filtering',
    description: 'Choose up to 4 topics and get perfectly tailored intelligence.',
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Mail,
    title: 'Daily Digests',
    description: 'Receive beautifully formatted emails at your preferred times.',
    color: 'text-green-500',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Sparkles,
    title: 'Context-Aware',
    description: 'AI understands your preferences and learns from your feedback.',
    color: 'text-orange-500',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'Human-in-the-loop verification for high-importance events.',
    color: 'text-red-500',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Real-time processing and instant notifications for breaking news.',
    color: 'text-yellow-500',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Powerful <span className="gradient-text">Features</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to stay informed without the overwhelm
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 border-2 border-white/10 hover:border-primary/50 bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} p-2.5 mb-4`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-base text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}