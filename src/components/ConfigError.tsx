import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const ConfigError = () => {
  const [showDetails, setShowDetails] = useState(false);
  
  const missingVars = [];
  if (!import.meta.env.VITE_SUPABASE_URL) missingVars.push('VITE_SUPABASE_URL');
  if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) missingVars.push('VITE_SUPABASE_PUBLISHABLE_KEY');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Configuration Error</CardTitle>
          </div>
          <CardDescription>
            Supabase environment variables are missing or incorrect
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-2">Missing variables:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {missingVars.map(v => (
                <li key={v} className="font-mono">{v}</li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">How to fix:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Create a <code className="bg-background px-1 py-0.5 rounded">.env</code> file in the project root (same folder as <code className="bg-background px-1 py-0.5 rounded">package.json</code>)</li>
              <li>Add your Supabase credentials:
                <pre className="mt-2 p-3 bg-background rounded text-xs overflow-x-auto border border-border">
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here`}
                </pre>
              </li>
              <li>Get your credentials from:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://app.supabase.com</a></li>
                  <li>Select your project → Settings → API</li>
                  <li>Copy Project URL → use for VITE_SUPABASE_URL</li>
                  <li>Copy anon/public key → use for VITE_SUPABASE_PUBLISHABLE_KEY</li>
                </ul>
              </li>
              <li>After creating .env file:
                <ol className="list-lower-alpha list-inside ml-4 mt-1 space-y-1">
                  <li>Rebuild: <code className="bg-background px-1 py-0.5 rounded">npm run build</code></li>
                  <li>Sync Capacitor (for Android): <code className="bg-background px-1 py-0.5 rounded">npx cap sync</code></li>
                  <li>Rebuild in Android Studio</li>
                </ol>
              </li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2">
              📖 See <code className="bg-background px-1 py-0.5 rounded">ENV_SETUP.md</code> for detailed instructions.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
            <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide' : 'Show'} Console Info
            </Button>
          </div>
          
          {showDetails && (
            <div className="p-3 bg-muted rounded text-xs font-mono space-y-1">
              <div>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
              <div>VITE_SUPABASE_PUBLISHABLE_KEY: {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}</div>
              <div className="pt-2 border-t border-border">
                Check browser console (F12) for more debugging information.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

