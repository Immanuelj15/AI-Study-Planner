import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const toastStyles = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />,
    borderColor: 'border-l-[#22C55E]',
    bgColor: 'bg-[#FFFFFF]',
    badgeBg: 'bg-[#F0FDF4]',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-[#EF4444] shrink-0" />,
    borderColor: 'border-l-[#EF4444]',
    bgColor: 'bg-[#FFFFFF]',
    badgeBg: 'bg-[#FEE2E2]',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />,
    borderColor: 'border-l-[#F59E0B]',
    bgColor: 'bg-[#FFFFFF]',
    badgeBg: 'bg-[#FEF3C7]',
  },
  info: {
    icon: <Info className="w-5 h-5 text-[#2563EB] shrink-0" />,
    borderColor: 'border-l-[#2563EB]',
    bgColor: 'bg-[#FFFFFF]',
    badgeBg: 'bg-[#EFF6FF]',
  },
};

export default function ToastNotifications({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info;
          const displayMessage = typeof toast.message === 'string' 
            ? toast.message 
            : (toast.message?.detail || toast.message?.message || JSON.stringify(toast.message));

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] ${style.borderColor} border-l-4 shadow-xl text-[#1E293B] font-inter`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl ${style.badgeBg} flex items-center justify-center shrink-0`}>
                  {style.icon}
                </div>
                <p className="text-xs font-semibold leading-relaxed text-[#1E293B] truncate max-w-xs sm:max-w-sm">
                  {displayMessage}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#1E293B] transition-colors shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
