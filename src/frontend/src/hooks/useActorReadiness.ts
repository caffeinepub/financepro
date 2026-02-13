import { useActorClient } from './useActorClient';
import { useInternetIdentity } from './useInternetIdentity';
import { useEffect, useState, useRef } from 'react';
import { classifyReplicaError, type ReplicaErrorInfo } from '../utils/icReplicaErrors';

export type ActorReadinessState = 'initializing' | 'ready' | 'failed';

const INITIALIZATION_TIMEOUT = 3000; // 3 seconds

// Module-level cache for initialization state per identity
const initializationCache = new Map<string, {
  promise: Promise<void> | null;
  state: ActorReadinessState;
  error: ReplicaErrorInfo | null;
}>();

export function useActorReadiness() {
  const { actor, isFetching, isError, error: actorError, refetch } = useActorClient();
  const { identity } = useInternetIdentity();
  const [readinessState, setReadinessState] = useState<ActorReadinessState>('initializing');
  const [errorInfo, setErrorInfo] = useState<ReplicaErrorInfo | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const initializeActor = async () => {
      // If actor creation failed, transition to failed state immediately
      if (isError) {
        if (mounted) {
          const classified = classifyReplicaError(actorError);
          setReadinessState('failed');
          setErrorInfo(classified);
        }
        return;
      }

      if (!actor) {
        if (mounted) {
          setReadinessState('initializing');
          
          // Set timeout for authenticated initialization
          if (identity) {
            timeoutRef.current = setTimeout(() => {
              if (mounted && !actor) {
                setReadinessState('failed');
                setErrorInfo({
                  kind: 'generic',
                  message: 'Backend initialization timed out. Please try again.',
                  originalError: new Error('Initialization timeout'),
                });
              }
            }, INITIALIZATION_TIMEOUT);
          }
        }
        return;
      }

      // Actor is available - now ensure backend initialization for authenticated users
      if (identity) {
        const principalId = identity.getPrincipal().toString();
        
        // Check cache first
        let cached = initializationCache.get(principalId);
        
        if (cached) {
          // Use cached state
          if (mounted) {
            setReadinessState(cached.state);
            setErrorInfo(cached.error);
          }
          return;
        }

        // Initialize cache entry
        cached = {
          promise: null,
          state: 'initializing',
          error: null,
        };
        initializationCache.set(principalId, cached);

        if (mounted) {
          setReadinessState('initializing');
        }

        // Create initialization promise
        const initPromise = (async () => {
          try {
            await actor.ensureInitialized();
            
            if (mounted) {
              cached!.state = 'ready';
              cached!.error = null;
              setReadinessState('ready');
              setErrorInfo(null);
            }
          } catch (error: any) {
            const classified = classifyReplicaError(error);
            
            if (mounted) {
              cached!.state = 'failed';
              cached!.error = classified;
              setReadinessState('failed');
              setErrorInfo(classified);
            }
          }
        })();

        cached.promise = initPromise;
        await initPromise;
      } else {
        // Anonymous users don't need initialization
        if (mounted) {
          setReadinessState('ready');
          setErrorInfo(null);
        }
      }
    };

    initializeActor();

    return () => {
      mounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [actor, identity, isError, actorError]);

  // Retry function that properly re-creates the actor and re-initializes
  const retry = async () => {
    // Clear cache for current identity
    if (identity) {
      const principalId = identity.getPrincipal().toString();
      initializationCache.delete(principalId);
    }

    // Reset state
    setReadinessState('initializing');
    setErrorInfo(null);

    // Refetch actor (this will trigger the useEffect above with the new actor)
    await refetch();
  };

  return {
    actor,
    isReady: readinessState === 'ready',
    isFailed: readinessState === 'failed',
    isInitializing: readinessState === 'initializing',
    error: errorInfo?.message || null,
    errorKind: errorInfo?.kind || null,
    retry,
  };
}
