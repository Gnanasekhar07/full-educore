import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
}

let toastId = 0;
const listeners: Set<(toast: ToastMessage) => void> = new Set();

// Global toast trigger function
export const toast = {
    success: (title: string, message?: string) => {
        const t: ToastMessage = { id: ++toastId, type: 'success', title, message };
        listeners.forEach(fn => fn(t));
    },
    error: (title: string, message?: string) => {
        const t: ToastMessage = { id: ++toastId, type: 'error', title, message };
        listeners.forEach(fn => fn(t));
    },
    info: (title: string, message?: string) => {
        const t: ToastMessage = { id: ++toastId, type: 'info', title, message };
        listeners.forEach(fn => fn(t));
    }
};

const iconMap = {
    success: <CheckCircle2 size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />,
};

const bgMap = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
};

const ToastContainer = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((t: ToastMessage) => {
        setToasts(prev => [...prev, t]);
        setTimeout(() => {
            setToasts(prev => prev.filter(item => item.id !== t.id));
        }, 4000);
    }, []);

    useEffect(() => {
        listeners.add(addToast);
        return () => { listeners.delete(addToast); };
    }, [addToast]);

    const dismiss = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed top-6 right-6 z-[200] space-y-3 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: 80, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md ${bgMap[t.type]}`}
                    >
                        <div className="flex-shrink-0 mt-0.5">{iconMap[t.type]}</div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-slate-900">{t.title}</div>
                            {t.message && <div className="text-xs text-slate-500 mt-0.5">{t.message}</div>}
                        </div>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
