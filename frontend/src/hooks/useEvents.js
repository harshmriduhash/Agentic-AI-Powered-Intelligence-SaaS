import { useQuery } from '@tanstack/react-query';
import { eventsAPI } from '../api/client';

export function useEvents(userId, filters = {}) {
  return useQuery({
    queryKey: ['events', userId, filters],
    queryFn: async () => {
      const response = await eventsAPI.getUserEvents(userId, filters);
      return response.data.events;
    },
    enabled: !!userId,
  });
}

export function useEventStats(userId) {
  return useQuery({
    queryKey: ['events', 'stats', userId],
    queryFn: async () => {
      const response = await eventsAPI.getStats(userId);
      return response.data.stats;
    },
    enabled: !!userId,
  });
}