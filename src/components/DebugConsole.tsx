import React, { useState, useEffect } from 'react';
import { X, Trash2, Minimize2, Maximize2 } from 'lucide-react';

export const DebugConsole = () => {
    const [logs, setLogs] = useState<{ type: 'log' | 'error' | 'warn'; message: string; timestamp: string }[]>([]);
    const [isVisible, setIsVisible] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            originalLog(...args);
            addLog('log', args);
        };

        console.error = (...args) => {
            originalError(...args);
            addLog('error', args);
        };

        console.warn = (...args) => {
            originalWarn(...args);
            addLog('warn', args);
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    const addLog = (type: 'log' | 'error' | 'warn', args: any[]) => {
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');

        setLogs(prev => [...prev.slice(-49), { type, message, timestamp: new Date().toLocaleTimeString() }]);
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed z-50 bg-black/80 text-white font-mono text-xs overflow-hidden flex flex-col transition-all duration-300 ${isMinimized
                ? 'bottom-4 right-4 w-12 h-12 rounded-full'
                : 'bottom-0 left-0 right-0 h-1/2 rounded-t-xl'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-green-400">Debug Console</span>
                    <span className="text-gray-400 text-[10px]">{logs.length} logs</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setLogs([])} className="p-1 hover:bg-gray-700 rounded"><Trash2 size={14} /></button>
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-gray-700 rounded">
                        {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                    </button>
                    <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-gray-700 rounded"><X size={14} /></button>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="flex-1 overflow-auto p-2 space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className={`border-b border-gray-800 pb-1 ${log.type === 'error' ? 'text-red-400' :
                                log.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'
                            }`}>
                            <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                            <pre className="whitespace-pre-wrap break-words inline">{log.message}</pre>
                        </div>
                    ))}
                    {logs.length === 0 && <div className="text-gray-500 italic text-center mt-4">No logs yet...</div>}
                </div>
            )}
        </div>
    );
};
