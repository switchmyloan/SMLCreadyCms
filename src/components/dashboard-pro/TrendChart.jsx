import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{Number(entry.value).toLocaleString('en-IN')}</span>
        </p>
      ))}
    </div>
  );
};

const TrendChart = ({
  title,
  subtitle,
  type = 'area',
  data = [],
  dataKeys = [],
  height = 'h-72',
  xAxisKey = 'date',
  gradient = true,
  showLegend = true,
  className = '',
}) => {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    const commonAxisProps = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 10000000 ? `${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v / 100000).toFixed(0)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
      </>
    );

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {commonAxisProps}
            {dataKeys.map((dk) => (
              <Bar
                key={dk.key}
                dataKey={dk.key}
                name={dk.name || dk.key}
                fill={dk.color}
                radius={[4, 4, 0, 0]}
                stackId={dk.stackId}
              />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart {...commonProps}>
            {commonAxisProps}
            {dataKeys.map((dk) => (
              <Line
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.name || dk.key}
                stroke={dk.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {commonAxisProps}
            {gradient && (
              <defs>
                {dataKeys.filter(dk => dk.chartType === 'area').map((dk) => (
                  <linearGradient key={`grad-${dk.key}`} id={`grad-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dk.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dk.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
            )}
            {dataKeys.map((dk) => {
              if (dk.chartType === 'bar') {
                return <Bar key={dk.key} dataKey={dk.key} name={dk.name || dk.key} fill={dk.color} radius={[4, 4, 0, 0]} />;
              }
              if (dk.chartType === 'line') {
                return <Line key={dk.key} type="monotone" dataKey={dk.key} name={dk.name || dk.key} stroke={dk.color} strokeWidth={2} dot={false} />;
              }
              return (
                <Area
                  key={dk.key}
                  type="monotone"
                  dataKey={dk.key}
                  name={dk.name || dk.key}
                  stroke={dk.color}
                  fill={gradient ? `url(#grad-${dk.key})` : dk.color}
                  fillOpacity={gradient ? 1 : 0.1}
                />
              );
            })}
          </ComposedChart>
        );
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            {gradient && (
              <defs>
                {dataKeys.map((dk) => (
                  <linearGradient key={`grad-${dk.key}`} id={`grad-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dk.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dk.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
            )}
            {commonAxisProps}
            {dataKeys.map((dk) => (
              <Area
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.name || dk.key}
                stroke={dk.color}
                fill={gradient ? `url(#grad-${dk.key})` : dk.color}
                fillOpacity={gradient ? 1 : 0.1}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-5 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h4 className="text-base font-semibold text-gray-800">{title}</h4>}
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
