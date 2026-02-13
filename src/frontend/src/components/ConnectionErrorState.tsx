import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ConnectionErrorStateProps {
  errorMessage: string;
  errorKind?: 'canisterStopped' | 'generic' | null;
  onRetry: () => Promise<void> | void;
  isRetrying?: boolean;
}

export default function ConnectionErrorState({
  errorMessage,
  errorKind,
  onRetry,
  isRetrying = false,
}: ConnectionErrorStateProps) {
  const isCanisterStopped = errorKind === 'canisterStopped';

  const handleRetry = async () => {
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            {isCanisterStopped ? 'Service Temporarily Unavailable' : 'Connection Error'}
          </AlertTitle>
          <AlertDescription className="mt-2 text-base">
            {errorMessage}
          </AlertDescription>
        </Alert>

        <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
          <h3 className="mb-4 text-xl font-semibold">What can you do?</h3>
          <div className="mb-6 space-y-3 text-left text-sm text-muted-foreground">
            {isCanisterStopped ? (
              <>
                <p>• The backend canister is currently stopped and needs to be restarted</p>
                <p>• This is typically a temporary condition during maintenance or updates</p>
                <p>• Try clicking the Retry button below after a few moments</p>
                <p>• If the issue persists, please contact support</p>
              </>
            ) : (
              <>
                <p>• Check your internet connection</p>
                <p>• Try clicking the Retry button below</p>
                <p>• If the issue persists, try refreshing the page</p>
                <p>• Contact support if the problem continues</p>
              </>
            )}
          </div>

          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
