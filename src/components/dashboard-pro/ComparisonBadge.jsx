import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const ComparisonBadge = ({ value, period = 'MoM', size = 'sm' }) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';

  if (isNeutral) {
    return (
      <span className={`inline-flex items-center gap-0.5 rounded-full bg-gray-100 text-gray-600 font-medium ${sizeClasses}`}>
        <Minus className="w-3 h-3" />
        <span>0% {period}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-medium ${sizeClasses} ${
        isPositive
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-red-50 text-red-700'
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      <span>
        {isPositive ? '+' : ''}{value?.toFixed(1)}% {period}
      </span>
    </span>
  );
};

export default ComparisonBadge;
