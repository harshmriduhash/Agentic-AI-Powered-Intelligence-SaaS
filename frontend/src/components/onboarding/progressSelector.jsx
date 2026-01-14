/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function ProgressIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              index < currentStep
                ? 'bg-green-500 text-white'
                : index === currentStep
                ? 'bg-primary text-white'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {index < currentStep ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              index + 1
            )}
          </motion.div>
          {index < totalSteps - 1 && (
            <div
              className={`w-12 h-1 ${
                index < currentStep ? 'bg-green-500' : 'bg-gray-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}