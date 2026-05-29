import { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    setToast({ message, type, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}
