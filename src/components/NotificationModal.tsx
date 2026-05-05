import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export default function NotificationModal({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  message 
}: NotificationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl ${
                type === 'success' ? 'bg-green-500 text-white shadow-green-500/20' :
                type === 'error' ? 'bg-red-500 text-white shadow-red-500/20' :
                'bg-blue-500 text-white shadow-blue-500/20'
              }`}>
                {type === 'success' && <CheckCircle2 size={40} />}
                {type === 'error' && <AlertCircle size={40} />}
                {type === 'info' && <Info size={40} />}
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                {message}
              </p>

              {/* Close/Action Button */}
              <button
                onClick={onClose}
                className={`mt-8 w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg ${
                  type === 'success' ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' :
                  type === 'error' ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' :
                  'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                }`}
              >
                Tutup
              </button>
            </div>
            
            {/* Close Icon */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
