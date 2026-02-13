import { useState } from 'react';
import { useGetUserInvestments, useDeleteInvestment } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import AddInvestmentDialog from './AddInvestmentDialog';
import EditInvestmentDialog from './EditInvestmentDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Investment } from '../backend';

export default function InvestmentsModule() {
  const { data: investments, isLoading } = useGetUserInvestments();
  const deleteInvestment = useDeleteInvestment();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [deletingInvestmentId, setDeletingInvestmentId] = useState<bigint | null>(null);

  const handleDelete = () => {
    if (deletingInvestmentId !== null) {
      deleteInvestment.mutate(deletingInvestmentId);
      setDeletingInvestmentId(null);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      retirement: 'Retirement',
      realEstate: 'Real Estate',
      equities: 'Equities',
      fixedDeposits: 'Fixed Deposits',
      bonds: 'Bonds',
      commodities: 'Commodities',
    };
    return labels[category] || category;
  };

  const getSubcategoryLabel = (subcategory: any) => {
    if (typeof subcategory === 'object' && subcategory !== null) {
      const key = Object.keys(subcategory)[0];
      const labels: Record<string, string> = {
        providentFund: 'Provident Fund',
        nps: 'NPS',
        etf: 'ETF',
        mutualFund: 'Mutual Fund',
        crypto: 'Crypto',
        fd: 'FD',
        governmentBond: 'Government Bond',
        gold: 'Gold',
        stocks: 'Stocks',
        other: subcategory.other || 'Other',
      };
      return labels[key] || key;
    }
    return 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateGainLoss = (investment: Investment) => {
    const gain = investment.currentValue - investment.investedAmount;
    const percentage = (gain / investment.investedAmount) * 100;
    return { gain, percentage };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Portfolio</h2>
          <p className="text-sm text-muted-foreground">Monitor your investments and track performance</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Investment
        </Button>
      </div>

      {!investments || investments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <img src="/assets/generated/investment-icon.dim_64x64.png" alt="No investments" className="mb-4 h-16 w-16 opacity-50" />
            <p className="mb-4 text-center text-muted-foreground">
              You haven't added any investments yet. Start tracking your portfolio!
            </p>
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Investment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment) => {
            const { gain, percentage } = calculateGainLoss(investment);
            const isPositive = gain >= 0;

            return (
              <Card key={investment.id.toString()} className="overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-lg">{getCategoryLabel(investment.category)}</CardTitle>
                      <Badge variant="outline" className="bg-muted/50">
                        {getSubcategoryLabel(investment.subcategory)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingInvestment(investment)} className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingInvestmentId(investment.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Invested</span>
                      <span className="font-medium">{formatCurrency(investment.investedAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Value</span>
                      <span className="font-semibold">{formatCurrency(investment.currentValue)}</span>
                    </div>
                  </div>
                  <div className={`flex items-center justify-between rounded-lg p-2 ${isPositive ? 'bg-chart-4/10' : 'bg-destructive/10'}`}>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-chart-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                      <span className={`text-sm font-semibold ${isPositive ? 'text-chart-4' : 'text-destructive'}`}>
                        {percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isPositive ? 'text-chart-4' : 'text-destructive'}`}>
                      {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddInvestmentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      {editingInvestment && (
        <EditInvestmentDialog
          investment={editingInvestment}
          open={!!editingInvestment}
          onOpenChange={(open) => !open && setEditingInvestment(null)}
        />
      )}

      <AlertDialog open={deletingInvestmentId !== null} onOpenChange={(open) => !open && setDeletingInvestmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this investment? This action cannot be undone.
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
