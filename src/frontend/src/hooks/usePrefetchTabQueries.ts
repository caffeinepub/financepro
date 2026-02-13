import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActorReadiness } from './useActorReadiness';

export function usePrefetchTabQueries() {
  const queryClient = useQueryClient();
  const { actor, isReady } = useActorReadiness();

  useEffect(() => {
    if (!isReady || !actor) return;

    // Prefetch key queries for Dashboard and Goals tabs
    const prefetchQueries = async () => {
      // Check if queries are already in cache or in-flight
      const dashboardState = queryClient.getQueryState(['dashboard']);
      const goalsState = queryClient.getQueryState(['financialGoals']);
      const analyticsState = queryClient.getQueryState(['goalAnalytics']);

      // Only prefetch if not already fetching or cached
      if (!dashboardState || (dashboardState.status === 'pending' && !dashboardState.fetchStatus)) {
        queryClient.prefetchQuery({
          queryKey: ['dashboard'],
          queryFn: () => actor.getDashboard(),
          staleTime: 30000,
        });
      }

      if (!goalsState || (goalsState.status === 'pending' && !goalsState.fetchStatus)) {
        queryClient.prefetchQuery({
          queryKey: ['financialGoals'],
          queryFn: () => actor.getUserFinancialGoals(),
          staleTime: 30000,
        });
      }

      // Prefetch analytics after a short delay to prioritize main data
      setTimeout(() => {
        if (!analyticsState || (analyticsState.status === 'pending' && !analyticsState.fetchStatus)) {
          queryClient.prefetchQuery({
            queryKey: ['goalAnalytics'],
            queryFn: () => actor.getGoalAnalytics(),
            staleTime: 30000,
          });
        }
      }, 500);
    };

    prefetchQueries();
  }, [isReady, actor, queryClient]);
}
