'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    const newToast: Toast = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Fixed Toast Container matching NEW UI */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map(t => {
          let icon = 'info';
          let borderClass = 'border-l-info';
          let iconColor = 'text-info';

          if (t.type === 'success') {
            icon = 'check_circle';
            borderClass = 'border-l-success';
            iconColor = 'text-success';
          } else if (t.type === 'warning') {
            icon = 'warning';
            borderClass = 'border-l-warning';
            iconColor = 'text-warning';
          } else if (t.type === 'error') {
            icon = 'cancel';
            borderClass = 'border-l-danger';
            iconColor = 'text-danger';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto min-w-[320px] max-w-md bg-white p-3.5 px-4 rounded-xl shadow-xl border border-outline-variant border-l-4 ${borderClass} flex items-center gap-3 animate-slide-in text-sm font-medium text-on-surface`}
            >
              <span className={`material-symbols-outlined icon-fill ${iconColor} text-[20px] shrink-0`}>
                {icon}
              </span>
              <span className="flex-1 leading-snug">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
