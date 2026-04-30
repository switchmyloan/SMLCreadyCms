import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  Users,
  Send,
  BadgeCheck,
  XCircle,
  MousePointerClick,
  Clock,
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
  ExternalLink,
  Filter,
} from 'lucide-react';
import ToastNotification from '@components/Notification/ToastNotification';
import { getGoldLoanLeads, getAllGoldLoanLeads } from '../../../api-services/Modules/Leads';
import { maskPhone } from '../../../utils/maskPhone';

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

/* ============== Funnel Stages ============== */
const FUNNEL_STAGES = [
  { key: 'submitted', label: 'Submitted',     field: 'submitted', icon: Send,              color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',    ring: 'ring-blue-400',    barColor: 'bg-blue-500',    iconBg: 'bg-blue-100' },
  { key: 'offer',     label: 'Offer Received', field: 'offer',     icon: BadgeCheck,        color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-400', barColor: 'bg-emerald-500', iconBg: 'bg-emerald-100' },
  { key: 'no_offer',  label: 'No Offer',       field: 'noOffer',   icon: XCircle,           color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200',    ring: 'ring-rose-400',    barColor: 'bg-rose-500',    iconBg: 'bg-rose-100' },
  { key: 'clicked',   label: 'Offer Clicked',  field: 'clicked',   icon: MousePointerClick, color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200',  ring: 'ring-violet-400',  barColor: 'bg-violet-500',  iconBg: 'bg-violet-100' },
  { key: 'expired',   label: 'Expired',        field: 'expired',   icon: Clock,             color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   ring: 'ring-amber-400',   barColor: 'bg-amber-500',   iconBg: 'bg-amber-100' },
];

/* ============== Funnel Cards ============== */
const FunnelCards = ({ funnel, activeStage, onStageClick, loading }) => {
  const submitted = funnel?.submitted || 0;
  const pct = (val) => (!submitted ? 0 : Math.round((val / submitted) * 100));

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-gray-100 animate-pulse h-[100px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total */}
      <button
        type="button"
        onClick={() => onStageClick('')}
        className={`group text-left p-4 bg-white rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
          activeStage === '' ? 'ring-2 ring-gray-300 border-gray-200 shadow-md' : 'border-gray-100 shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Leads</p>
            <p className="mt-1.5 text-2xl font-bold text-gray-900 tabular-nums">{submitted.toLocaleString()}</p>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp size={11} /> Today: {(funnel?.todaySubmitted || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors shrink-0">
            <Users className="text-gray-500" size={18} />
          </div>
        </div>
      </button>

      {FUNNEL_STAGES.map((s) => {
        const Icon = s.icon;
        const val = funnel?.[s.field] || 0;
        const isActive = activeStage === s.key;
        const percentage = pct(val);
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onStageClick(isActive ? '' : s.key)}
            className={`group text-left p-4 bg-white rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
              isActive ? `ring-2 ${s.ring} ${s.border} shadow-md` : 'border-gray-100 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="mt-1.5 text-2xl font-bold text-gray-900 tabular-nums">{val.toLocaleString()}</p>
              </div>
              <div className={`p-2 rounded-lg ${s.iconBg} group-hover:scale-110 transition-transform shrink-0`}>
                <Icon className={s.color} size={18} />
              </div>
            </div>
            <div className="mt-2.5">
              <span className={`text-[11px] font-semibold ${s.color}`}>{percentage}%</span>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div className={`h-full ${s.barColor} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
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

/* ============== Main Component ============== */
const GoldLoanLeads = () => {
  const [rawData, setRawData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [funnel, setFunnel] = useState({ submitted: 0, offer: 0, noOffer: 0, clicked: 0, expired: 0, todaySubmitted: 0 });

  const [query, setQuery] = useState({
    page_no: 1, limit: 10,
    search: '', filter_date: '', startDate: null, endDate: null,
    gender: '', minIncome: undefined, maxIncome: undefined, stage: '',
  });

  // Date range picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const datePickerRef = useRef(null);

  const totalPages = Math.ceil(totalDataCount / query.limit);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      if (query.filter_date) filters.type = query.filter_date;
      if (query.search) filters.search = query.search;
      if (query.gender) filters.gender = query.gender;
      if (query.minIncome !== undefined) filters.minIncome = query.minIncome;
      if (query.maxIncome !== undefined) filters.maxIncome = query.maxIncome;
      if (query.startDate) filters.fromDate = query.startDate;
      if (query.endDate) filters.toDate = query.endDate;
      if (query.stage) filters.stage = query.stage;

      const response = await getGoldLoanLeads(query.page_no, query.limit, filters);
      if (response?.data?.success) {
        const data = response.data.data;
        setRawData(data.rows || []);
        setTotalDataCount(data.pagination?.total || 0);
        if (data.funnel) setFunnel(data.funnel);
      } else {
        setRawData([]);
        setTotalDataCount(0);
        ToastNotification.error('Failed to fetch gold loan leads');
      }
    } catch (err) {
      console.error(err);
      ToastNotification.error('API Error');
    } finally {
      setLoading(false);
    }
  }, [query.page_no, query.limit, query.filter_date, query.search, query.gender, query.minIncome, query.maxIncome, query.startDate, query.endDate, query.stage]);

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
      const filters = {};
      if (query.filter_date) filters.type = query.filter_date;
      if (query.search) filters.search = query.search;
      if (query.gender) filters.gender = query.gender;
      if (query.minIncome !== undefined) filters.minIncome = query.minIncome;
      if (query.maxIncome !== undefined) filters.maxIncome = query.maxIncome;
      if (query.startDate) filters.fromDate = query.startDate;
      if (query.endDate) filters.toDate = query.endDate;
      if (query.stage) filters.stage = query.stage;

      const response = await getAllGoldLoanLeads(filters);
      if (!response?.data?.success) { ToastNotification.error('Failed to fetch data for export'); return; }
      const rows = response.data.data.rows || [];
      if (!rows.length) { ToastNotification.error('No data to export'); return; }

      const csvRows = [["Name", "Phone", "Email", "Gender", "Income", "Offer Status", "Loan Amount", "Tenure", "Clicked", "Status", "Message", "Expiry", "Submitted"]];
      rows.forEach((row) => {
        const lead = row.lead || {};
        csvRows.push([
          `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
          lead.phoneNumber || '', lead.emailAddress || '', lead.gender || '',
          lead.monthlyIncome || '', row.isOffer ? 'Received' : 'No Offer',
          row.offerLoan || '', row.tenure || '', row.isClicked ? 'Yes' : 'No',
          row.status || '', row.message || '',
          formatDate(row.expiryDate) || '', formatDate(row.createdAt) || '',
        ]);
      });
      const csvContent = csvRows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `gold-loan-leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error(err); ToastNotification.error('Export failed'); }
  }, [query]);

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
    setQuery({ page_no: 1, limit: 10, search: '', filter_date: '', startDate: null, endDate: null, gender: '', minIncome: undefined, maxIncome: undefined, stage: '' });
    setDateRange({ startDate: '', endDate: '' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, query.page_no - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const getStatusVariant = (status) => {
    const code = Number(status);
    if (code >= 200 && code < 300) return 'success';
    if (code >= 400) return 'danger';
    if (code >= 300) return 'warning';
    return 'default';
  };

  return (
    <div className="space-y-5">
      <Toaster />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gold Loan Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">Funnel overview of gold loan leads submitted to Muthoot Finance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-medium text-amber-700">Partner: Muthoot Finance</span>
          </div>
          <button onClick={fetchLeads} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExport} disabled={loading} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Funnel Cards */}
      <FunnelCards funnel={funnel} activeStage={query.stage} onStageClick={(stage) => updateQuery({ stage })} loading={loading && !rawData.length} />

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Left: Title + count */}
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Gold Loan Leads</h3>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full font-medium">{totalDataCount} entries</span>
            </div>

            {/* Right: Filters */}
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
                <option value="submitted">Submitted</option>
                <option value="offer">Offer Received</option>
                <option value="no_offer">No Offer</option>
                <option value="clicked">Clicked</option>
                <option value="expired">Expired</option>
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

              {/* Clear all */}
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <X size={11} /> Clear
                </button>
              )}

              {/* Search */}
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

        {/* Scrollable Table */}
        <style>{`
          .gold-table-scroll::-webkit-scrollbar { height: 6px; }
          .gold-table-scroll::-webkit-scrollbar-track { background: #f9fafb; }
          .gold-table-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
          .gold-table-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        `}</style>

        {loading && !rawData.length ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm mt-3">Loading leads...</p>
          </div>
        ) : rawData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
              <Users size={20} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No leads found</p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="gold-table-scroll overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-10">#</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 min-w-[200px]">Lead Details</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Gender</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Income</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Offer</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Loan Amt</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tenure</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Clicked</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Message</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Expiry</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">Submitted</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rawData.map((row, index) => {
                  const lead = row.lead || {};
                  const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
                  return (
                    <tr key={row.id || index} className="hover:bg-gray-50/50 transition-colors">
                      {/* # */}
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{(query.page_no - 1) * query.limit + index + 1}</td>

                      {/* Lead Details */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(fullName || 'U')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{fullName || 'N/A'}</p>
                            {lead.phoneNumber && <p className="text-xs text-gray-500">{maskPhone(lead.phoneNumber)}</p>}
                            {lead.emailAddress && <p className="text-xs text-gray-400 truncate max-w-[180px]">{lead.emailAddress}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="px-4 py-3 text-sm text-gray-600">{lead.gender ? lead.gender.charAt(0).toUpperCase() + lead.gender.slice(1) : <span className="text-gray-300">-</span>}</td>

                      {/* Income */}
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 tabular-nums">{formatINR(lead.monthlyIncome) || <span className="text-gray-300">-</span>}</td>

                      {/* Offer */}
                      <td className="px-4 py-3">{row.isOffer ? <Badge variant="success">Received</Badge> : <Badge variant="danger">No Offer</Badge>}</td>

                      {/* Loan Amount */}
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-700 tabular-nums">{formatINR(row.offerLoan) || <span className="text-gray-300">-</span>}</td>

                      {/* Tenure */}
                      <td className="px-4 py-3 text-sm text-gray-600">{row.tenure || <span className="text-gray-300">-</span>}</td>

                      {/* Clicked */}
                      <td className="px-4 py-3 text-center">{row.isClicked ? <Badge variant="violet">Yes</Badge> : <Badge variant="default">No</Badge>}</td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">{row.status ? <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge> : <span className="text-gray-300">-</span>}</td>

                      {/* Message */}
                      <td className="px-4 py-3">
                        {row.message ? (
                          <div className="truncate max-w-[160px] text-xs text-gray-500" title={row.message}>{row.message}</div>
                        ) : <span className="text-gray-300">-</span>}
                      </td>

                      {/* Expiry */}
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(row.expiryDate) || <span className="text-gray-300">-</span>}</td>

                      {/* Submitted */}
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(row.createdAt) || <span className="text-gray-300">-</span>}</td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        {row.redirectLink ? (
                          <a href={row.redirectLink} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                            <ExternalLink size={10} /> Open
                          </a>
                        ) : <span className="text-gray-300">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
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
      </div>
    </div>
  );
};

export default GoldLoanLeads;
