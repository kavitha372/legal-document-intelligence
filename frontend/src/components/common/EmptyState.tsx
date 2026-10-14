import { FileText } from 'lucide-react';
interface Props { title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode; }
export default function EmptyState({ title, description, action, icon }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon || <FileText />}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
