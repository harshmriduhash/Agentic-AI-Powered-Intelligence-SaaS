/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/navbar';
import { Footer } from '../components/layout/footer';
import { StatsOverview } from '../components/dashboard/statsOverview';
import { EventFilters } from '../components/dashboard/eventFilters';
import { EventCard } from '../components/dashboard/eventCard';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { Loader2, RefreshCw, Inbox, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { BotBackground } from '../components/ui/botBackground';

export function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const { data: events, isLoading, refetch, isRefetching } = useEvents(
    user?._id || user?.id,
    filters
  );

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">
      <BotBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-32 relative z-10 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <Link 
                to="/" 
                className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all mb-6 inline-flex"
              >
                <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-all">
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest">Back to Contexta AI</span>
              </Link>
              <h1 className="text-5xl font-extrabold mb-4 text-white tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{user?.email?.split('@')[0]}</span>
              </h1>
              <p className="text-xl text-slate-300">
                Here's your personalized intelligence feed
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <StatsOverview />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-50px" }}
        >
          <EventFilters onFilterChange={handleFilterChange} currentFilters={filters} />
        </motion.div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {events.map((event, index) => (
              <motion.div
                key={event.id || event._id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ margin: "-100px" }}
                transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
              >
                <EventCard event={event} index={index} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[400px]"
          >
            <div className="glass-card p-12 text-center max-w-md border border-white/10 rounded-2xl">
              <Inbox className="w-20 h-20 mx-auto mb-6 text-slate-400" />
              <h3 className="text-3xl font-bold mb-4 text-white">No insights found</h3>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                {filters.category || filters.topic
                  ? 'No events match your current filters. Try adjusting your filters.'
                  : "We're currently scouring the web for your personalized updates. Check back in a bit!"}
              </p>
              {(filters.category || filters.topic) && (
                <Button 
                  variant="outline" 
                  onClick={() => handleFilterChange({})}
                  className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/50 text-lg py-6 px-8 rounded-xl"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}

