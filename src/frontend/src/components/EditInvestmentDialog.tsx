import { useState, useEffect } from 'react';
import { useUpdateInvestment } from '../hooks/useQueries';
import { useActorReadiness } from '../hooks/useActorReadiness';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import type { Investment } from '../backend';
import { InvestmentCategory } from '../backend';

interface EditInvestmentDialogProps {
  investment: Investment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditInvestmentDialog({ investment, open, onOpenChange }: EditInvestmentDialogProps) {
  const [category, setCategory] = useState<InvestmentCategory>(investment.category as InvestmentCategory);
  const [subcategory, setSubcategory] = useState('');
  const [investedAmount, setInvestedAmount] = useState(investment.investedAmount.toString());
  const [currentValue, setCurrentValue] = useState(investment.currentValue.toString());
  const [dateOfInvestment, setDateOfInvestment] = useState('');
  const updateInvestment = useUpdateInvestment();
  const { isInitializing, isFailed, error } = useActorReadiness();

  const subcategoryOptions: Record<string, { label: string; value: string }[]> = {
    retirement: [
      { label: 'Provident Fund', value: 'providentFund' },
      { label: 'NPS', value: 'nps' },
    ],
    equities: [
      { label: 'Stocks', value: 'stocks' },
      { label: 'ETF', value: 'etf' },
      { label: 'Mutual Fund', value: 'mutualFund' },
    ],
    fixedDeposits: [{ label: 'FD', value: 'fd' }],
    bonds: [{ label: 'Government Bond', value: 'governmentBond' }],
    commodities: [
      { label: 'Gold', value: 'gold' },
      { label: 'Crypto', value: 'crypto' },
    ],
    realEstate: [{ label: 'Real Estate', value: 'other' }],
  };

  useEffect(() => {
    const date = new Date(Number(investment.dateOfInvestment) / 1000000);
    setDateOfInvestment(date.toISOString().split('T')[0]);

    if (typeof investment.subcategory === 'object' && investment.subcategory !== null) {
      const key = Object.keys(investment.subcategory)[0];
      setSubcategory(key);
    }
  }, [investment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invested = parseFloat(investedAmount);
    const current = parseFloat(currentValue);
    const date = new Date(dateOfInvestment);
    const timestamp = BigInt(date.getTime() * 1000000);

    const subcategoryObj = { [subcategory]: subcategory === 'other' ? 'Real Estate' : null };

    updateInvestment.mutate(
      {
        investmentId: investment.id,
        category,
        subcategory: subcategoryObj as any,
        investedAmount: invested,
        currentValue: current,
        dateOfInvestment: timestamp,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const isSubmitDisabled = updateInvestment.isPending || isInitializing || isFailed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Investment</DialogTitle>
          <DialogDescription>Update your investment details</DialogDescription>
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
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value as InvestmentCategory);
                setSubcategory(subcategoryOptions[value][0].value);
              }}
              disabled={isSubmitDisabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={InvestmentCategory.retirement}>Retirement</SelectItem>
                <SelectItem value={InvestmentCategory.equities}>Equities</SelectItem>
                <SelectItem value={InvestmentCategory.fixedDeposits}>Fixed Deposits</SelectItem>
                <SelectItem value={InvestmentCategory.bonds}>Bonds</SelectItem>
                <SelectItem value={InvestmentCategory.commodities}>Commodities</SelectItem>
                <SelectItem value={InvestmentCategory.realEstate}>Real Estate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Select value={subcategory} onValueChange={setSubcategory} disabled={isSubmitDisabled}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subcategoryOptions[category].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invested">Invested Amount ($)</Label>
            <Input
              id="invested"
              type="number"
              step="0.01"
              placeholder="5000"
              value={investedAmount}
              onChange={(e) => setInvestedAmount(e.target.value)}
              required
              disabled={isSubmitDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current">Current Value ($)</Label>
            <Input
              id="current"
              type="number"
              step="0.01"
              placeholder="5500"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              required
              disabled={isSubmitDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date of Investment</Label>
            <Input
              id="date"
              type="date"
              value={dateOfInvestment}
              onChange={(e) => setDateOfInvestment(e.target.value)}
              required
              disabled={isSubmitDisabled}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {updateInvestment.isPending || isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isInitializing ? 'Connecting...' : 'Updating...'}
                </>
              ) : (
                'Update Investment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
