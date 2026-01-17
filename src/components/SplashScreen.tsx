import { motion } from 'framer-motion';

export const SplashScreen = ({ name }: { name: string }) => {
    return (
        <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-4"
            >
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Welcome {name}
                </h1>
                <p className="text-muted-foreground">
                    Setting up your dashboard...
                </p>
            </motion.div>
        </div>
    );
};
