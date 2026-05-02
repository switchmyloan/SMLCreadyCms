import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Users,
  UserCheck,
  TrendingUp,
  Smartphone,
  Globe,
  Sparkles,
  MousePointerClick,
  CreditCard,
  Bell,
  Send,
  Link as LinkIcon,
  RefreshCcw,
  Calendar,
  Trophy,
  Target,
  Award,
  Info,
} from 'lucide-react';
import ToastNotification from '@components/Notification/ToastNotification';
import { getFunnelOverview } from '../../api-services/Modules/Leads';

const RANGE_OPTIONS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'all', label: 'All time' },
];

const FUNNEL_STAGE_META = [
  { key: 'registered',          label: 'Registered',     color: 'bg-slate-100 text-slate-700',     hex: '#64748b' },
  { key: 'otp_verified',        label: 'OTP Verified',   color: 'bg-blue-100 text-blue-700',       hex: '#3b82f6' },
  { key: 'form_submitted',      label: 'Form Submitted', color: 'bg-cyan-100 text-cyan-700',       hex: '#06b6d4' },
  { key: 'got_offer',           label: 'Got Offer',      color: 'bg-emerald-100 text-emerald-700', hex: '#10b981' },
  { key: 'lender_clicked',      label: 'Lender Clicked', color: 'bg-violet-100 text-violet-700',   hex: '#8b5cf6' },
  { key: 'credit_card_clicked', label: 'Card Clicked',   color: 'bg-amber-100 text-amber-700',     hex: '#f59e0b' },
];

const formatNumber = (n) => Number(n || 0).toLocaleString('en-IN');

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, label, value, sublabel, color = 'indigo' }) => {
  const palette = {
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600' },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600' },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600' },
    slate:   { bg: 'bg-slate-50',   text: 'text-slate-600' },
  }[color] || { bg: 'bg-gray-50', text: 'text-gray-600' };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 tabular-nums">{formatNumber(value)}</p>
          {sublabel && <p className="text-[11px] text-gray-400 mt-1">{sublabel}</p>}
        </div>
        <div className={`p-2 rounded-lg ${palette.bg} shrink-0`}>
          <Icon className={palette.text} size={18} />
        </div>
      </div>
    </motion.div>
  );
};

