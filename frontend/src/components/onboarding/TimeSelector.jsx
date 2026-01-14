/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { TIMES } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { Clock } from 'lucide-react';

export function TimeSelector({ selected, onChange, maxSelection = 2 }) {
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
          Select up to {maxSelection} delivery times per day
        </p>
        <p className="text-sm font-medium text-white">
          {selected.length} / {maxSelection} selected
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {TIMES.map((time) => {
          const isSelected = selected.includes(time.value);
          const isDisabled = !isSelected && selected.length >= maxSelection;

          return (
            <motion.button
              key={time.value}
              type="button"
              onClick={() => handleToggle(time.value)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              className={cn(
                'p-4 rounded-lg border-2 transition-all text-left',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : isDisabled
                  ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                  : 'border-white/20 hover:border-primary/50 bg-slate-800/50'
              )}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-white" />
                <p className="font-medium text-white">{time.label}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}