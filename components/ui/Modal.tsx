
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const modalRoot = document.getElementById('root'); // Or a dedicated modal root

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !modalRoot) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // Close on overlay click
    >
      <div
        className={`bg-slate-800 rounded-lg shadow-xl p-6 w-full ${sizeClasses[size]} transform transition-all duration-300 scale-95 opacity-0 animate-modal-appear`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
        style={{ animationName: 'modal-appear-animation', animationDuration: '0.3s', animationFillMode: 'forwards' }}
      >
        {title && (
          <h2 id="modal-title" className="text-xl font-semibold text-sky-300 mb-4 pb-2 border-b border-slate-700">
            {title}
          </h2>
        )}
        <div>{children}</div>
      </div>
      <style>{`
        @keyframes modal-appear-animation {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    modalRoot
  );
};
