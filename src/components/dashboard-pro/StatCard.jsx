import ComparisonBadge from './ComparisonBadge';

const colorMap = {
  primary: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'bg-indigo-100' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-100' },
  danger: { bg: 'bg-red-50', text: 'text-red-600', icon: 'bg-red-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'bg-cyan-100' },
};

const formatValue = (value, format, prefix = '', suffix = '') => {
  if (value === null || value === undefined) return '--';

  let formatted;
  switch (format) {
    case 'currency':
      formatted = `₹${Number(value).toLocaleString('en-IN')}`;
      break;
    case 'compact': {
      const num = Number(value);
      if (num >= 10000000) {
        formatted = `₹${(num / 10000000).toFixed(2)} Cr`;
      } else if (num >= 100000) {
        formatted = `₹${(num / 100000).toFixed(2)} L`;
      } else if (num >= 1000) {
        formatted = `₹${(num / 1000).toFixed(1)} K`;
      } else {
        formatted = `₹${num.toLocaleString('en-IN')}`;
      }
      break;
    }
    case 'percentage':
      formatted = `${Number(value).toFixed(1)}%`;
      break;
    case 'number':
    default:
      formatted = Number(value).toLocaleString('en-IN');
      break;
  }

  return `${prefix}${formatted}${suffix}`;
};

const StatCard = ({
  title,
  value,
  previousValue,
  prefix = '',
  suffix = '',
  icon: Icon,
  color = 'primary',
  format = 'number',
  loading = false,
  period = 'MoM',
  subtitle,
}) => {
  const colors = colorMap[color] || colorMap.primary;

  const percentChange =
    previousValue && previousValue !== 0
      ? ((value - previousValue) / previousValue) * 100
      : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-9 w-9 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {Icon && (
          <div className={`p-2 rounded-lg ${colors.icon}`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
        )}
      </div>
      <div className="mb-2">
        <h3 className="text-2xl font-bold text-gray-900">
          {formatValue(value, format, prefix, suffix)}
        </h3>
      </div>
      <div className="flex items-center gap-2">
        {previousValue !== undefined && previousValue !== null && (
          <ComparisonBadge value={percentChange} period={period} />
        )}
        {subtitle && (
          <span className="text-xs text-gray-400">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
