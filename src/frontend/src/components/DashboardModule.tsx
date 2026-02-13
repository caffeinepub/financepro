import { useGetDashboard } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, Target, DollarSign, PieChart as PieChartIcon, Calendar, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { getMonthlyInvestmentTimeSeries, getGoalDeadlineInsights } from '../utils/dashboardAnalytics';

export default function DashboardModule() {
  const { data: dashboard, isLoading, isFetching } = useGetDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const { goalsAnalytics, investmentsAnalytics } = dashboard;
  const isPositive = investmentsAnalytics.summary.gainLossAbsolute >= 0;

  // Calculate average progress percentage
  const averageProgress = goalsAnalytics.allGoals.length > 0
    ? goalsAnalytics.allGoals.reduce((sum, goal) => sum + goal.progressPercentage, 0) / goalsAnalytics.allGoals.length
    : 0;

  const goalCategoryData = [
    { name: 'Short-term', value: goalsAnalytics.categoryBreakdown.shortTermGoals.length, fill: 'oklch(var(--chart-1))' },
    { name: 'Mid-term', value: goalsAnalytics.categoryBreakdown.midTermGoals.length, fill: 'oklch(var(--chart-2))' },
    { name: 'Long-term', value: goalsAnalytics.categoryBreakdown.longTermGoals.length, fill: 'oklch(var(--chart-3))' },
  ].filter(item => item.value > 0);

  const goalProgressData = goalsAnalytics.allGoals.slice(0, 6).map(goal => ({
    name: goal.goalName.length > 12 ? goal.goalName.substring(0, 12) + '...' : goal.goalName,
    fullName: goal.goalName,
    progress: Number(goal.progressPercentage.toFixed(1)),
    current: goal.currentAmount,
    target: goal.targetAmount,
  }));

  // Investment category breakdown
  const investmentCategoryMap = new Map<string, number>();
  investmentsAnalytics.allInvestments.forEach(inv => {
    const category = inv.category;
    const current = investmentCategoryMap.get(category) || 0;
    investmentCategoryMap.set(category, current + inv.currentValue);
  });

  const investmentCategoryData = Array.from(investmentCategoryMap.entries()).map(([category, value], index) => {
    const categoryLabels: Record<string, string> = {
      retirement: 'Retirement',
      realEstate: 'Real Estate',
      equities: 'Equities',
      fixedDeposits: 'Fixed Deposits',
      bonds: 'Bonds',
      commodities: 'Commodities',
    };
    const colors = ['oklch(var(--chart-1))', 'oklch(var(--chart-2))', 'oklch(var(--chart-3))', 'oklch(var(--chart-4))', 'oklch(var(--chart-5))'];
    return {
      name: categoryLabels[category] || category,
      value: value,
      fill: colors[index % colors.length],
    };
  });

  // Time series data for investments
  const monthlyInvestmentData = getMonthlyInvestmentTimeSeries(investmentsAnalytics.allInvestments);

  // Goal deadline insights
  const deadlineInsights = getGoalDeadlineInsights(goalsAnalytics.allGoals);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="mb-1 font-semibold text-card-foreground">{payload[0].payload.fullName || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name === 'progress' && `Progress: ${entry.value}%`}
              {entry.name === 'current' && `Current: ${formatCurrency(entry.value)}`}
              {entry.name === 'target' && `Target: ${formatCurrency(entry.value)}`}
              {entry.name === 'value' && `Value: ${formatCurrency(entry.value)}`}
              {entry.name === 'invested' && `Invested: ${formatCurrency(entry.value)}`}
              {entry.name === 'Invested' && `Invested: ${formatCurrency(entry.value)}`}
              {entry.name === 'Current' && `Current: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Your complete financial analytics at a glance</p>
      </div>

      {/* Premium Summary Cards with Gradient */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-primary">Total Goal Amount</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(goalsAnalytics.totalGoalAmount)}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Across {goalsAnalytics.allGoals.length} {goalsAnalytics.allGoals.length === 1 ? 'goal' : 'goals'}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-chart-4/10 via-chart-4/5 to-background shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-chart-4">Total Current Value</CardTitle>
            <DollarSign className="h-5 w-5 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(investmentsAnalytics.summary.currentPortfolioValue)}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Portfolio value • {investmentsAnalytics.allInvestments.length} {investmentsAnalytics.allInvestments.length === 1 ? 'investment' : 'investments'}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-chart-2/10 via-chart-2/5 to-background shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-chart-2">Average Progress</CardTitle>
            <TrendingUp className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{averageProgress.toFixed(1)}%</div>
            <Progress value={averageProgress} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Goal Deadline Insights */}
      {deadlineInsights.nearestGoal && (
        <Card className="border-chart-3/20 bg-gradient-to-br from-chart-3/5 to-background shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-chart-3" />
              Goal Deadline Insights
            </CardTitle>
            <CardDescription>Track your upcoming financial milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-chart-3/20 bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Nearest Goal</span>
                <Badge variant="outline" className="bg-chart-3/10 text-chart-3">
                  {deadlineInsights.daysRemaining} days remaining
                </Badge>
              </div>
              <p className="text-xl font-bold">{deadlineInsights.nearestGoal.goalName}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Target: {formatCurrency(deadlineInsights.nearestGoal.targetAmount)}</span>
                <span className="font-semibold text-chart-3">{deadlineInsights.nearestGoal.progressPercentage.toFixed(1)}% complete</span>
              </div>
              <Progress value={deadlineInsights.nearestGoal.progressPercentage} className="mt-2 h-2" />
            </div>

            {deadlineInsights.upcomingGoals.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Upcoming Goals</p>
                {deadlineInsights.upcomingGoals.slice(1).map(({ goal, daysRemaining }) => (
                  <div key={goal.goalId.toString()} className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
                    <div className="flex-1">
                      <p className="font-medium">{goal.goalName}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(goal.targetAmount)} • {goal.progressPercentage.toFixed(0)}% complete</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {daysRemaining}d
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Investment Time Series */}
        {monthlyInvestmentData.length > 0 && (
          <Card className="shadow-md lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-4" />
                Investment Growth Over Time
              </CardTitle>
              <CardDescription>Monthly invested amount vs current portfolio value</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={monthlyInvestmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(var(--chart-4))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(var(--chart-4))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'oklch(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'oklch(var(--border))' }}
                    label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', fill: 'oklch(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="invested" stroke="oklch(var(--chart-1))" fillOpacity={1} fill="url(#colorInvested)" name="Invested" />
                  <Area type="monotone" dataKey="current" stroke="oklch(var(--chart-4))" fillOpacity={1} fill="url(#colorCurrent)" name="Current" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Goal Progress Bar Chart */}
        {goalProgressData.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Goal Progress Tracker
              </CardTitle>
              <CardDescription>Individual goal completion percentages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={goalProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'oklch(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'oklch(var(--border))' }}
                    label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft', fill: 'oklch(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(var(--accent))' }} />
                  <Bar dataKey="progress" fill="oklch(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Goals by Category Pie Chart */}
        {goalCategoryData.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-chart-2" />
                Goals by Time Horizon
              </CardTitle>
              <CardDescription>Distribution across short, mid, and long-term goals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={goalCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {goalCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Investment Portfolio Breakdown */}
        {investmentCategoryData.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-chart-4" />
                Portfolio Allocation
              </CardTitle>
              <CardDescription>Investment distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={investmentCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {investmentCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Performance */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-chart-4" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              Portfolio Performance
            </CardTitle>
            <CardDescription>Investment returns and P&L analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold">{formatCurrency(investmentsAnalytics.summary.totalInvested)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">{formatCurrency(investmentsAnalytics.summary.currentPortfolioValue)}</p>
              </div>
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profit & Loss</span>
                <span className={`text-2xl font-bold ${isPositive ? 'text-chart-4' : 'text-destructive'}`}>
                  {investmentsAnalytics.summary.pnlPercentage >= 0 ? '+' : ''}
                  {investmentsAnalytics.summary.pnlPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Absolute Gain/Loss</span>
                <span className={`text-lg font-semibold ${isPositive ? 'text-chart-4' : 'text-destructive'}`}>
                  {investmentsAnalytics.summary.gainLossAbsolute >= 0 ? '+' : ''}
                  {formatCurrency(investmentsAnalytics.summary.gainLossAbsolute)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {goalsAnalytics.allGoals.length === 0 && investmentsAnalytics.allInvestments.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <img src="/assets/generated/analytics-icon.dim_64x64.png" alt="No data" className="mb-6 h-20 w-20 opacity-40" />
            <h3 className="mb-2 text-xl font-semibold">No Data Available</h3>
            <p className="mb-6 text-center text-muted-foreground">
              Start adding goals and investments to see your financial analytics here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