const FunnelTable = ({ title, counts }) => {
  const total = counts?.total || 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {FUNNEL_STAGE_META.map((s) => {
          const v = counts?.[s.key] || 0;
          const pct = total ? Math.round((v / total) * 100) : 0;
          return (
            <div key={s.key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-gray-600">{s.label}</span>
                <span className="tabular-nums">
                  <span className="font-bold text-gray-900">{formatNumber(v)}</span>
                  <span className="text-gray-400 ml-1.5">({pct}%)</span>
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: s.hex }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FunnelDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('30d');
  const fetchSeq = useRef(0);

  const fetchOverview = useCallback(async () => {
    const seq = ++fetchSeq.current;
    try {
      setLoading(true);
      const response = await getFunnelOverview({ type: range });
      if (seq !== fetchSeq.current) return;
      if (response?.data?.success) {
        setData(response.data.data);
      } else {
        ToastNotification.error('Failed to load dashboard');
      }
    } catch (err) {
      console.error(err);
      if (seq === fetchSeq.current) ToastNotification.error('Dashboard API error');
    } finally {
      if (seq === fetchSeq.current) setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const funnelChartData = useMemo(() => {
    if (!data) return [];
    return FUNNEL_STAGE_META.map((s) => ({
      stage: s.label,
      Combined: data.funnel?.combined?.[s.key] || 0,
      App:      data.funnel?.app?.[s.key] || 0,
      Web:      data.funnel?.web?.[s.key] || 0,
    }));
  }, [data]);

  const genderPie = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Male',    value: data.gender?.male    || 0, color: '#3b82f6' },
      { name: 'Female',  value: data.gender?.female  || 0, color: '#ec4899' },
      { name: 'Other',   value: data.gender?.other   || 0, color: '#a855f7' },
      { name: 'Unknown', value: data.gender?.unknown || 0, color: '#94a3b8' },
    ].filter((d) => d.value > 0);
  }, [data]);

  const ageData = data?.age || [];

  return (
    <motion.div
      className="space-y-5 p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Funnel Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            App + Web funnel, UTM, push notifications, demographics, and lender performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setRange(opt.key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  range === opt.key
                    ? 'bg-white text-indigo-700 shadow-sm border border-indigo-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={Users}      label="Total Leads"     value={data?.totals?.totalLeads}     color="indigo" />
        <StatCard icon={Smartphone} label="App Leads"        value={data?.totals?.appLeads}       color="violet" />
        <StatCard icon={Globe}      label="Web Leads"        value={data?.totals?.webLeads}       color="blue" />
        <StatCard icon={Calendar}   label="Today"            value={data?.totals?.todayLeads}     color="emerald" />
        <StatCard icon={UserCheck}  label="Yesterday"        value={data?.totals?.yesterdayLeads} color="slate" />
      </div>

      {/* Funnel — chart + per-source tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600" /> Funnel — Combined / App / Web
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Combined" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="App"      fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Web"      fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <FunnelTable title="App"      counts={data?.funnel?.app}      />
          <FunnelTable title="Web"      counts={data?.funnel?.web}      />
          <FunnelTable title="Combined" counts={data?.funnel?.combined} />
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Gender</h3>
          {genderPie.length === 0 ? (
            <div className="text-xs text-gray-400 py-12 text-center">No data</div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {genderPie.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Age Distribution</h3>
          {ageData.length === 0 ? (
            <div className="text-xs text-gray-400 py-12 text-center">No data</div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* UTM + Push notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <LinkIcon size={16} className="text-indigo-600" /> Top UTM Sources
          </h3>
          {!data?.topUtmSources?.length ? (
            <div className="text-xs text-gray-400 py-8 text-center">No UTM data in this range</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Source</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Medium</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Campaign</th>
                    <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Leads</th>
                    <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">w/ Offer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.topUtmSources.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2 text-sm text-gray-800">{u.utm_source || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{u.utm_medium || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 truncate max-w-[180px]">{u.utm_campaign || '-'}</td>
                      <td className="px-3 py-2 text-sm font-semibold text-gray-900 text-right tabular-nums">{formatNumber(u.leadCount)}</td>
                      <td className="px-3 py-2 text-sm text-emerald-700 text-right tabular-nums">{formatNumber(u.withOfferCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Bell size={16} className="text-amber-600" /> Push Notifications
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Send}       label="Templates"  value={data?.pushStats?.totalTemplates}    color="indigo" />
            <StatCard icon={Users}      label="Groups"     value={data?.pushStats?.totalGroups}       color="violet" />
            <StatCard icon={UserCheck}  label="Audience"   value={data?.pushStats?.totalAudience}     color="emerald" />
            <StatCard icon={Calendar}   label="Pending"    value={data?.pushStats?.scheduledPending}  color="amber" />
            <StatCard icon={Sparkles}   label="Sent"       value={data?.pushStats?.schedulesSent}     color="emerald" />
            <StatCard icon={MousePointerClick} label="Failed" value={data?.pushStats?.schedulesFailed} color="rose" />
          </div>
        </div>
      </div>

      {/* Lender performance */}
      <LenderPerformance lenders={data?.lenders || []} />
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// Lender Performance — visual rebuild with highlight cards + ranked list
// ----------------------------------------------------------------------

// Conversion % colour bands for the badge
const conversionBand = (pct) => {
  if (pct >= 30) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'High' };
  if (pct >= 10) return { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Medium' };
  if (pct > 0)   return { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    label: 'Low' };
  return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', label: 'No clicks' };
};

// eslint-disable-next-line no-unused-vars
const LenderHighlight = ({ icon: Icon, label, lender, metric, suffix = '', accent = 'indigo' }) => {
  const palette = {
    indigo:  { ring: 'ring-indigo-200',  bg: 'bg-indigo-50',  text: 'text-indigo-700',  iconBg: 'bg-indigo-100' },
    violet:  { ring: 'ring-violet-200',  bg: 'bg-violet-50',  text: 'text-violet-700',  iconBg: 'bg-violet-100' },
    emerald: { ring: 'ring-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
  }[accent];
  if (!lender) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 text-center">
        No data
      </div>
    );
  }
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`p-4 bg-white rounded-xl border ${palette.bg.replace('bg-', 'border-')} ring-1 ${palette.ring} shadow-sm`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${palette.iconBg} shrink-0`}>
          <Icon className={palette.text} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-semibold text-gray-900 truncate" title={lender.name || ''}>
            {lender.name || `#${lender.id || '-'}`}
          </p>
          <p className={`mt-1 text-xl font-bold tabular-nums ${palette.text}`}>
            {formatNumber(metric)}
            {suffix && <span className="text-xs font-medium text-gray-400 ml-1">{suffix}</span>}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const LenderRow = ({ lender, rank, totalOffers, totalClicks }) => {
  const offerShare = totalOffers > 0 ? (lender.offersGiven / totalOffers) * 100 : 0;
  const clickShare = totalClicks > 0 ? (lender.offersClicked / totalClicks) * 100 : 0;
  const conv = conversionBand(lender.conversionPct);
  const initial = (lender.name || '?').trim().charAt(0).toUpperCase();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-12 gap-3 items-center px-3 py-2.5 rounded-lg hover:bg-gray-50/80 border border-transparent hover:border-gray-100"
    >
      {/* Rank + name */}
      <div className="col-span-12 sm:col-span-4 flex items-center gap-2.5 min-w-0">
        <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-500 text-[11px] font-semibold flex items-center justify-center shrink-0">
          {rank}
        </span>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {initial}
        </div>
        <p className="text-sm font-medium text-gray-800 truncate" title={lender.name || ''}>
          {lender.name || `Lender #${lender.id || '-'}`}
        </p>
      </div>

      {/* Offers given + share bar */}
      <div className="col-span-6 sm:col-span-3">
        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
          <span>Offers</span>
          <span className="font-semibold text-gray-900 tabular-nums">{formatNumber(lender.offersGiven)}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(offerShare, 100)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Clicks + share bar */}
      <div className="col-span-6 sm:col-span-3">
        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
          <span>Clicks</span>
          <span className="font-semibold text-violet-700 tabular-nums">{formatNumber(lender.offersClicked)}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(clickShare, 100)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Conversion badge */}
      <div className="col-span-12 sm:col-span-2 flex sm:justify-end">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${conv.bg} ${conv.text} ${conv.border}`}
          title={`${conv.label} conversion`}
        >
          {lender.conversionPct}% <span className="text-[9px] font-normal opacity-70">{conv.label}</span>
        </span>
      </div>
    </motion.div>
  );
};

const LenderPerformance = ({ lenders }) => {
  const sorted = useMemo(
    () => [...lenders].sort((a, b) => (b.offersGiven || 0) - (a.offersGiven || 0)),
    [lenders]
  );

  const totals = useMemo(() => {
    return sorted.reduce(
      (acc, l) => ({
        offers: acc.offers + (l.offersGiven || 0),
        clicks: acc.clicks + (l.offersClicked || 0),
      }),
      { offers: 0, clicks: 0 }
    );
  }, [sorted]);

  const overallConv = totals.offers > 0
    ? Math.round((totals.clicks / totals.offers) * 1000) / 10
    : 0;

  // Pick best by each axis
  const bestByOffers = sorted[0];
  const bestByClicks = useMemo(
    () => [...sorted].sort((a, b) => (b.offersClicked || 0) - (a.offersClicked || 0))[0],
    [sorted]
  );
  // Best conversion needs at least 5 offers to avoid noise from low-volume lenders
  const bestByConversion = useMemo(
    () =>
      [...sorted]
        .filter((l) => (l.offersGiven || 0) >= 5)
        .sort((a, b) => (b.conversionPct || 0) - (a.conversionPct || 0))[0],
    [sorted]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard size={16} className="text-violet-600" /> Lender Performance
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            How each lender stacks up — offers given vs. clicks received, with click-through rate.
          </p>
        </div>

        {/* Overall summary */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
            <span className="text-indigo-700 font-semibold tabular-nums">{formatNumber(totals.offers)}</span>
            <span className="text-gray-500 ml-1">offers</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100">
            <span className="text-violet-700 font-semibold tabular-nums">{formatNumber(totals.clicks)}</span>
            <span className="text-gray-500 ml-1">clicks</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
            <span className="text-emerald-700 font-semibold tabular-nums">{overallConv}%</span>
            <span className="text-gray-500 ml-1">overall CTR</span>
          </div>
        </div>
      </div>

      {!sorted.length ? (
        <div className="text-xs text-gray-400 py-8 text-center">No lender activity in this range</div>
      ) : (
        <>
          {/* Highlight cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <LenderHighlight
              icon={Trophy}
              label="Most Offers"
              lender={bestByOffers}
              metric={bestByOffers?.offersGiven}
              suffix="offers"
              accent="indigo"
            />
            <LenderHighlight
              icon={MousePointerClick}
              label="Most Clicks"
              lender={bestByClicks}
              metric={bestByClicks?.offersClicked}
              suffix="clicks"
              accent="violet"
            />
            <LenderHighlight
              icon={Award}
              label="Best Conversion"
              lender={bestByConversion}
              metric={bestByConversion?.conversionPct}
              suffix="%"
              accent="emerald"
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 mb-2 px-1">
            <span className="flex items-center gap-1">
              <Info size={11} /> Bars show each lender's share of total offers/clicks.
            </span>
            <span className="flex items-center gap-1">
              <Target size={11} /> Conversion % = clicks ÷ offers
            </span>
          </div>

          {/* Ranked list */}
          <div className="space-y-1">
            {sorted.map((l, i) => (
              <LenderRow
                key={l.id ?? l.name ?? i}
                lender={l}
                rank={i + 1}
                totalOffers={totals.offers}
                totalClicks={totals.clicks}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FunnelDashboard;
