/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Filter, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { CATEGORIES, TOPICS } from '../../lib/constants';

export function EventFilters({ onFilterChange, currentFilters = {} }) {
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.category || null);
  const [selectedTopic, setSelectedTopic] = useState(currentFilters.topic || null);
  const [showFilters, setShowFilters] = useState(false);

  const handleCategoryChange = (category) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    onFilterChange({ category: newCategory, topic: selectedTopic });
  };

  const handleTopicChange = (topic) => {
    const newTopic = selectedTopic === topic ? null : topic;
    setSelectedTopic(newTopic);
    onFilterChange({ category: selectedCategory, topic: newTopic });
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTopic(null);
    onFilterChange({ category: null, topic: null });
  };

  const hasActiveFilters = selectedCategory || selectedTopic;

  return (
    <div className="glass-card rounded-2xl border border-white/10 overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Filter className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Intelligence Filters</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-none">
                Active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 py-5"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-8 mt-8 pt-8 border-t border-white/5"
          >
            {/* Category Filter */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">By Category</h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(CATEGORIES).map(([key, category]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryChange(key)}
                    className={`px-6 py-3 rounded-xl border-2 transition-all text-sm font-bold flex items-center gap-2 ${
                      selectedCategory === key
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {(() => {
                      const Icon = LucideIcons[category.icon] || LucideIcons.FileText;
                      return <Icon className="w-5 h-5" />;
                    })()}
                    {category.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Topic Filter */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-slate-400">By Topic</h4>
              <div className="flex flex-wrap gap-3">
                {TOPICS.map((topic) => (
                  <motion.button
                    key={topic.value}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTopicChange(topic.value)}
                    className={`px-6 py-3 rounded-xl border-2 transition-all text-sm font-bold flex items-center gap-2 ${
                      selectedTopic === topic.value
                        ? 'border-purple-500 bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {(() => {
                      const Icon = LucideIcons[topic.icon] || LucideIcons.Hash;
                      return <Icon className="w-5 h-5" />;
                    })()}
                    {topic.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-3 mt-6">
            {selectedCategory && (
              <Badge variant="secondary" className="glass-card border-blue-500/30 text-blue-300 px-3 py-1.5 text-sm flex items-center gap-2">
                {(() => {
                  const Icon = LucideIcons[CATEGORIES[selectedCategory]?.icon] || LucideIcons.FileText;
                  return <Icon className="w-4 h-4" />;
                })()}
                {CATEGORIES[selectedCategory]?.label}
                <button
                  onClick={() => handleCategoryChange(selectedCategory)}
                  className="ml-1 hover:text-blue-100 opacity-60 hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </Badge>
            )}
            {selectedTopic && (
              <Badge variant="secondary" className="glass-card border-purple-500/30 text-purple-300 px-3 py-1.5 text-sm flex items-center gap-2">
                {(() => {
                  const topic = TOPICS.find(t => t.value === selectedTopic);
                  const Icon = LucideIcons[topic?.icon] || LucideIcons.Hash;
                  return <Icon className="w-4 h-4" />;
                })()}
                {TOPICS.find(t => t.value === selectedTopic)?.label}
                <button
                  onClick={() => handleTopicChange(selectedTopic)}
                  className="ml-1 hover:text-purple-100 opacity-60 hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
