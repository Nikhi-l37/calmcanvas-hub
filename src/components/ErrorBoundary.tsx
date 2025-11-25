import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isEnvError = this.state.error?.message?.includes('environment variables');
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle>Configuration Error</CardTitle>
              </div>
              <CardDescription>
                {isEnvError 
                  ? 'Supabase environment variables are missing'
                  : 'An error occurred while loading the application'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-mono text-foreground">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>
              
              {isEnvError && (
                <div className="space-y-2">
                  <h3 className="font-semibold">How to fix:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Create a <code className="bg-muted px-1 py-0.5 rounded">.env</code> file in the project root</li>
                    <li>Add your Supabase credentials:
                      <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here`}
                      </pre>
                    </li>
                    <li>Rebuild the app: <code className="bg-muted px-1 py-0.5 rounded">npm run build</code></li>
                    <li>Sync Capacitor (for Android): <code className="bg-muted px-1 py-0.5 rounded">npx cap sync</code></li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-2">
                    See <code className="bg-muted px-1 py-0.5 rounded">ENV_SETUP.md</code> for detailed instructions.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.handleReload}>Reload Page</Button>
                {isEnvError && (
                  <Button variant="outline" onClick={() => console.log('Environment check:', {
                    VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
                    VITE_SUPABASE_PUBLISHABLE_KEY: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                  })}>
                    Check Console
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

