import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Activity,
  Eye,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  Smartphone,
  PieChart,
  Zap,
  Target,
  Search,
  X,
  Globe,
  HelpCircle,
  MapPin,
  Briefcase,
  TrendingUp,
  Lightbulb,
  Calendar
} from 'lucide-react';
import {
  PieChart as RPieChart,
  Pie,
  Cell,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend as RLegend,
  AreaChart,
  Area,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const InfoTip = ({ text }) => (
  <span
    className="inline-flex items-center text-gray-300 hover:text-indigo-500 cursor-help align-middle"
    title={text}
  >
    <HelpCircle size={13} />
  </span>
);

const formatHour = (h) => {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || entry.payload?.fill }}>
          <span className="font-medium">{entry.name || entry.payload?.name}:</span>{' '}
          <span className="font-bold">
            {Number(entry.value).toLocaleString('en-IN')}
          </span>
          {entry.payload?.percentage != null && (
            <span className="text-gray-400 ml-1">({entry.payload.percentage}%)</span>
          )}
        </p>
      ))}
    </div>
  );
};

const HorizontalBarChart = ({
  items,
  valueKey = 'count',
  labelKey = 'name',
  color = '#6366f1',
  height = 260,
  emptyText = 'No data',
}) => {
  if (!items || items.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-xs text-gray-400"
      >
        {emptyText}
      </div>
    );
  }
  const data = items.map((it) => ({
    ...it,
    name: String(it[labelKey] ?? '').slice(0, 24),
    value: it[valueKey] || 0,
  }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 30, left: 4, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <RTooltip content={<ChartTooltip />} cursor={{ fill: '#f9fafb' }} />
          <Bar dataKey="value" name="Users" fill={color} radius={[0, 6, 6, 0]}>
            <LabelList
              dataKey="value"
              position="right"
              style={{ fontSize: 11, fill: '#6b7280' }}
              formatter={(v) => Number(v).toLocaleString('en-IN')}
            />
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const VerticalBarChart = ({
  items,
  valueKey = 'count',
  labelKey = 'name',
  color = '#10b981',
  height = 240,
  emptyText = 'No data',
}) => {
  if (!items || items.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-xs text-gray-400"
      >
        {emptyText}
      </div>
    );
  }
  const data = items.map((it) => ({
    ...it,
    name: String(it[labelKey] ?? ''),
    value: it[valueKey] || 0,
  }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <RTooltip content={<ChartTooltip />} cursor={{ fill: '#f9fafb' }} />
          <Bar dataKey="value" name="Users" fill={color} radius={[6, 6, 0, 0]}>
            <LabelList
              dataKey="value"
              position="top"
              style={{ fontSize: 11, fill: '#6b7280' }}
              formatter={(v) => Number(v).toLocaleString('en-IN')}
            />
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DonutChart = ({
  items,
  valueKey = 'count',
  labelKey = 'name',
  colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#9ca3af'],
  height = 240,
  emptyText = 'No data',
  centerLabel,
  centerValue,
}) => {
  const filtered = (items || []).filter((it) => (it[valueKey] || 0) > 0);
  if (filtered.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-xs text-gray-400"
      >
        {emptyText}
      </div>
    );
  }
  const data = filtered.map((it) => ({
    ...it,
    name: it[labelKey],
    value: it[valueKey] || 0,
  }));
  return (
    <div style={{ height }} className="relative">
      <ResponsiveContainer width="100%" height="100%">
        <RPieChart>
          <RTooltip content={<ChartTooltip />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <RLegend
            verticalAlign="bottom"
            height={28}
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
          />
        </RPieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue != null) && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ marginTop: -14 }}
        >
          {centerValue != null && (
            <p className="text-2xl font-bold text-gray-800">
              {Number(centerValue).toLocaleString('en-IN')}
            </p>
          )}
          {centerLabel && (
            <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
              {centerLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const InsightCard = ({ title, icon: Icon, accent = 'indigo', tooltip, children }) => {
  const accentText = {
    indigo: 'text-indigo-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    rose: 'text-rose-500',
    violet: 'text-violet-500',
    sky: 'text-sky-500',
  }[accent] || 'text-indigo-500';
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className={`w-4 h-4 ${accentText}`} />}
        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
          {title}
          {tooltip && <InfoTip text={tooltip} />}
        </h4>
      </div>
      {children}
    </div>
  );
};

const MarketingInsights = ({ data }) => {
  const {
    totalUsers,
    topCities,
    topStates,
    deviceTypes,
    genderSplit,
    ageGroups,
    incomeRanges,
    jobTypes,
    peakHours,
    engagementBySource,
    topEntryPages,
    recommendations,
  } = data;

  const peakSorted = [...(peakHours || [])]
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const genderTotal =
    (genderSplit?.male || 0) +
    (genderSplit?.female || 0) +
    (genderSplit?.other || 0) +
    (genderSplit?.unknown || 0);

  const genderRows = [
    { label: 'Male', count: genderSplit?.male || 0, color: '#6366f1' },
    { label: 'Female', count: genderSplit?.female || 0, color: '#ec4899' },
    { label: 'Other', count: genderSplit?.other || 0, color: '#f59e0b' },
    { label: 'Unknown', count: genderSplit?.unknown || 0, color: '#9ca3af' },
  ].filter((r) => r.count > 0);

  return (
    <div className="space-y-4">
      {/* Marketing recommendations banner */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-pink-50 rounded-xl border border-indigo-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-semibold text-gray-800">
              Marketing Playbook
            </h3>
            <InfoTip text="Auto-generated recommendations based on the active user data. Use these as starting hypotheses for ad campaigns — not absolute truth. Refresh to recompute." />
            <span className="ml-auto text-[11px] uppercase tracking-wide text-indigo-500 font-semibold bg-white/60 px-2 py-1 rounded-full">
              For Ads Team
            </span>
          </div>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <TrendingUp size={14} className="mt-0.5 text-emerald-500 flex-shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Peak hours callout + 24h heatmap */}
      {peakSorted.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
              Typical Engagement by Hour
              <InfoTip text="This is a LIFETIME pattern, not today's activity. Each bar shows total activities ever recorded at that hour-of-day across all currently-active users. Future hours can show counts because they reflect prior days' activity at that hour. Use this as your ad/push scheduling baseline — when do users typically engage." />
            </h4>
            <span
              className="ml-auto text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded"
              title="The y-axis aggregates activity across all days, not just today. A future hour can show data because users have engaged in that hour on previous days."
            >
              Lifetime pattern
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {peakSorted.map((p, i) => (
              <div
                key={p.hour}
                className="flex items-center gap-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100"
                title={`${p.count.toLocaleString('en-IN')} activities recorded around ${formatHour(p.hour)} IST`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                  #{i + 1}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {formatHour(p.hour)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {p.count.toLocaleString('en-IN')} activities
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={(peakHours || []).map((p) => ({
                  hour: formatHour(p.hour),
                  rawHour: p.hour,
                  activities: p.count || 0,
                  isPeak: p.isPeak,
                }))}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  interval={2}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <RTooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="activities"
                  name="Activities"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#peakGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Geo + Device row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InsightCard
          title="Top Cities"
          icon={MapPin}
          accent="rose"
          tooltip="Cities with the most active users in the last 24h. Use for geo-targeted ad campaigns (Google Geo, Meta location targeting). Higher count = lower CPC for that city."
        >
          <HorizontalBarChart
            items={(topCities || []).slice(0, 8).map((c) => ({
              name: c.city,
              count: c.count,
              percentage: c.percentage,
            }))}
            color="#f43f5e"
            emptyText="No city data — most users haven't filled their profile."
          />
        </InsightCard>

        <InsightCard
          title="Top States"
          icon={MapPin}
          accent="violet"
          tooltip="State-level breakdown — useful for region-specific creatives (language, festivals) and to set up region-based ad sets in Meta / Google."
        >
          <HorizontalBarChart
            items={(topStates || []).slice(0, 8).map((s) => ({
              name: s.state,
              count: s.count,
              percentage: s.percentage,
            }))}
            color="#8b5cf6"
            emptyText="No state data."
          />
        </InsightCard>

        <InsightCard
          title="Device Types"
          icon={Smartphone}
          accent="sky"
          tooltip="Active users split by device. iOS-heavy = Apple Search Ads + premium creative. Android-heavy = Google UAC + value-led creative. Web-heavy = invest in SEO and retargeting."
        >
          <DonutChart
            items={(deviceTypes || []).map((d) => ({
              name: d.type,
              count: d.count,
              percentage: d.percentage,
            }))}
            colors={['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#9ca3af']}
            centerLabel="Devices"
            centerValue={(deviceTypes || []).reduce((s, d) => s + (d.count || 0), 0)}
            emptyText="No device data."
          />
        </InsightCard>
      </div>

      {/* Demographics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <InsightCard
          title="Gender Split"
          icon={Users}
          accent="indigo"
          tooltip="Audience gender mix from registered profiles. Use to tune ad creative and Meta audience targeting (gender filter)."
        >
          {genderTotal > 0 ? (
            <DonutChart
              items={genderRows.map((r) => ({
                name: r.label,
                count: r.count,
                percentage: Math.round((r.count / genderTotal) * 100),
              }))}
              colors={genderRows.map((r) => r.color)}
              centerLabel="Total"
              centerValue={genderTotal}
            />
          ) : (
            <div
              style={{ height: 240 }}
              className="flex items-center justify-center text-xs text-gray-400"
            >
              No gender data.
            </div>
          )}
        </InsightCard>

        <InsightCard
          title="Age Groups"
          icon={Users}
          accent="emerald"
          tooltip="Active users grouped by age (computed from dateOfBirth). Use for age-targeted ad sets and to pick creative tone (Gen Z vs Millennial vs older)."
        >
          <VerticalBarChart
            items={(ageGroups || []).map((a) => ({
              name: a.range,
              count: a.count,
              percentage: a.percentage,
            }))}
            color="#10b981"
            emptyText="No age data."
          />
        </InsightCard>

        <InsightCard
          title="Income Ranges"
          icon={Briefcase}
          accent="amber"
          tooltip="Self-reported monthly income. High-income clusters are good for premium offers, low-income for instant-loan / small-ticket creatives."
        >
          <HorizontalBarChart
            items={(incomeRanges || []).slice(0, 6).map((i) => ({
              name: i.range,
              count: i.count,
              percentage: i.percentage,
            }))}
            color="#f59e0b"
            emptyText="No income data."
          />
        </InsightCard>
      </div>

      {/* Job types + entry pages row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InsightCard
          title="Job Types"
          icon={Briefcase}
          accent="violet"
          tooltip="Salaried vs self-employed split. Use to pick the right loan-product creative (PL for salaried, business loan for self-employed)."
        >
          <HorizontalBarChart
            items={(jobTypes || []).slice(0, 6).map((j) => ({
              name: j.type,
              count: j.count,
              percentage: j.percentage,
            }))}
            color="#8b5cf6"
            emptyText="No job data."
          />
        </InsightCard>

        <InsightCard
          title="Top Entry Pages"
          icon={Eye}
          accent="sky"
          tooltip="The first page users land on in their session. Make sure your ad landing pages match what users are actually entering on — mismatch kills conversion."
        >
          <HorizontalBarChart
            items={(topEntryPages || []).map((p) => ({
              name: p.path,
              count: p.count,
              percentage: p.percentage,
            }))}
            color="#0ea5e9"
            emptyText="No entry page data."
          />
        </InsightCard>
      </div>

      {/* Acquisition channel performance */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
            Acquisition Channel Performance
            <InfoTip text="Engagement metrics by acquisition source. Higher avg page views and session minutes = stickier channel — invest more there. Avg actions = how interactive the user is (button clicks, form submits)." />
          </h4>
          <span className="ml-auto text-[11px] text-gray-400">
            Compare App vs Web stickiness
          </span>
        </div>
        {(() => {
          const app = engagementBySource?.app || {
            users: 0,
            avgPageViews: 0,
            avgActions: 0,
            avgSessionMinutes: 0,
          };
          const web = engagementBySource?.web || {
            users: 0,
            avgPageViews: 0,
            avgActions: 0,
            avgSessionMinutes: 0,
          };
          const compareData = [
            {
              metric: 'Avg Page Views',
              App: Number(app.avgPageViews || 0),
              Web: Number(web.avgPageViews || 0),
            },
            {
              metric: 'Avg Actions',
              App: Number(app.avgActions || 0),
              Web: Number(web.avgActions || 0),
            },
            {
              metric: 'Avg Session (min)',
              App: Number(app.avgSessionMinutes || 0),
              Web: Number(web.avgSessionMinutes || 0),
            },
          ];
          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RBarChart
                    data={compareData}
                    margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
                    barGap={8}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="metric"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RTooltip content={<ChartTooltip />} cursor={{ fill: '#f9fafb' }} />
                    <RLegend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
                    <Bar dataKey="App" fill="#6366f1" radius={[6, 6, 0, 0]}>
                      <LabelList
                        dataKey="App"
                        position="top"
                        style={{ fontSize: 10, fill: '#6366f1', fontWeight: 600 }}
                        formatter={(v) => Number(v).toFixed(1)}
                      />
                    </Bar>
                    <Bar dataKey="Web" fill="#10b981" radius={[6, 6, 0, 0]}>
                      <LabelList
                        dataKey="Web"
                        position="top"
                        style={{ fontSize: 10, fill: '#10b981', fontWeight: 600 }}
                        formatter={(v) => Number(v).toFixed(1)}
                      />
                    </Bar>
                  </RBarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: 'App',
                    icon: Smartphone,
                    color: '#6366f1',
                    bg: 'bg-indigo-50',
                    data: app,
                  },
                  {
                    label: 'Web',
                    icon: Globe,
                    color: '#10b981',
                    bg: 'bg-emerald-50',
                    data: web,
                  },
                ].map((row) => {
                  const RowIcon = row.icon;
                  return (
                    <div
                      key={row.label}
                      className={`${row.bg} rounded-lg p-3 border border-gray-100`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: `${row.color}26` }}
                        >
                          <RowIcon size={14} style={{ color: row.color }} />
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">
                          {row.label}
                        </span>
                        <span className="ml-auto text-xs text-gray-500 font-semibold">
                          {(row.data.users || 0).toLocaleString('en-IN')} users
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div title="Avg page views per user — content stickiness.">
                          <p
                            className="text-base font-bold"
                            style={{ color: row.color }}
                          >
                            {Number(row.data.avgPageViews || 0).toFixed(1)}
                          </p>
                          <p className="text-[10px] text-gray-500">views</p>
                        </div>
                        <div title="Avg actions per user — interactivity.">
                          <p
                            className="text-base font-bold"
                            style={{ color: row.color }}
                          >
                            {Number(row.data.avgActions || 0).toFixed(1)}
                          </p>
                          <p className="text-[10px] text-gray-500">actions</p>
                        </div>
                        <div title="Avg session length in minutes.">
                          <p
                            className="text-base font-bold"
                            style={{ color: row.color }}
                          >
                            {Number(row.data.avgSessionMinutes || 0).toFixed(0)}
                          </p>
                          <p className="text-[10px] text-gray-500">min</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
        <p className="text-[11px] text-gray-400 mt-3 italic">
          Tip: pair the channel with the highest avg-views with the city/age/device leaders above for the strongest ad set.
        </p>
      </div>

      <div className="text-[11px] text-gray-400 text-right">
        Marketing insights computed from {totalUsers.toLocaleString('en-IN')} active users in the last 24h. Refreshes every 30 sec.
      </div>
    </div>
  );
};
import StatCard from '../../components/dashboard-pro/StatCard';
import TrendChart from '../../components/dashboard-pro/TrendChart';
import SkeletonLoader from '../../components/dashboard-pro/SkeletonLoader';
import { getActivityStats, getLiveUsers, getMarketingInsights } from '../../api-services/Modules/ActiveUsersApi';
import { Link } from 'react-router-dom';

const ActiveUsersDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileOnly, setMobileOnly] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const unwrap = (res) => {
    const body = res?.data;
    if (body == null) return null;
    if (typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
      return body.data;
    }
    return body;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const errors = [];
    try {
      const [statsRes, usersRes, insightsRes] = await Promise.allSettled([
        getActivityStats(mobileOnly, true),
        getLiveUsers(mobileOnly),
        getMarketingInsights(true),
      ]);

      if (statsRes.status === 'fulfilled') {
        const data = unwrap(statsRes.value);
        if (data && typeof data === 'object') {
          setStats(data);
        } else {
          errors.push('Stats response was empty');
          setStats(null);
        }
      } else {
        const reason =
          statsRes.reason?.response?.data?.message ||
          statsRes.reason?.message ||
          'unknown error';
        console.error('[ActiveUsersDashboard] /stats failed:', statsRes.reason);
        errors.push(`Stats: ${reason}`);
      }

      if (usersRes.status === 'fulfilled') {
        const data = unwrap(usersRes.value);
        const list = Array.isArray(data) ? data : [];
        const APP_WEB_DEVICES = new Set(['mobile', 'ios', 'android', 'web']);
        const onlyAppWeb = list.filter((u) =>
          APP_WEB_DEVICES.has(String(u.deviceType || '').toLowerCase())
        );
        setRecentUsers(onlyAppWeb);
      } else {
        // fall through — usersRes errors handled below
      }

      if (insightsRes.status === 'fulfilled') {
        const data = unwrap(insightsRes.value);
        if (data && typeof data === 'object') {
          setInsights(data);
        } else {
          setInsights(null);
        }
      } else {
        console.error(
          '[ActiveUsersDashboard] /marketing-insights failed:',
          insightsRes.reason
        );
        setInsights(null);
      }

      if (usersRes.status === 'rejected') {
        const reason =
          usersRes.reason?.response?.data?.message ||
          usersRes.reason?.message ||
          'unknown error';
        console.error('[ActiveUsersDashboard] /live failed:', usersRes.reason);
        errors.push(`Live users: ${reason}`);
        setRecentUsers([]);
      }

      if (statsRes.status === 'rejected' && usersRes.status === 'rejected') {
        setError(errors.join(' · ') || 'Failed to fetch data from server');
      }
    } catch (err) {
      console.error('[ActiveUsersDashboard] fetch crashed:', err);
      setError(err?.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [mobileOnly]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const activityBreakdownData = useMemo(() => {
    if (!stats?.activityBreakdown) return [];
    const { pageViews, apiCalls, heartbeats, actions } = stats.activityBreakdown;
    return [
      { name: 'Page Views', value: pageViews || 0, color: '#6366f1', icon: Eye },
      { name: 'API Calls', value: apiCalls || 0, color: '#8b5cf6', icon: Zap },
      { name: 'Heartbeats', value: heartbeats || 0, color: '#10b981', icon: Activity },
      { name: 'Actions', value: actions || 0, color: '#f59e0b', icon: Target },
    ].filter(item => item.value > 0);
  }, [stats]);

  const activityByHourData = useMemo(() => {
    const currentHour = currentTime.getHours();
    const hourDataMap = new Map();
    if (stats?.activityByHour) {
      stats.activityByHour.forEach(item => {
        hourDataMap.set(item.hour, item.count || 0);
      });
    }
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      activities: hourDataMap.get(i) || 0,
      isCurrentHour: i === currentHour,
    }));
  }, [stats, currentTime]);

  const isCmsPath = (path) => {
    if (!path) return false;
    const p = String(path).toLowerCase();
    return p.startsWith('cms_') || p.startsWith('cms/') || p === 'cms';
  };

  const topPagesData = useMemo(() => {
    if (!stats?.topPages) return [];
    return stats.topPages
      .filter((item) => item.path !== 'app-init' && item.path !== '/' && !isCmsPath(item.path))
      .slice(0, 8)
      .map((item) => ({
        page: item.path?.split('/').pop() || item.path || 'Unknown',
        visits: item.count || 0,
      }));
  }, [stats]);

  const sourceBreakdown = stats?.sourceBreakdown || { app: 0, web: 0, unknown: 0 };
  const sourceTotal =
    (sourceBreakdown.app || 0) +
    (sourceBreakdown.web || 0) +
    (sourceBreakdown.unknown || 0);

  const currentPageDistribution = useMemo(() => {
    const map = new Map();
    recentUsers.forEach((u) => {
      const raw = u.currentPage;
      if (!raw || isCmsPath(raw)) return;
      const key = String(raw).split('/').pop() || raw;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([page, users]) => ({ page, users }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 8);
  }, [recentUsers]);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return recentUsers.filter((u) => {
      if (statusFilter === 'online' && !u.isOnline) return false;
      if (statusFilter === 'offline' && u.isOnline) return false;
      if (!q) return true;
      const haystack = [
        u.fullName,
        u.phoneNumber,
        u.currentPage,
        u.userId != null ? String(u.userId) : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [recentUsers, searchTerm, statusFilter]);

  const onlineCount = useMemo(
    () => recentUsers.filter((u) => u.isOnline).length,
    [recentUsers]
  );
  const offlineCount = recentUsers.length - onlineCount;
  const filtersActive = searchTerm.trim() !== '' || statusFilter !== 'all';

  if (loading && !stats) {
    return (
      <div className="space-y-6 p-1">
        <SkeletonLoader variant="card" count={4} />
        <SkeletonLoader variant="chart" count={2} />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchData}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Users Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">Real-time user activity monitoring</p>
            <span className="text-xs text-gray-400">|</span>
            <div className="flex items-center gap-1 text-sm text-indigo-600 font-medium">
              <Clock size={14} />
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOnly(!mobileOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mobileOnly
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            <Smartphone size={14} />
            Mobile Only
            <span className={`w-2 h-2 rounded-full ${mobileOnly ? 'bg-indigo-500' : 'bg-gray-400'}`} />
          </button>
          <Link
            to="/active-users-list"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <Users size={14} />
            View All Users
          </Link>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards — actionable, marketing-focused */}
      {(() => {
        // Reconcile two truth sources:
        //   - stats endpoint  → user_activity_summary (DB writes only)
        //   - live endpoint   → Redis presence ∪ DB (matches what user sees
        //                       in "Recently Active Users" table)
        // Mobile-app heartbeats only hit Redis, so they raise the live count
        // without touching the DB. Always trust the larger of the two.
        const dbActive = stats?.totalActiveUsers24h || 0;
        const liveActive = recentUsers.length;
        const totalActive = Math.max(dbActive, liveActive);

        const dbOnline = stats?.onlineUsersNow || 0;
        const liveOnline = recentUsers.filter((u) => u.isOnline).length;
        const onlineNow = Math.max(dbOnline, liveOnline);

        // App / Web split — prefer live users (deviceType-based, matches table).
        // Fallback to stats.sourceBreakdown if live count is empty.
        const liveAppUsers = recentUsers.filter((u) => {
          const dt = String(u.deviceType || '').toLowerCase();
          return dt === 'mobile' || dt === 'ios' || dt === 'android';
        }).length;
        const liveWebUsers = recentUsers.filter(
          (u) => String(u.deviceType || '').toLowerCase() === 'web'
        ).length;
        const appUsers =
          liveActive > 0 ? liveAppUsers : stats?.sourceBreakdown?.app || 0;
        const webUsers =
          liveActive > 0 ? liveWebUsers : stats?.sourceBreakdown?.web || 0;

        const totalPV = stats?.activityBreakdown?.pageViews || 0;
        const activeLast1h =
          stats?.engagementFunnel?.find((s) => s.stage === 'Active (1h)')
            ?.count || 0;
        const avgPagesPerUser =
          totalActive > 0 ? (totalPV / totalActive).toFixed(1) : '0';

        // Weighted avg session minutes across app + web (from insights endpoint)
        const eng = insights?.engagementBySource;
        const appU = eng?.app?.users || 0;
        const webU = eng?.web?.users || 0;
        const totalEngU = appU + webU;
        const avgSessionMin =
          totalEngU > 0
            ? (
                ((eng?.app?.avgSessionMinutes || 0) * appU +
                  (eng?.web?.avgSessionMinutes || 0) * webU) /
                totalEngU
              ).toFixed(0)
            : '0';

        const appPct =
          totalActive > 0 ? Math.round((appUsers / totalActive) * 100) : 0;
        const webPct =
          totalActive > 0 ? Math.round((webUsers / totalActive) * 100) : 0;
        const onlinePct =
          totalActive > 0
            ? Math.round(((stats?.onlineUsersNow || 0) / totalActive) * 100)
            : 0;
        const last1hPct =
          totalActive > 0
            ? Math.round((activeLast1h / totalActive) * 100)
            : 0;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div title="App + Web users with a heartbeat in the last 5 minutes. Counted from Redis presence (real-time) — the same source as the live users table below. Use this as your real-time engagement gauge during campaigns / pushes.">
              <StatCard
                title="Online Now"
                value={onlineNow}
                icon={Wifi}
                color="success"
                format="number"
                subtitle={
                  totalActive > 0
                    ? `${onlinePct}% of today's users still active`
                    : 'Active in last 5 min'
                }
                to="/live-users"
              />
            </div>
            <div title="Unique App + Web users with any activity in the last 24 hours — your DAU. Counted as the larger of (DB user_activity_summary) and (live Redis ∪ DB), so heartbeat-only mobile users still register.">
              <StatCard
                title="Active Users (24h)"
                value={totalActive}
                icon={Users}
                color="primary"
                format="number"
                subtitle={`${appUsers} app · ${webUsers} web`}
                to="/active-users-list"
              />
            </div>
            <div title="Users active in the last hour. Spike here = ad campaign or push working. Drop here vs Active 24h = users not engaging continuously.">
              <StatCard
                title="Active Last 1h"
                value={activeLast1h}
                icon={Clock}
                color="warning"
                format="number"
                subtitle={
                  totalActive > 0
                    ? `${last1hPct}% of today's users in last hour`
                    : 'Users active in last hour'
                }
                to="/active-users-list"
              />
            </div>
            <div title="Users acquired via the mobile app (iam_sources.source IS NULL or not 'web'). Same definition as /app-lead-tracker.">
              <StatCard
                title="App Users (24h)"
                value={appUsers}
                icon={Smartphone}
                color="primary"
                format="number"
                subtitle={
                  totalActive > 0
                    ? `${appPct}% of active users`
                    : 'Mobile app users'
                }
                to="/app-lead-tracker"
              />
            </div>
            <div title="Users acquired via the website (iam_sources.source = 'web'). Same definition as /web-lead-tracker.">
              <StatCard
                title="Web Users (24h)"
                value={webUsers}
                icon={Globe}
                color="success"
                format="number"
                subtitle={
                  totalActive > 0
                    ? `${webPct}% of active users`
                    : 'Website users'
                }
                to="/web-lead-tracker"
              />
            </div>
            <div title="Average page views per active user (Page Views ÷ Active Users 24h). Higher = stickier content. Low number with high traffic = users bouncing.">
              <StatCard
                title="Avg Pages / User"
                value={Number(avgPagesPerUser)}
                icon={Eye}
                color="cyan"
                format="number"
                subtitle={`Avg session ~${avgSessionMin} min`}
                to="/funnel-analytics"
              />
            </div>
          </div>
        );
      })()}

      {/* Source Split */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-1">
                Source Split (24h)
                <InfoTip text="Active users (24h) split by registration source. App = users who signed up via mobile app (principalSource_xid=1). Web = signed up via website (xid=2). Unknown = users without a tagged source." />
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">App vs Web vs Unknown</p>
            </div>
          </div>

          {sourceTotal > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <DonutChart
                items={[
                  {
                    name: 'App',
                    count: sourceBreakdown.app || 0,
                    percentage: Math.round(
                      ((sourceBreakdown.app || 0) / sourceTotal) * 100
                    ),
                  },
                  {
                    name: 'Web',
                    count: sourceBreakdown.web || 0,
                    percentage: Math.round(
                      ((sourceBreakdown.web || 0) / sourceTotal) * 100
                    ),
                  },
                  {
                    name: 'Unknown',
                    count: sourceBreakdown.unknown || 0,
                    percentage: Math.round(
                      ((sourceBreakdown.unknown || 0) / sourceTotal) * 100
                    ),
                  },
                ].filter((d) => d.count > 0)}
                colors={['#6366f1', '#10b981', '#9ca3af']}
                centerLabel="24h Users"
                centerValue={sourceTotal}
                height={260}
              />
              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    label: 'App',
                    count: sourceBreakdown.app || 0,
                    icon: Smartphone,
                    color: '#6366f1',
                    bg: 'bg-indigo-50',
                    text: 'text-indigo-600',
                    tip: 'Users who signed up via the mobile app (principalSource_xid = 1).',
                  },
                  {
                    label: 'Web',
                    count: sourceBreakdown.web || 0,
                    icon: Globe,
                    color: '#10b981',
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-600',
                    tip: 'Users who signed up via the website (principalSource_xid = 2).',
                  },
                  {
                    label: 'Unknown',
                    count: sourceBreakdown.unknown || 0,
                    icon: HelpCircle,
                    color: '#9ca3af',
                    bg: 'bg-gray-50',
                    text: 'text-gray-600',
                    tip: 'Users without a recorded principalSource_xid (NULL or other). Often older accounts or admin users.',
                  },
                ].map((row) => {
                  const pct = Math.round(
                    ((row.count || 0) / sourceTotal) * 100
                  );
                  const RowIcon = row.icon;
                  return (
                    <div
                      key={row.label}
                      className={`flex items-center gap-3 ${row.bg} rounded-lg p-3 border border-gray-100`}
                      title={row.tip}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${row.color}26` }}
                      >
                        <RowIcon size={18} style={{ color: row.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <p className={`text-xl font-bold ${row.text}`}>
                            {row.count.toLocaleString('en-IN')}
                          </p>
                          <span className="text-xs text-gray-500 font-semibold">
                            {pct}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {row.label} users
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No app or web users in last 24h
            </div>
          )}
        </div>
      </div>

      {/* Marketing Insights */}
      {insights && insights.totalUsers > 0 && (
        <MarketingInsights data={insights} />
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div title="Lifetime hour-of-day pattern across all currently-active users. Cumulative — a future hour can show data because users have engaged in that hour on previous days. Use as a scheduling baseline, not today's actuals.">
          <TrendChart
            title={`Hourly Engagement Pattern (Now: ${currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })})`}
            subtitle="Typical hour-of-day distribution (lifetime) — for ad / push scheduling"
            type="bar"
            data={activityByHourData}
            xAxisKey="hour"
            dataKeys={[
              { key: 'activities', name: 'Activities', color: '#6366f1' },
            ]}
            height="h-72"
          />
        </div>
        <div title="Most visited app/web screens in the last 24h, ranked by page-view count. CMS pages (anything starting with cms_) are excluded.">
          <TrendChart
            title="Top Pages"
            subtitle="Most visited screens in the app/web (CMS excluded)"
            type="bar"
            data={topPagesData.length > 0 ? topPagesData : [{ page: 'No data', visits: 0 }]}
            xAxisKey="page"
            dataKeys={[
              { key: 'visits', name: 'Visits', color: '#10b981' },
            ]}
            height="h-72"
          />
        </div>
      </div>

      {/* Live Pages */}
      <div title="Real-time snapshot: which pages the currently-loaded set of recent users are on right now. Derived from the live users API, CMS pages excluded.">
        <TrendChart
          title="Live Pages (Recent Users)"
          subtitle="Pages currently being viewed by app/web users (CMS excluded)"
          type="bar"
          data={
            currentPageDistribution.length > 0
              ? currentPageDistribution
              : [{ page: 'No data', users: 0 }]
          }
          xAxisKey="page"
          dataKeys={[{ key: 'users', name: 'Users', color: '#8b5cf6' }]}
          height="h-72"
        />
      </div>

      {/* Activity Breakdown */}
      {activityBreakdownData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-1">
              Activity Type Breakdown
              <InfoTip text="How the 'Total Activities (24h)' number splits across activity types. Page Views = screens opened, API Calls = backend requests, Heartbeats = passive presence pings (sent every ~30s), Actions = user interactions (taps, clicks, form submits)." />
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {activityBreakdownData.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <IconComponent size={24} style={{ color: item.color }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: item.color }}>
                    {((item.value / (stats?.totalActivities24h || 1)) * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm font-medium text-gray-700">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.value.toLocaleString('en-IN')}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/live-users"
          className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 text-white hover:from-emerald-600 hover:to-teal-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <Wifi size={24} />
            <div>
              <p className="font-semibold">Live Users</p>
              <p className="text-sm text-emerald-100">Real-time tracking</p>
            </div>
          </div>
        </Link>
        <Link
          to="/funnel-analytics"
          className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-5 text-white hover:from-indigo-600 hover:to-purple-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <Target size={24} />
            <div>
              <p className="font-semibold">Funnel Analytics</p>
              <p className="text-sm text-indigo-100">Conversion tracking</p>
            </div>
          </div>
        </Link>
        <Link
          to="/active-users-list"
          className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-5 text-white hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          <div className="flex items-center gap-3">
            <Users size={24} />
            <div>
              <p className="font-semibold">All Users</p>
              <p className="text-sm text-orange-100">Full user list</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Active Users */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-gray-800">Recently Active Users</h3>
            <span className="text-xs text-gray-500 ml-1">
              ({filteredUsers.length}
              {filtersActive && filteredUsers.length !== recentUsers.length
                ? ` of ${recentUsers.length}`
                : ''}
              )
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, phone, page, ID"
                className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-2 transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                All ({recentUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('online')}
                className={`px-3 py-2 border-l border-gray-200 transition-colors flex items-center gap-1 ${
                  statusFilter === 'online'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Wifi size={12} />
                Online ({onlineCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('offline')}
                className={`px-3 py-2 border-l border-gray-200 transition-colors flex items-center gap-1 ${
                  statusFilter === 'offline'
                    ? 'bg-gray-700 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <WifiOff size={12} />
                Offline ({offlineCount})
              </button>
            </div>
            <Link
              to="/live-users"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Contact</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Current Page</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.slice(0, 10).map((user, index) => (
                  <tr key={user.userId || index} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.fullName || user.phoneNumber}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-xs font-semibold text-indigo-600">
                              {user.fullName?.[0] || user.phoneNumber?.[0] || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {user.fullName?.trim() || user.phoneNumber || `User #${user.userId}`}
                          </p>
                          <p className="text-xs text-gray-500">ID: {user.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-600 text-xs">{user.phoneNumber || '-'}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {user.isOnline ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          <Wifi size={12} />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          <WifiOff size={12} />
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {user.currentPage || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-gray-500 text-xs">
                        <Clock size={12} />
                        {user.lastActivityAt ? new Date(user.lastActivityAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    {filtersActive
                      ? 'No users match the current filters'
                      : 'No active users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActiveUsersDashboard;
