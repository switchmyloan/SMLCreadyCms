import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { maskPhone } from '../../../utils/maskPhone';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ClipboardCheck,
  Sparkles,
  MousePointerClick,
  CreditCard,
  TrendingUp,
  Search,
  Download,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  X,
} from 'lucide-react';
import ToastNotification from '@components/Notification/ToastNotification';
import {
  getAppLeadTracker,
  getAllAppLeadTracker,
  getWebLeadTracker,
  getAllWebLeadTracker,
} from '../../../api-services/Modules/Leads';

/* ============== Animation variants ============== */
const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
};

const cardPop = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
};

const rowSlide = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.18 } },
};

/* ============== Skeleton primitives ============== */
const Shimmer = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-gray-100 rounded ${className}`}>
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

const FunnelSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
    {[...Array(7)].map((_, i) => (
      <div
        key={i}
        className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-7 w-20" />
            {i === 0 && <Shimmer className="h-2.5 w-14" />}
          </div>
          <Shimmer className="w-9 h-9 rounded-lg shrink-0" />
        </div>
        {i !== 0 && (
          <div className="mt-3 space-y-1.5">
            <Shimmer className="h-2.5 w-10" />
            <Shimmer className="h-1 w-full" />
          </div>
        )}
      </div>
    ))}
  </div>
);

const TableSkeleton = ({ rows = 8 }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1100px]">
      <thead>
        <tr className="bg-gray-50/80">
          {[...Array(13)].map((_, i) => (
            <th key={i} className="px-4 py-2.5">
              <Shimmer className="h-3 w-16" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {[...Array(rows)].map((_, r) => (
          <tr key={r}>
            <td className="px-4 py-3">
              <Shimmer className="h-3 w-6" />
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Shimmer className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Shimmer className="h-3 w-28" />
                  <Shimmer className="h-2.5 w-20" />
                </div>
              </div>
            </td>
            {[...Array(3)].map((_, c) => (
              <td key={c} className="px-4 py-3">
                <Shimmer className="h-3 w-14" />
              </td>
            ))}
            {[...Array(6)].map((_, c) => (
              <td key={`b-${c}`} className="px-4 py-3 text-center">
                <Shimmer className="h-5 w-12 mx-auto rounded-full" />
              </td>
            ))}
            <td className="px-4 py-3">
              <Shimmer className="h-3 w-20" />
            </td>
            <td className="px-4 py-3">
              <Shimmer className="h-3 w-20" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ============== Animated count up ============== */
const AnimatedCount = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const start = fromRef.current;
    const duration = 600;
    const startTs = performance.now();
    let frameId = 0;
    const tick = (now) => {
      const elapsed = now - startTs;
      const t = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(start + (target - start) * eased);
      setDisplay(current);
      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);
  return <>{display.toLocaleString()}</>;
};

/* ============== Helpers ============== */
const formatDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatINR = (v) => {
  if (v === null || v === undefined || v === '' || isNaN(Number(v))) return null;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v));
};

const safe = (v) => (v === null || v === undefined || v === '' ? null : v);

/* ============== Funnel Stages ============== */
const FUNNEL_STAGES = [
  { key: 'registered_only',    label: 'Registered',       field: 'registered_only',    icon: UserPlus,          color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-200',   ring: 'ring-slate-400',   barColor: 'bg-slate-500',   iconBg: 'bg-slate-100' },
  { key: 'otp_verified',       label: 'OTP Verified',     field: 'otp_verified',       icon: ShieldCheck,       color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',    ring: 'ring-blue-400',    barColor: 'bg-blue-500',    iconBg: 'bg-blue-100' },
  { key: 'form_submitted',     label: 'Form Submitted',   field: 'form_submitted',     icon: ClipboardCheck,    color: 'text-cyan-600',    bg: 'bg-cyan-50',    border: 'border-cyan-200',    ring: 'ring-cyan-400',    barColor: 'bg-cyan-500',    iconBg: 'bg-cyan-100' },
  { key: 'got_offer',          label: 'Got Offer',        field: 'got_offer',          icon: Sparkles,          color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-400', barColor: 'bg-emerald-500', iconBg: 'bg-emerald-100' },
  { key: 'lender_clicked',     label: 'Lender Clicked',   field: 'lender_clicked',     icon: MousePointerClick, color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200',  ring: 'ring-violet-400',  barColor: 'bg-violet-500',  iconBg: 'bg-violet-100' },
  { key: 'credit_card_clicked',label: 'Credit Card Click',field: 'credit_card_clicked',icon: CreditCard,        color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   ring: 'ring-amber-400',   barColor: 'bg-amber-500',   iconBg: 'bg-amber-100' },
];

/* ============== Funnel Cards ============== */
const FunnelCards = ({ summary, activeStage, onStageClick, loading }) => {
  const total = summary?.total || 0;
  const pct = (val) => (!total ? 0 : Math.round((val / total) * 100));

  if (loading) {
    return <FunnelSkeleton />;
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3"
      variants={containerStagger}
      initial="hidden"
      animate="show"
    >
      {/* Total */}
      <motion.button
        variants={cardPop}
        whileHover={{ y: -3, scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        type="button"
        onClick={() => onStageClick('')}
        className={`group text-left p-4 bg-white rounded-xl border transition-shadow duration-200 hover:shadow-md ${
          activeStage === '' ? 'ring-2 ring-gray-300 border-gray-200 shadow-md' : 'border-gray-100 shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total</p>
            <p className="mt-1.5 text-2xl font-bold text-gray-900 tabular-nums">
              <AnimatedCount value={total} />
            </p>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp size={11} /> Today: <AnimatedCount value={summary?.today || 0} />
            </p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors shrink-0">
            <Users className="text-gray-500" size={18} />
          </div>
        </div>
      </motion.button>

      {FUNNEL_STAGES.map((s) => {
        const Icon = s.icon;
        const val = summary?.[s.field] || 0;
        const isActive = activeStage === s.key;
        const percentage = pct(val);
        return (
          <motion.button
            key={s.key}
            variants={cardPop}
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={() => onStageClick(isActive ? '' : s.key)}
            className={`group text-left p-4 bg-white rounded-xl border transition-shadow duration-200 hover:shadow-md ${
              isActive ? `ring-2 ${s.ring} ${s.border} shadow-md` : 'border-gray-100 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="mt-1.5 text-2xl font-bold text-gray-900 tabular-nums">
                  <AnimatedCount value={val} />
                </p>
              </div>
              <motion.div
                whileHover={{ rotate: [0, -6, 6, 0] }}
                transition={{ duration: 0.4 }}
                className={`p-2 rounded-lg ${s.iconBg} shrink-0`}
              >
                <Icon className={s.color} size={18} />
              </motion.div>
            </div>
            <div className="mt-2.5">
              <span className={`text-[11px] font-semibold ${s.color}`}>{percentage}%</span>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                <motion.div
                  className={`h-full ${s.barColor} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
};

/* ============== Badge ============== */
const Badge = ({ children, variant = 'default' }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger:  'bg-rose-50 text-rose-700 border-rose-200',
    info:    'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    violet:  'bg-violet-50 text-violet-700 border-violet-200',
    default: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${styles[variant]}`}>
      {children}
    </span>
  );
};

const StagePill = ({ row }) => {
  if (row.has_credit_card_clicked) return <Badge variant="warning">Credit Card</Badge>;
  if (row.has_lender_clicked)      return <Badge variant="violet">Lender Clicked</Badge>;
  if (row.has_offer)               return <Badge variant="success">Got Offer</Badge>;
  if (row.has_submitted)           return <Badge variant="info">Submitted</Badge>;
  if (row.has_otp_verified)        return <Badge variant="info">OTP Verified</Badge>;
  return <Badge variant="default">Registered</Badge>;
};

/* ============== Main Component ============== */
const LeadTracker = ({ source = 'mobile', title, subtitle, partnerLabel }) => {
  const isApp = source === 'mobile';
  const fetchPage = isApp ? getAppLeadTracker : getWebLeadTracker;
  const fetchAll = isApp ? getAllAppLeadTracker : getAllWebLeadTracker;

  const [rawData, setRawData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    registered_only: 0,
    otp_verified: 0,
    form_submitted: 0,
    got_offer: 0,
    lender_clicked: 0,
    credit_card_clicked: 0,
    today: 0,
  });

  const [query, setQuery] = useState({
    page_no: 1, limit: 10,
    search: '', filter_date: '', startDate: null, endDate: null,
    gender: '', minIncome: undefined, maxIncome: undefined, stage: '',
    mode: 'pending', // 'pending' = haven't done | 'completed' = have done
  });

  // Date range picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const datePickerRef = useRef(null);

  // StrictMode double-fire guard
  const fetchSeqRef = useRef(0);

  const totalPages = Math.ceil(totalDataCount / query.limit);

  const buildFilters = useCallback(() => {
    const filters = {};
    if (query.filter_date) filters.type = query.filter_date;
    if (query.search) filters.search = query.search;
    if (query.gender) filters.gender = query.gender;
    if (query.minIncome !== undefined) filters.minIncome = query.minIncome;
    if (query.maxIncome !== undefined) filters.maxIncome = query.maxIncome;
    if (query.startDate) filters.fromDate = query.startDate;
    if (query.endDate) filters.toDate = query.endDate;
    if (query.stage) filters.stage = query.stage;
    if (query.mode) filters.mode = query.mode;
    return filters;
  }, [query.filter_date, query.search, query.gender, query.minIncome, query.maxIncome, query.startDate, query.endDate, query.stage, query.mode]);

  const fetchLeads = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    try {
      setLoading(true);
      const response = await fetchPage(query.page_no, query.limit, buildFilters());
      if (seq !== fetchSeqRef.current) return; // stale
      if (response?.data?.success) {
        const data = response.data.data;
        setRawData(data.rows || []);
        setTotalDataCount(data.pagination?.total || 0);
        if (data.summary) setSummary(data.summary);
      } else {
        setRawData([]);
        setTotalDataCount(0);
        ToastNotification.error('Failed to fetch leads');
      }
    } catch (err) {
      console.error(err);
      if (seq === fetchSeqRef.current) ToastNotification.error('API Error');
    } finally {
      if (seq === fetchSeqRef.current) setLoading(false);
    }
  }, [fetchPage, query.page_no, query.limit, buildFilters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Close date picker on outside click
  useEffect(() => {
    const handleClick = (e) => { if (datePickerRef.current && !datePickerRef.current.contains(e.target)) setShowDatePicker(false); };
    if (showDatePicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDatePicker]);

  const updateQuery = (updates) => setQuery((prev) => ({ ...prev, page_no: 1, ...updates }));

  const handleExport = useCallback(async () => {
    try {
      const response = await fetchAll(buildFilters());
      if (!response?.data?.success) { ToastNotification.error('Failed to fetch data for export'); return; }
      const rows = response.data.data.rows || [];
      if (!rows.length) { ToastNotification.error('No data to export'); return; }

      const csvRows = [[
        'Name', 'Phone', 'Email', 'Gender', 'Income', 'Loan Amount', 'City', 'PAN',
        'OTP Verified', 'Submitted', 'Got Offer', 'Offers Count',
        'Lender Clicked', 'Lender Clicks', 'Credit Card Clicked', 'CC Clicks',
        'Stage', 'Registered At', 'Last Activity',
      ]];

      const stageOf = (r) => {
        if (r.has_credit_card_clicked) return 'Credit Card';
        if (r.has_lender_clicked)      return 'Lender Clicked';
        if (r.has_offer)               return 'Got Offer';
        if (r.has_submitted)           return 'Submitted';
        if (r.has_otp_verified)        return 'OTP Verified';
        return 'Registered';
      };

      rows.forEach((r) => {
        csvRows.push([
          `${r.first_name || ''} ${r.last_name || ''}`.trim(),
          r.phone || '', r.email || '', r.gender || '',
          r.monthly_income || '', r.loan_amount || '', r.city || '', r.pan_number || '',
          r.has_otp_verified ? 'Yes' : 'No', r.has_submitted ? 'Yes' : 'No',
          r.has_offer ? 'Yes' : 'No', r.offers_count ?? 0,
          r.has_lender_clicked ? 'Yes' : 'No', r.lender_clicks_count ?? 0,
          r.has_credit_card_clicked ? 'Yes' : 'No', r.credit_card_clicks_count ?? 0,
          stageOf(r),
          formatDate(r.created_at) || '',
          formatDate(r.updated_at) || '',
        ]);
      });
      const csvContent = csvRows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${isApp ? 'app' : 'web'}-lead-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error(err); ToastNotification.error('Export failed'); }
  }, [fetchAll, buildFilters, isApp]);

  const handleDateRangeApply = () => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const today = new Date(); today.setHours(0, 0, 0, 0); end.setHours(0, 0, 0, 0);
    if (start > end) { ToastNotification.error('Start date cannot be after end date'); return; }
    if (end > today) { ToastNotification.error('End date cannot be in the future'); return; }
    updateQuery({ startDate: dateRange.startDate, endDate: dateRange.endDate, filter_date: '' });
    setShowDatePicker(false);
  };

  const hasActiveFilters = query.search || query.gender || query.stage || query.filter_date || query.startDate || (query.minIncome !== undefined);

  const clearAllFilters = () => {
    setQuery((p) => ({ page_no: 1, limit: 10, search: '', filter_date: '', startDate: null, endDate: null, gender: '', minIncome: undefined, maxIncome: undefined, stage: '', mode: p.mode }));
    setDateRange({ startDate: '', endDate: '' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, query.page_no - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <motion.div
      className="space-y-5"
      variants={containerStagger}
      initial="hidden"
      animate="show"
    >
      <Toaster />

      {/* Page Header */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {subtitle}
            <span className="ml-1 text-xs font-medium">
              · Showing{' '}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={query.mode}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  className={query.mode === 'completed' ? 'text-emerald-700' : 'text-rose-700'}
                >
                  {query.mode === 'completed' ? 'users who completed each step' : 'users who haven’t completed each step yet'}
                </motion.span>
              </AnimatePresence>
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {partnerLabel && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[11px] font-medium text-indigo-700">{partnerLabel}</span>
            </div>
          )}

          {/* Pending / Completed toggle */}
          <div className="relative inline-flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
            {['pending', 'completed'].map((m) => (
              <motion.button
                key={m}
                type="button"
                onClick={() => updateQuery({ mode: m, stage: '' })}
                whileTap={{ scale: 0.96 }}
                className={`relative px-3 py-1.5 text-xs font-semibold rounded-md transition-colors z-10 ${
                  query.mode === m
                    ? m === 'pending'
                      ? 'text-rose-700'
                      : 'text-emerald-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title={m === 'pending' ? 'Users who have NOT completed this step' : 'Users who HAVE completed this step'}
              >
                {query.mode === m && (
                  <motion.span
                    layoutId="modePill"
                    className={`absolute inset-0 rounded-md shadow-sm border ${
                      m === 'pending' ? 'bg-white border-rose-200' : 'bg-white border-emerald-200'
                    }`}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative">{m === 'pending' ? 'Pending' : 'Completed'}</span>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchLeads}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <motion.span
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
              className="inline-flex"
            >
              <RefreshCcw size={14} />
            </motion.span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            Export
          </motion.button>
        </div>
      </motion.div>

      {/* Funnel Cards */}
      <FunnelCards summary={summary} activeStage={query.stage} onStageClick={(stage) => updateQuery({ stage })} loading={loading && !rawData.length} />

      {/* Table Card */}
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full font-medium">{totalDataCount} entries</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Gender */}
              <select
                value={query.gender}
                onChange={(e) => updateQuery({ gender: e.target.value })}
                className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 bg-white font-medium text-gray-600"
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              {/* Stage */}
              <select
                value={query.stage}
                onChange={(e) => updateQuery({ stage: e.target.value })}
                className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 bg-white font-medium text-gray-600"
              >
                <option value="">All Stages</option>
                <option value="registered_only">Registered</option>
                <option value="otp_verified">OTP Verified</option>
                <option value="form_submitted">Form Submitted</option>
                <option value="got_offer">Got Offer</option>
                <option value="lender_clicked">Lender Clicked</option>
                <option value="credit_card_clicked">Credit Card</option>
              </select>

              {/* Income */}
              <select
                value={query.minIncome !== undefined ? `${query.minIncome}-${query.maxIncome}` : ''}
                onChange={(e) => {
                  if (!e.target.value) { updateQuery({ minIncome: undefined, maxIncome: undefined }); return; }
                  const [min, max] = e.target.value.split('-').map(Number);
                  updateQuery({ minIncome: min, maxIncome: max });
                }}
                className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 bg-white font-medium text-gray-600"
              >
                <option value="">Income</option>
                <option value="0-20000">&lt; 20K</option>
                <option value="20001-50000">20K - 50K</option>
                <option value="50001-100000">50K - 1L</option>
                <option value="100001-100000000">&gt; 1L</option>
              </select>

              {/* Date range picker */}
              <div className="relative" ref={datePickerRef}>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    query.startDate ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Calendar size={12} />
                  {query.startDate
                    ? `${new Date(query.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${new Date(query.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
                    : 'Date Range'
                  }
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 mt-1.5 z-30 p-3 bg-white border border-gray-200 rounded-xl shadow-lg w-60">
                    <label className="text-[11px] font-medium text-gray-500">Start Date</label>
                    <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange((p) => ({ ...p, startDate: e.target.value }))}
                      className="w-full mt-1 mb-2 p-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                    <label className="text-[11px] font-medium text-gray-500">End Date</label>
                    <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange((p) => ({ ...p, endDate: e.target.value }))}
                      className="w-full mt-1 mb-3 p-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                    <button onClick={handleDateRangeApply} disabled={!dateRange.startDate || !dateRange.endDate}
                      className="w-full py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors">Apply</button>
                    {query.startDate && (
                      <button onClick={() => { setDateRange({ startDate: '', endDate: '' }); updateQuery({ startDate: null, endDate: null }); setShowDatePicker(false); }}
                        className="w-full mt-1.5 text-[11px] text-red-500 hover:text-red-700 font-medium">Clear Range</button>
                    )}
                  </div>
                )}
              </div>

              {/* Quick date filters */}
              {['today', 'yesterday'].map((type) => (
                <button
                  key={type}
                  onClick={() => updateQuery({ filter_date: query.filter_date === type ? '' : type, startDate: null, endDate: null })}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    query.filter_date === type ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}

              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <X size={11} /> Clear
                </button>
              )}

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={query.search}
                  onChange={(e) => updateQuery({ search: e.target.value })}
                  className="w-40 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition"
                />
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading && !rawData.length ? (
          <TableSkeleton rows={query.limit || 8} />
        ) : rawData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
              <Users size={20} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No leads found</p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">Clear filters</button>
            )}
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-10">#</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 min-w-[200px]">Lead</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Gender</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Income</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Loan Amt</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Stage</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">OTP</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Submit</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Offer</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Lender</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Card</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Registered</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Last Activity</th>
                </tr>
              </thead>
              <motion.tbody
                className="divide-y divide-gray-50"
                variants={containerStagger}
                initial="hidden"
                animate="show"
                key={`${query.page_no}-${query.mode}-${query.stage}-${query.search}-${query.filter_date}-${query.startDate}-${query.endDate}`}
              >
                {rawData.map((row, index) => {
                  const fullName = `${row.first_name || ''} ${row.last_name || ''}`.trim();
                  return (
                    <motion.tr
                      key={row.id || index}
                      variants={rowSlide}
                      className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{(query.page_no - 1) * query.limit + index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(fullName || row.phone || 'U')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{fullName || 'N/A'}</p>
                            {row.phone && <p className="text-xs text-gray-500">{maskPhone(row.phone)}</p>}
                            {row.email && <p className="text-xs text-gray-400 truncate max-w-[180px]">{row.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.gender ? row.gender.charAt(0).toUpperCase() + row.gender.slice(1) : <span className="text-gray-300">-</span>}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 tabular-nums">{formatINR(row.monthly_income) || <span className="text-gray-300">-</span>}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-700 tabular-nums">{formatINR(row.loan_amount) || <span className="text-gray-300">-</span>}</td>
                      <td className="px-4 py-3 text-center"><StagePill row={row} /></td>
                      <td className="px-4 py-3 text-center">{row.has_otp_verified ? <Badge variant="success">Yes</Badge> : <Badge variant="default">No</Badge>}</td>
                      <td className="px-4 py-3 text-center">{row.has_submitted ? <Badge variant="info">Yes</Badge> : <Badge variant="default">No</Badge>}</td>
                      <td className="px-4 py-3 text-center">
                        {row.has_offer
                          ? <Badge variant="success">{safe(row.offer_received_count) ?? 'Yes'}</Badge>
                          : <Badge variant="default">No</Badge>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.has_lender_clicked
                          ? <Badge variant="violet">{safe(row.lender_clicks_count) || 'Yes'}</Badge>
                          : <Badge variant="default">No</Badge>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.has_credit_card_clicked
                          ? <Badge variant="warning">{safe(row.credit_card_clicks_count) || 'Yes'}</Badge>
                          : <Badge variant="default">No</Badge>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(row.created_at) || <span className="text-gray-300">-</span>}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(row.updated_at) || <span className="text-gray-300">-</span>}</td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && rawData.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Showing {totalDataCount === 0 ? 0 : (query.page_no - 1) * query.limit + 1}-{Math.min(query.page_no * query.limit, totalDataCount)} of {totalDataCount}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setQuery((p) => ({ ...p, page_no: 1 }))} disabled={query.page_no === 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronsLeft size={15} />
              </button>
              <button onClick={() => setQuery((p) => ({ ...p, page_no: p.page_no - 1 }))} disabled={query.page_no === 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={15} />
              </button>
              {getPageNumbers().map((page) => (
                <button key={page} onClick={() => setQuery((p) => ({ ...p, page_no: page }))}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    query.page_no === page ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
                  }`}>{page}</button>
              ))}
              <button onClick={() => setQuery((p) => ({ ...p, page_no: p.page_no + 1 }))} disabled={query.page_no === totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={15} />
              </button>
              <button onClick={() => setQuery((p) => ({ ...p, page_no: totalPages }))} disabled={query.page_no === totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LeadTracker;
