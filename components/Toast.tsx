'use client';

import { useEffect } from 'react';
import { RiCheckLine, RiCloseLine, RiErrorWarningLine } from 'react-icons/ri';
import clsx from 'clsx';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 z-50',
        'min-w-[300px] max-w-[400px]',
        'px-4 py-3 rounded-lg shadow-lg',
        'flex items-center gap-3',
        'animate-slide-up',
        type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
      )}
    >
      {type === 'success' ? (
        <RiCheckLine className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
      ) : (
        <RiErrorWarningLine className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
      )}
      
      <p className={clsx(
        'flex-1 text-sm font-medium',
        type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
      )}>
        {message}
      </p>
      
      <button
        onClick={onClose}
        className={clsx(
          'p-1 rounded-md transition-colors',
          type === 'success' ? 'hover:bg-green-200 dark:hover:bg-green-800' : 'hover:bg-red-200 dark:hover:bg-red-800'
        )}
      >
        <RiCloseLine className={clsx(
          'w-4 h-4',
          type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )} />
      </button>
    </div>
  );
}