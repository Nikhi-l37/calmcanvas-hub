import { motion } from 'framer-motion';
import { Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';

export const InstallPWAButton = () => {
  const { canInstall, isInstalled, installPWA } = usePWA();
  const { toast } = useToast();

  if (isInstalled || !canInstall) return null;

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      toast({
        title: "App Installed!",
        description: "Screen Coach Hub is now available as an app on your device.",
      });
    } else {
      toast({
        title: "Installation cancelled",
        description: "You can install the app later from your browser menu.",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <Button
        onClick={handleInstall}
        className="bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground shadow-glow"
        size="sm"
      >
        <Download className="w-4 h-4 mr-2" />
        <span className="hidden md:inline">Install App</span>
        <Smartphone className="w-4 h-4 md:hidden" />
      </Button>
    </motion.div>
  );
};