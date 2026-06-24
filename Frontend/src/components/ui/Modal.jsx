import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sizes = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          <motion.div
            className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.38)] ${sizes[size] || sizes.md}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.16 }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-[#E95520]/10 hover:text-[#E95520] focus:outline-none focus:ring-2 focus:ring-[#E95520]/20"
            >
              <X className="h-5 w-5" />
            </button>
            {title && (
              <h2 id="modal-title" className="pr-10 text-xl font-semibold text-slate-900">
                {title}
              </h2>
            )}
            <div className={title ? 'mt-4' : ''}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
