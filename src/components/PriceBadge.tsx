interface PriceBadgeProps {
  type: 'best-price' | 'best-value' | 'best-storage';
}

export function PriceBadge({ type }: PriceBadgeProps) {
  const getBadgeStyle = () => {
    switch (type) {
      case 'best-price':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'best-value':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'best-storage':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBadgeText = () => {
    switch (type) {
      case 'best-price':
        return 'Meilleur prix';
      case 'best-value':
        return 'Meilleur rapport qualité/prix';
      case 'best-storage':
        return 'Plus de stockage';
      default:
        return '';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}>
      {getBadgeText()}
    </span>
  );
}
