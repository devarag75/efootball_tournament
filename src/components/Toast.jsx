import { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function Toast({ toast, onClose }) {
    const icons = {
        success: <CheckCircle size={18} className="text-emerald-400" />,
        error: <AlertCircle size={18} className="text-red-400" />,
        info: <Info size={18} className="text-[var(--color-accent-400)]" />,
    };

    const bgColors = {
        success: 'border-emerald-400/20',
        error: 'border-red-400/20',
        info: 'border-[var(--color-accent-400)]/20',
    };

    return (
        <div className={`toast-enter glass-card px-4 py-3 flex items-center gap-3 ${bgColors[toast.type]}`}>
            {icons[toast.type]}
            <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={14} />
            </button>
        </div>
    );
}
