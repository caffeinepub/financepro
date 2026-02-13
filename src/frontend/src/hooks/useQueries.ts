import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActorReadiness } from './useActorReadiness';
import type {
  FinancialGoal,
  Investment,
  GoalsAnalytics,
  InvestmentsAnalytics,
  FinancialDashboard,
  UserProfile,
  GoalCategory,
  InvestmentCategory,
  InvestmentSubcategory,
} from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isReady, isInitializing } = useActorReadiness();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: isReady,
    retry: false,
  });

  return {
    ...query,
    isLoading: isInitializing || query.isLoading,
    isFetched: isReady && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor, isReady } = useActorReadiness();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!isReady || !actor) {
        throw new Error('Backend connection is not ready. Please wait and try again.');
      }
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// Financial Goals Queries
export function useGetUserFinancialGoals() {
  const { actor, isReady } = useActorReadiness();

  return useQuery<FinancialGoal[]>({
    queryKey: ['financialGoals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserFinancialGoals();
    },
    enabled: isReady,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useAddFinancialGoal() {
  const { actor, isReady } = useActorReadiness();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      targetAmount: number;
      targetDate: bigint;
      category: GoalCategory;
    }) => {
      if (!isReady || !actor) {
        throw new Error('Backend connection is not ready. Please wait and try again.');
      }
      return actor.addFinancialGoal(params.name, params.targetAmount, params.targetDate, params.category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialGoals'] });
      queryClient.invalidateQueries({ queryKey: ['goalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add goal: ${error.message}`);
    },
  });
}

export function useUpdateFinancialGoal() {
  const { actor, isReady } = useActorReadiness();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      goalId: bigint;
      name: string;
      targetAmount: number;
      targetDate: bigint;
      category: GoalCategory;
    }) => {
      if (!isReady || !actor) {
        throw new Error('Backend connection is not ready. Please wait and try again.');
      }
      return actor.updateFinancialGoal(
        params.goalId,
        params.name,
        params.targetAmount,
        params.targetDate,
        params.category
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialGoals'] });
      queryClient.invalidateQueries({ queryKey: ['goalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update goal: ${error.message}`);
    },
  });
}

export function useDeleteFinancialGoal() {
  const { actor, isReady } = useActorReadiness();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: bigint) => {
      if (!isReady || !actor) {
        throw new Error('Backend connection is not ready. Please wait and try again.');
      }
      return actor.deleteFinancialGoal(goalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialGoals'] });
      queryClient.invalidateQueries({ queryKey: ['goalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete goal: ${error.message}`);
    },
  });
}

// Investment Queries
export function useGetUserInvestments() {
  const { actor, isReady } = useActorReadiness();

  return useQuery<Investment[]>({
    queryKey: ['investments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserInvestments();
    },
    enabled: isReady,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useAddInvestment() {
  const { actor, isReady } = useActorReadiness();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      category: InvestmentCategory;
      subcategory: InvestmentSubcategory;
      investedAmount: number;
      currentValue: number;
      dateOfInvestment: bigint;
    }) => {
      if (!isReady || !actor) {
        throw new Error('Backend connection is not ready. Please wait and try again.');
      }
      return actor.addInvestment(
        params.category,
        params.subcategory,
        params.investedAmount,
        params.currentValue,
        params.dateOfInvestment
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investmentAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Investment added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add investment: ${error.message}`);
    },
  });
}

export function useUpdateInvestment() {
  const { actor, isReady } = useActorReadiness();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      investmentId: bigint;
      category: InvestmentCategory;
      subcategory: InvestmentSubcategory;
      investedAmount: number;
      currentValue: number;
      dateOfInvestment: bigint;
    }) => {
      if (!isReady || !actor) {
        throw new Error('Backend connection is not ready. Please wait and try again.');
      }
      return actor.updateInvestment(
        params.investmentId,
        params.category,
        params.subcategory,
        params.investedAmount,
        params.currentValue,
        params.dateOfInvestment
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investmentAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['goalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Investment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update investment: ${error.message}`);
    },
  });
}

export function useDeleteInvestment() {
  const { actor, isReady } = useActorReadiness();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (investmentId: bigint) => {
      if (!isReady || !actor) {
        throw new Error('Backend connection is not ready. Please wait and try again.');
      }
      return actor.deleteInvestment(investmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investmentAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['goalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Investment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete investment: ${error.message}`);
    },
  });
}

// Analytics Queries
export function useGetGoalAnalytics(options?: { enabled?: boolean }) {
  const { actor, isReady } = useActorReadiness();

  return useQuery<GoalsAnalytics>({
    queryKey: ['goalAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getGoalAnalytics();
    },
    enabled: isReady && (options?.enabled !== false),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useGetInvestmentAnalytics(options?: { enabled?: boolean }) {
  const { actor, isReady } = useActorReadiness();

  return useQuery<InvestmentsAnalytics>({
    queryKey: ['investmentAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getInvestmentAnalytics();
    },
    enabled: isReady && (options?.enabled !== false),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useGetDashboard() {
  const { actor, isReady } = useActorReadiness();

  return useQuery<FinancialDashboard>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboard();
    },
    enabled: isReady,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Goal-Investment Linking
export function useLinkInvestmentToGoal() {
  const { actor, isReady } = useActorReadiness();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { goalId: bigint; investmentId: bigint; amountAllocated: number }) => {
      if (!isReady || !actor) {
        throw new Error('Backend connection is not ready. Please wait and try again.');
      }
      return actor.linkInvestmentToGoal(params.goalId, params.investmentId, params.amountAllocated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Investment linked to goal successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to link investment: ${error.message}`);
    },
  });
}

export function useUnlinkInvestmentFromGoal() {
  const { actor, isReady } = useActorReadiness();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { goalId: bigint; investmentId: bigint }) => {
      if (!isReady || !actor) {
        throw new Error('Backend connection is not ready. Please wait and try again.');
      }
      return actor.unlinkInvestmentFromGoal(params.goalId, params.investmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Investment unlinked from goal successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to unlink investment: ${error.message}`);
    },
  });
}
