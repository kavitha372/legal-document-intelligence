import {
  extractionStatusLabel, extractionStatusBadge,
  reviewStatusLabel, reviewStatusBadge,
  detectionStatusLabel, detectionStatusBadge,
  roleLabel, roleBadge,
} from '../../utils/formatters';

type BadgeType = 'extraction' | 'review' | 'detection' | 'role';

interface Props { type: BadgeType; value: string; }

export default function StatusBadge({ type, value }: Props) {
  let label = value;
  let className = 'badge';
  switch (type) {
    case 'extraction':
      label = extractionStatusLabel(value);
      className += ' ' + extractionStatusBadge(value);
      break;
    case 'review':
      label = reviewStatusLabel(value);
      className += ' ' + reviewStatusBadge(value);
      break;
    case 'detection':
      label = detectionStatusLabel(value);
      className += ' ' + detectionStatusBadge(value);
      break;
    case 'role':
      label = roleLabel(value);
      className += ' ' + roleBadge(value);
      break;
  }
  return <span className={className}>{label}</span>;
}
