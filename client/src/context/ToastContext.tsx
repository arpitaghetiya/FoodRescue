import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (title: string, type?: ToastType, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, type: ToastType = 'info', message?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, title, type, message }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast(title, 'success', message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast(title, 'error', message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast(title, 'info', message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Toast Overlay Container */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`pointer-events-auto rounded-2xl p-4 shadow-soft-xl border flex items-start space-x-3 backdrop-blur-md ${
                  isSuccess
                    ? 'bg-white/95 border-emerald-200 text-darktext'
                    : isError
                    ? 'bg-white/95 border-rose-200 text-darktext'
                    : 'bg-white/95 border-mint text-darktext'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isSuccess
                      ? 'bg-mint text-forest'
                      : isError
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-brand-50 text-darkgreen'
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isError ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 pt-0.5">
                  <h4 className="text-sm font-bold text-darktext leading-tight">{toast.title}</h4>
                  {toast.message && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.message}</p>
                  )}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-darktext p-1 rounded-lg hover:bg-surface-100 transition-colors"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

