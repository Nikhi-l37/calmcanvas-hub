import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PasswordConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  userEmail: string;
}

export const PasswordConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  userEmail,
}: PasswordConfirmDialogProps) => {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!password) {
      toast({
        title: 'Password Required',
        description: 'Please enter your password to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Verify password by attempting sign-in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (signInError) {
        toast({
          title: 'Incorrect Password',
          description: 'The password you entered is incorrect. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Password verified successfully, proceed with the action
      onConfirm();
      setPassword('');
      onClose();
    } catch (error) {
      console.error('Password verification error:', error);
      toast({
        title: 'Verification Error',
        description: 'An error occurred while verifying your password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              placeholder="Enter your password"
              disabled={isVerifying}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isVerifying}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
