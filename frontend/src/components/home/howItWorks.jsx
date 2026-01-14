/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Sign Up in Seconds',
    description: 'Create your account with email or Google. No credit card needed.',
  },
  {
    number: '02',
    title: 'Choose Your Topics',
    description: 'Select up to 4 topics you care about and set your delivery schedule.',
  },
  {
    number: '03',
    title: 'AI Does the Work',
    description: 'Our agents monitor thousands of sources and filter the noise for you.',
  },
  {
    number: '04',
    title: 'Receive Smart Digests',
    description: 'Get perfectly curated updates delivered to your inbox at your preferred times.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get started in minutes and never miss what matters
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative flex gap-8 mb-12 last:mb-0"
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-20 w-0.5 h-full bg-gradient-to-b from-primary to-transparent" />
              )}

              {/* Step number */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {step.number}
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                />
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 text-white">
                  {step.title}
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </h3>
                <p className="text-gray-300 text-lg">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}