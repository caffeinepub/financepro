import type { Investment, GoalProgressSummary } from '../backend';

export interface MonthlyInvestmentData {
  month: string;
  invested: number;
  current: number;
}

export interface GoalDeadlineInsight {
  nearestGoal: GoalProgressSummary | null;
  daysRemaining: number | null;
  upcomingGoals: Array<{
    goal: GoalProgressSummary;
    daysRemaining: number;
  }>;
}

/**
 * Groups investments by month and calculates invested vs current value
 */
export function getMonthlyInvestmentTimeSeries(investments: Investment[]): MonthlyInvestmentData[] {
  if (!investments || investments.length === 0) {
    return [];
  }

  // Group by month
  const monthMap = new Map<string, { invested: number; current: number }>();

  investments.forEach((inv) => {
    const date = new Date(Number(inv.dateOfInvestment) / 1000000);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const existing = monthMap.get(monthKey) || { invested: 0, current: 0 };
    monthMap.set(monthKey, {
      invested: existing.invested + inv.investedAmount,
      current: existing.current + inv.currentValue,
    });
  });

  // Convert to array and sort by date
  const result = Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month: formatMonthLabel(month),
      invested: data.invested,
      current: data.current,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  return result;
}

/**
 * Calculates goal deadline insights including nearest goal and days remaining
 */
export function getGoalDeadlineInsights(goals: GoalProgressSummary[]): GoalDeadlineInsight {
  if (!goals || goals.length === 0) {
    return {
      nearestGoal: null,
      daysRemaining: null,
      upcomingGoals: [],
    };
  }

  const now = Date.now();

  // Calculate days remaining for each goal
  const goalsWithDays = goals
    .map((goal) => {
      const targetDate = Number(goal.targetDate) / 1000000;
      const daysRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
      return { goal, daysRemaining };
    })
    .filter((item) => item.daysRemaining > 0) // Only future goals
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const nearestGoal = goalsWithDays.length > 0 ? goalsWithDays[0].goal : null;
  const daysRemaining = goalsWithDays.length > 0 ? goalsWithDays[0].daysRemaining : null;

  // Get upcoming goals (next 3 goals)
  const upcomingGoals = goalsWithDays.slice(0, 3);

  return {
    nearestGoal,
    daysRemaining,
    upcomingGoals,
  };
}

/**
 * Formats month key (YYYY-MM) to readable label
 */
function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
