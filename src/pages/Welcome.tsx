import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LocalStorage } from '@/services/storage';
import { motion } from 'framer-motion';

export const Welcome = () => {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleContinue = () => {
        if (!name.trim()) return;

        // Save name to settings
        const settings = LocalStorage.getSettings();
        LocalStorage.saveSettings({
            ...settings,
            name: name.trim()
        });

        // Dispatch login event to update App state
        window.dispatchEvent(new Event('user-login'));

        // Navigate to dashboard
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="p-8 space-y-8 border-none shadow-2xl bg-gradient-to-br from-background to-accent/5">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Welcome to Screen Coach
                        </h1>
                        <p className="text-muted-foreground">
                            Your personal digital wellbeing companion.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                What should we call you?
                            </label>
                            <Input
                                id="name"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 text-lg"
                                onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                            />
                        </div>

                        <Button
                            className="w-full h-12 text-lg"
                            onClick={handleContinue}
                            disabled={!name.trim()}
                        >
                            Get Started
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};
