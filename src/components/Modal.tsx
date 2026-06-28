import { useEffect, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Max width utility class, e.g. 'max-w-2xl'. */
  maxWidth?: string;
}

/** Centered overlay dialog: closes on backdrop click or Escape. */
export default function Modal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-lg',
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={onClose}
    >
      <div
        className={`my-auto w-full ${maxWidth} animate-pop-in rounded-3xl bg-white shadow-pop`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
