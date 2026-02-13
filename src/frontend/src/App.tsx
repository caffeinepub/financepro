import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useActorReadiness } from './hooks/useActorReadiness';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './components/ProfileSetup';
import ConnectionErrorState from './components/ConnectionErrorState';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { isFailed, error, errorKind, retry, isInitializing } = useActorReadiness();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (loginStatus === 'initializing') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          {!isAuthenticated ? (
            <LandingPage />
          ) : isFailed && error ? (
            <ConnectionErrorState
              errorMessage={error}
              errorKind={errorKind}
              onRetry={retry}
              isRetrying={isInitializing}
            />
          ) : showProfileSetup ? (
            <ProfileSetup />
          ) : (
            <Dashboard />
          )}
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-8">
          <img
            src="/assets/generated/financial-hero.dim_800x600.png"
            alt="Financial Planning"
            className="mx-auto mb-8 rounded-2xl shadow-2xl"
          />
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          Take Control of Your Financial Future
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Plan your financial goals, track investments, and visualize your progress with powerful analytics.
        </p>
        <button
          onClick={login}
          disabled={isLoggingIn}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Logging in...
            </>
          ) : (
            'Get Started'
          )}
        </button>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon="/assets/generated/goal-icon.dim_64x64.png"
            title="Financial Goals"
            description="Set and track short, mid, and long-term financial goals with ease."
          />
          <FeatureCard
            icon="/assets/generated/investment-icon.dim_64x64.png"
            title="Investment Tracking"
            description="Monitor your portfolio performance across multiple asset categories."
          />
          <FeatureCard
            icon="/assets/generated/analytics-icon.dim_64x64.png"
            title="Analytics & Insights"
            description="Visualize your progress with interactive charts and detailed reports."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <img src={icon} alt={title} className="mx-auto mb-4 h-16 w-16" />
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
