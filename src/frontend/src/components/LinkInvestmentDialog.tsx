import { useState } from 'react';
import { useGetUserInvestments, useLinkInvestmentToGoal } from '../hooks/useQueries';
import { useActorReadiness } from '../hooks/useActorReadiness';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import type { FinancialGoal } from '../backend';

interface LinkInvestmentDialogProps {
  goal: FinancialGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LinkInvestmentDialog({ goal, open, onOpenChange }: LinkInvestmentDialogProps) {
  const { data: investments, isLoading } = useGetUserInvestments();
  const linkInvestment = useLinkInvestmentToGoal();
  const { isInitializing, isFailed, error } = useActorReadiness();
  const [selectedInvestmentId, setSelectedInvestmentId] = useState('');
  const [amountAllocated, setAmountAllocated] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountAllocated);
    const investmentId = BigInt(selectedInvestmentId);

    linkInvestment.mutate(
      { goalId: goal.id, investmentId, amountAllocated: amount },
      {
        onSuccess: () => {
          setSelectedInvestmentId('');
          setAmountAllocated('');
          onOpenChange(false);
        },
      }
    );
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
    return `${categoryLabels[investment.category] || investment.category} - $${investment.currentValue.toFixed(0)}`;
  };

  const isSubmitDisabled = linkInvestment.isPending || isInitializing || isFailed || !selectedInvestmentId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link Investment to Goal</DialogTitle>
          <DialogDescription>
            Allocate an investment to <strong>{goal.name}</strong>
          </DialogDescription>
        </DialogHeader>
        {isFailed && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Backend connection is not ready. Please close and retry.'}
            </AlertDescription>
          </Alert>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !investments || investments.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No investments available. Add investments first to link them to goals.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="investment">Select Investment</Label>
              <Select value={selectedInvestmentId} onValueChange={setSelectedInvestmentId} disabled={isSubmitDisabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an investment" />
                </SelectTrigger>
                <SelectContent>
                  {investments.map((investment) => (
                    <SelectItem key={investment.id.toString()} value={investment.id.toString()}>
                      {getInvestmentLabel(investment)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Allocate ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="1000"
                value={amountAllocated}
                onChange={(e) => setAmountAllocated(e.target.value)}
                required
                disabled={isSubmitDisabled}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitDisabled}>
                {linkInvestment.isPending || isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isInitializing ? 'Connecting...' : 'Linking...'}
                  </>
                ) : (
                  'Link Investment'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
