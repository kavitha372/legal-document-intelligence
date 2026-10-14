interface Props { size?: 'sm' | 'md' | 'lg'; label?: string; }
export default function LoadingSpinner({ size = 'md', label }: Props) {
  return (
    <div className="loading-container">
      <span className={`spinner${size === 'lg' ? ' spinner-lg' : ''}`} role="status" aria-label={label || 'Loading'} />
      {label && <span>{label}</span>}
    </div>
  );
}
