/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useEventStats } from '../../hooks/useEvents';
import { useAuth } from '../../hooks/useAuth';
import { TrendingUp, Mail, Eye, Star } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export function StatsOverview() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useEventStats(user?._id || user?.id);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Events',
      value: stats?.totalEvents || 0,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Emails Sent',
      value: stats?.emailsSent || 0,
      icon: Mail,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Events Viewed',
      value: stats?.eventsViewed || 0,
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Avg Rating',
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : 'N/A',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                {stat.title}
              </span>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-4xl font-black text-white">{stat.value}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

