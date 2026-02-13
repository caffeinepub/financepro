import { useState } from 'react';
import { useAddFinancialGoal } from '../hooks/useQueries';
import { useActorReadiness } from '../hooks/useActorReadiness';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { GoalCategory } from '../backend';

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddGoalDialog({ open, onOpenChange }: AddGoalDialogProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<GoalCategory>(GoalCategory.midTerm);
  const addGoal = useAddFinancialGoal();
  const { isInitializing, isFailed, error } = useActorReadiness();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(targetAmount);
    const date = new Date(targetDate);
    const timestamp = BigInt(date.getTime() * 1000000);

    addGoal.mutate(
      { name, targetAmount: amount, targetDate: timestamp, category },
      {
        onSuccess: () => {
          setName('');
          setTargetAmount('');
          setTargetDate('');
          setCategory(GoalCategory.midTerm);
          onOpenChange(false);
        },
      }
    );
  };

  const isSubmitDisabled = addGoal.isPending || isInitializing || isFailed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Financial Goal</DialogTitle>
          <DialogDescription>Create a new financial goal to track your progress</DialogDescription>
        </DialogHeader>
        {isFailed && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Backend connection is not ready. Please close and retry.'}
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g., Emergency Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Target Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="10000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
              disabled={isSubmitDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Target Date</Label>
            <Input
              id="date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
              disabled={isSubmitDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as GoalCategory)} disabled={isSubmitDisabled}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GoalCategory.shortTerm}>Short-term (0-2 years)</SelectItem>
                <SelectItem value={GoalCategory.midTerm}>Mid-term (2-5 years)</SelectItem>
                <SelectItem value={GoalCategory.longTerm}>Long-term (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {addGoal.isPending || isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isInitializing ? 'Connecting...' : 'Adding...'}
                </>
              ) : (
                'Add Goal'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
