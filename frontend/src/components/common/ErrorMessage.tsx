import { AlertCircle, X } from 'lucide-react';

interface Props { message: string; onDismiss?: () => void; }

export default function ErrorMessage({ message, onDismiss }: Props) {
  return (
    <div className="alert alert-danger" role="alert">
      <AlertCircle size={16} />
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="btn btn-icon btn-ghost btn-sm" aria-label="Dismiss error">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
