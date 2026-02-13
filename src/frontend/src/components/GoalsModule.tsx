import { useState, useEffect } from 'react';
import { useGetUserFinancialGoals, useDeleteFinancialGoal, useGetGoalAnalytics, useGetUserInvestments } from '../hooks/useQueries';
import { useActorReadiness } from '../hooks/useActorReadiness';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Pencil, Trash2, Loader2, Calendar, DollarSign, Info, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AddGoalDialog from './AddGoalDialog';
import EditGoalDialog from './EditGoalDialog';
import LinkInvestmentDialog from './LinkInvestmentDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { FinancialGoal } from '../backend';

export default function GoalsModule() {
  const { data: goals, isLoading: goalsLoading } = useGetUserFinancialGoals();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const { data: analytics, isLoading: analyticsLoading } = useGetGoalAnalytics({ enabled: analyticsEnabled });
  const { data: investments } = useGetUserInvestments();
  const { isInitializing, isFailed, error, retry } = useActorReadiness();
  const deleteGoal = useDeleteFinancialGoal();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [linkingGoal, setLinkingGoal] = useState<FinancialGoal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<bigint | null>(null);

  // Enable analytics fetch after goals are loaded
  useEffect(() => {
    if (goals && !goalsLoading) {
      setAnalyticsEnabled(true);
    }
  }, [goals, goalsLoading]);

  const handleDelete = () => {
    if (deletingGoalId !== null) {
      deleteGoal.mutate(deletingGoalId);
      setDeletingGoalId(null);
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'shortTerm':
        return 'Short-term';
      case 'midTerm':
        return 'Mid-term';
      case 'longTerm':
        return 'Long-term';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'shortTerm':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'midTerm':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'longTerm':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInvestmentLabel = (investment: any) => {
    const categoryLabels: Record<string, string> = {
      retirement: 'Retirement',
      realEstate: 'Real Estate',
      equities: 'Equities',
      fixedDeposits: 'Fixed Deposits',
      bonds: 'Bonds',
      commodities: 'Commodities',
    };
    return `${categoryLabels[investment.category] || investment.category}`;
  };

  // Get goal progress data from analytics
  const getGoalProgress = (goalId: bigint) => {
    if (!analytics) return null;
    return analytics.allGoals.find(g => g.goalId === goalId);
  };

  // Show error state if actor initialization failed
  if (isFailed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Financial Goals</h2>
            <p className="text-sm text-muted-foreground">Track your progress toward financial milestones</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-3">
            <p>{error || 'Backend connection is not ready. Please retry.'}</p>
            <Button onClick={retry} variant="outline" size="sm" className="w-fit">
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading state while initializing or fetching goals
  if (isInitializing || goalsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Financial Goals</h2>
            <p className="text-sm text-muted-foreground">Track your progress toward financial milestones</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Goals</h2>
          <p className="text-sm text-muted-foreground">Track your progress toward financial milestones</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {!goals || goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <img src="/assets/generated/goal-icon.dim_64x64.png" alt="No goals" className="mb-4 h-16 w-16 opacity-50" />
            <p className="mb-4 text-center text-muted-foreground">
              You haven't set any financial goals yet. Start by adding your first goal!
            </p>
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal.id);
            const currentAmount = progress?.currentAmount || 0;
            const progressPercentage = progress?.progressPercentage || 0;
            
            const hasLinkedInvestments = currentAmount > 0;
            const isProgressLoading = analyticsLoading && !progress;

            return (
              <Card key={goal.id.toString()} className="overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        {hasLinkedInvestments && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="mb-1 font-semibold">Linked Investments</p>
                                <p className="text-sm">
                                  Total allocated: {formatCurrency(currentAmount)}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Click "Link Investments" to manage allocations
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <Badge variant="outline" className={getCategoryColor(goal.category)}>
                        {getCategoryLabel(goal.category)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingGoal(goal)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingGoalId(goal.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(goal.targetDate)}</span>
                    </div>
                  </div>

                  {/* Progress Section - Show skeleton while loading analytics */}
                  {isProgressLoading ? (
                    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ) : hasLinkedInvestments ? (
                    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Progress</span>
                        <span className="font-semibold text-primary">{progressPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Current: {formatCurrency(currentAmount)}</span>
                        <span>Remaining: {formatCurrency(goal.targetAmount - currentAmount)}</span>
                      </div>
                    </div>
                  ) : null}

                  <Button variant="outline" className="w-full gap-2" onClick={() => setLinkingGoal(goal)}>
                    <DollarSign className="h-4 w-4" />
                    {hasLinkedInvestments ? 'Manage Investments' : 'Link Investments'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddGoalDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      {editingGoal && <EditGoalDialog goal={editingGoal} open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)} />}
      {linkingGoal && <LinkInvestmentDialog goal={linkingGoal} open={!!linkingGoal} onOpenChange={(open) => !open && setLinkingGoal(null)} />}

      <AlertDialog open={deletingGoalId !== null} onOpenChange={(open) => !open && setDeletingGoalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone and will remove all linked investments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
