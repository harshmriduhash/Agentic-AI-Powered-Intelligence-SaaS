/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { TOPICS } from '../../lib/constants';
import { cn } from '../../lib/utils';
import * as LucideIcons from 'lucide-react';

export function InterestSelector({ selected, onChange, maxSelection = 4 }) {
  const handleToggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      if (selected.length < maxSelection) {
        onChange([...selected, value]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Select up to {maxSelection} topics
        </p>
        <p className="text-sm font-medium text-white">
          {selected.length} / {maxSelection} selected
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TOPICS.map((topic) => {
          const isSelected = selected.includes(topic.value);
          const isDisabled = !isSelected && selected.length >= maxSelection;

          return (
            <motion.button
              key={topic.value}
              type="button"
              onClick={() => handleToggle(topic.value)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              className={cn(
                'p-4 rounded-xl border transition-all text-left glass-card',
                isSelected
                  ? 'border-primary bg-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : isDisabled
                  ? 'opacity-30 cursor-not-allowed'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
            <div className="flex items-center gap-3">
              {topic.icon && LucideIcons[topic.icon] ? (
                (() => {
                  const Icon = LucideIcons[topic.icon];
                  return <Icon className={cn("w-6 h-6", isSelected ? "text-primary" : "text-gray-400")} />;
                })()
              ) : (
                <span className="text-2xl">📰</span>
              )}
              <div>
                <p className={cn("font-medium transition-colors", isSelected ? "text-primary" : "text-white")}>
                  {topic.label}
                </p>
              </div>
            </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}