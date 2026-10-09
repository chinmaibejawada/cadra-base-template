import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
}

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger' }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="mb-6 text-sm text-gray-600">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
            variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-prairie-600 hover:bg-prairie-700'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}