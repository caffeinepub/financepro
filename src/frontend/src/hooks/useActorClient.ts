import { useInternetIdentity } from './useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

const ACTOR_CLIENT_QUERY_KEY = 'actorClient';

// Extend the backend interface locally to include optional internal methods
// used by access-control initialization without modifying the generated types
type ExtendedBackendInterface = backendInterface & {
  _initializeAccessControlWithSecret?: (secret: string) => Promise<void>;
};

export function useActorClient() {
  const { identity } = useInternetIdentity();

  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_CLIENT_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;

      if (!isAuthenticated) {
        // Return anonymous actor if not authenticated
        return await createActorWithConfig();
      }

      const actorOptions = {
        agentOptions: {
          identity
        }
      };

      const actor = await createActorWithConfig(actorOptions) as ExtendedBackendInterface;

      // Optional admin token initialization - fully non-blocking and silent when missing
      const adminToken = getSecretParameter('caffeineAdminToken');
      
      // Only attempt initialization if token exists, is non-empty after trimming,
      // and the method is available on the actor
      if (adminToken && adminToken.trim() !== '' && actor._initializeAccessControlWithSecret) {
        try {
          await actor._initializeAccessControlWithSecret(adminToken.trim());
        } catch (error) {
          // Log but don't fail actor creation - this is optional admin functionality
          // Normal users should never be affected by admin token issues
          console.warn('Optional admin token initialization failed (non-critical):', error);
        }
      }

      return actor as backendInterface;
    },
    staleTime: Infinity,
    enabled: true,
    retry: 1,
  });

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    isError: actorQuery.isError,
    error: actorQuery.error,
    refetch: actorQuery.refetch,
  };
}
