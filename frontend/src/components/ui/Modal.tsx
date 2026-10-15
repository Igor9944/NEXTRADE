import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

type ModalSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    firstFocusRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-nextrade-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={cn(
          'relative w-full rounded-xl3 bg-white shadow-modal',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="border-b border-nextrade-border px-6 py-4">
            {title && (
              <h2 id="modal-title" className="text-lg font-bold text-nextrade-ink">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-nextrade-muted">{description}</p>
            )}
          </div>
        )}
        {/* Bouton fermer */}
        <button
          ref={firstFocusRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute end-4 top-4 rounded-lg p-1 text-nextrade-muted hover:bg-slate-100 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Contenu */}
        {children && <div className="px-6 py-5">{children}</div>}
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-nextrade-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Modal de confirmation ─── */

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'destructive';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmVariant = 'primary',
  loading = false,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  />
);
