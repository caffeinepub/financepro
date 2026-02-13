import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GoalsModule from '../components/GoalsModule';
import InvestmentsModule from '../components/InvestmentsModule';
import DashboardModule from '../components/DashboardModule';
import { Target, TrendingUp, LayoutDashboard } from 'lucide-react';
import { usePrefetchTabQueries } from '../hooks/usePrefetchTabQueries';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Prefetch key queries for faster tab switching
  usePrefetchTabQueries();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Financial Dashboard</h1>
        <p className="text-muted-foreground">Manage your goals, investments, and track your progress</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="investments" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Investments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardModule />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <GoalsModule />
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <InvestmentsModule />
        </TabsContent>
      </Tabs>
    </div>
  );
}
