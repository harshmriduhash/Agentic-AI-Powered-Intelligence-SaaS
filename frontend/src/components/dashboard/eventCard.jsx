/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ExternalLink, Calendar, TrendingUp } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';
import { eventsAPI } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import * as LucideIcons from 'lucide-react';

export function EventCard({ event, index = 0 }) {
  const { user } = useAuth();
  const category = CATEGORIES[event.category] || { label: event.category, icon: 'FileText', color: 'bg-gray-500' };

  const handleTrackView = async () => {
    try {
      const userId = user?._id || user?.id;
      if (userId && event.id) {
        await eventsAPI.trackEventView(userId, event.id);
      }
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };
  
  return (
    <div className="glass-card h-full rounded-2xl border border-white/10 flex flex-col group">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`${category.color} border-none bg-opacity-20 text-xs py-1 px-3 rounded-full font-bold flex items-center gap-1.5`}>
                {(() => {
                  const Icon = LucideIcons[category.icon] || LucideIcons.FileText;
                  return <Icon className="w-3.5 h-3.5" />;
                })()}
                {category.label}
              </Badge>
              {event.relevanceScore && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-none text-xs font-bold py-1 px-3 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {event.relevanceScore.toFixed(1)}
                </Badge>
              )}
            </div>
            <h3 className="text-2xl font-black text-white leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
              {event.title}
            </h3>
            <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
              {event.summary?.tldr || event.summary || 'No summary available'}
            </p>
          </div>
        </div>
        
        <div className="space-y-4 flex-1 mt-2">
          {event.summary?.bullets && event.summary.bullets.length > 0 && (
            <ul className="space-y-2 text-sm text-slate-300">
              {event.summary.bullets.slice(0, 3).map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span className="line-clamp-2">{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {event.summary?.impact && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs font-bold uppercase tracking-widest mb-1 shadow-sm text-blue-400">Impact</p>
              <p className="text-sm text-slate-200 leading-relaxed line-clamp-2">{event.summary.impact}</p>
            </div>
          )}

          {event.summary?.actionRequired && event.summary.actionRequired !== 'None' && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-xs font-bold uppercase tracking-widest mb-1 text-purple-400">Action Required</p>
              <p className="text-sm text-slate-200 leading-relaxed">{event.summary.actionRequired}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(event.publishedAt || event.createdAt)}
          </div>
          
          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleTrackView}
              className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Read Full 
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {event.topics && event.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {event.topics.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="outline" className="text-[10px] font-bold uppercase border-white/10 text-slate-400 px-2 py-0.5 rounded-md">
                #{topic}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

