import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import {
  Users, TrendingUp, IndianRupee, UserCheck, ShieldCheck,
  Activity, ArrowUpRight, ArrowDownRight, RefreshCw,
  Filter, Calendar,
} from 'lucide-react';
import { getSummary, getLenderWiseLeads, getKycStageStatistics } from '../../api-services/Modules/DashboardApi';
import { getLeads, getAllLeads } from '../../api-services/Modules/Leads';
import { getAllMFUsers, getAllMFLoans } from '../../api-services/Modules/MutalFundApi';

// --- Color Palette ---
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
const GRADIENT_COLORS = {
  primary: ['#6366f1', '#8b5cf6'],
  success: ['#10b981', '#34d399'],
  warning: ['#f59e0b', '#fbbf24'],
  danger: ['#ef4444', '#f87171'],
};

// --- KPI Card ---
const KpiCard = ({ title, value, icon: Icon, trend, trendValue, color, loading }) => {
  const colorMap = {
    primary: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    danger: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
  };
  const c = colorMap[color] || colorMap.primary;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border ${c.border} p-5 hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <Icon size={18} className={c.text} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <h3 className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </h3>
        {trend && (
          <span className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};

// --- Chart Wrapper ---
const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-100 p-5 ${className}`}>
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    <div className="h-72">
      {children}
    </div>
  </div>
);

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-gray-600">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }}></span>
          {entry.name}: <span className="font-medium">{Number(entry.value).toLocaleString('en-IN')}</span>
        </p>
      ))}
    </div>
  );
};

// --- Main Dashboard ---
const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [lenderData, setLenderData] = useState([]);
  const [kycData, setKycData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [allLeadsData, setAllLeadsData] = useState([]);
  const [mfUsersData, setMfUsersData] = useState([]);
  const [mfLoansData, setMfLoansData] = useState([]);
  const [dateRange, setDateRange] = useState({ fromDate: '', toDate: '' });
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [summaryRes, lenderRes, kycRes, leadsRes, allLeadsRes, mfUsersRes, mfLoansRes] = await Promise.allSettled([
        getSummary({ fromDate: dateRange.fromDate, toDate: dateRange.toDate }),
        getLenderWiseLeads(),
        getKycStageStatistics(dateRange.fromDate, dateRange.toDate),
        getLeads(),
        getAllLeads(),
        getAllMFUsers(),
        getAllMFLoans(),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.success) {
        // Backend returns: { data: { summary: { kpis, verificationStatus, ... } } }
        const summaryPayload = summaryRes.value.data.data?.summary || summaryRes.value.data.data || {};
        setSummaryData(summaryPayload);
      }
      if (lenderRes.status === 'fulfilled' && lenderRes.value?.data?.success) {
        // Backend returns: { data: { lenders: [...] } }
        const lenders = lenderRes.value.data.data?.lenders
          || lenderRes.value.data.data
          || [];
        setLenderData(Array.isArray(lenders) ? lenders : []);
      }
      if (kycRes.status === 'fulfilled' && kycRes.value?.data?.success) {
        // Backend returns: { data: { MFData: [...] } }
        const mfData = kycRes.value.data.data?.MFData
          || kycRes.value.data.data
          || [];
        setKycData(Array.isArray(mfData) ? mfData : []);
      }
      if (leadsRes.status === 'fulfilled' && leadsRes.value?.data?.success) {
        setLeadsData(leadsRes.value.data.data?.rows || []);
      }
      if (allLeadsRes.status === 'fulfilled' && allLeadsRes.value?.data?.success) {
        setAllLeadsData(allLeadsRes.value.data.data?.rows || allLeadsRes.value.data.data || []);
      }
      if (mfUsersRes.status === 'fulfilled' && mfUsersRes.value?.data?.success) {
        const mfUsers = mfUsersRes.value.data.data;
        // 50Fin API may return { code, detail, data: [...] } or directly an array
        if (Array.isArray(mfUsers)) {
          setMfUsersData(mfUsers);
        } else if (mfUsers?.data && Array.isArray(mfUsers.data)) {
          setMfUsersData(mfUsers.data);
        } else {
          setMfUsersData([]);
        }
      }
      if (mfLoansRes.status === 'fulfilled' && mfLoansRes.value?.data?.success) {
        const mfLoans = mfLoansRes.value.data.data;
        // 50Fin loans: may return nested { data: { data: [...] } } or { data: [...] } or array
        if (Array.isArray(mfLoans)) {
          setMfLoansData(mfLoans);
        } else if (mfLoans?.data?.data && Array.isArray(mfLoans.data.data)) {
          setMfLoansData(mfLoans.data.data);
        } else if (mfLoans?.data && Array.isArray(mfLoans.data)) {
          setMfLoansData(mfLoans.data);
        } else {
          setMfLoansData([]);
        }
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      // Debug: log resolved data in development
      if (import.meta.env.DEV) {
        console.log('[Analytics] Summary:', summaryRes?.status, summaryRes?.value?.data);
        console.log('[Analytics] Lender:', lenderRes?.status, lenderRes?.value?.data);
        console.log('[Analytics] KYC:', kycRes?.status, kycRes?.value?.data);
        console.log('[Analytics] Leads:', leadsRes?.status, leadsRes?.value?.data?.data?.rows?.length);
        console.log('[Analytics] AllLeads:', allLeadsRes?.status, allLeadsRes?.value?.data?.data);
        console.log('[Analytics] MF Users:', mfUsersRes?.status, mfUsersRes?.value?.data);
        console.log('[Analytics] MF Loans:', mfLoansRes?.status, mfLoansRes?.value?.data);
      }
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Computed Metrics ---
  const leadMetrics = useMemo(() => {
    const allLeads = allLeadsData.length || leadsData.length;
    const today = new Date().toDateString();
    const todayLeads = (allLeadsData.length ? allLeadsData : leadsData).filter(
      l => new Date(l.createdAt).toDateString() === today
    ).length;

    const totalLoanAmount = (allLeadsData.length ? allLeadsData : leadsData).reduce(
      (sum, item) => sum + Number(item.requiredLoanAmount || item.loanAmount || 0), 0
    );

    const verified = (allLeadsData.length ? allLeadsData : leadsData).filter(
      l => l.isPhoneVerified || l.isEmailVerified
    ).length;

    return { allLeads, todayLeads, totalLoanAmount, verified };
  }, [leadsData, allLeadsData]);

  const mfMetrics = useMemo(() => {
    const totalUsers = mfUsersData.length;
    const today = new Date().toDateString();
    const todayUsers = mfUsersData.filter(u => {
      const dateStr = u.createdAt || u.created_at;
      return dateStr && new Date(dateStr).toDateString() === today;
    }).length;
    const consentGiven = mfUsersData.filter(u => u.consent || u.creditConsentText).length;
    const totalLoans = mfLoansData.length;

    // Stage distribution from loan_process_step or stage field
    const stageDistribution = mfUsersData.reduce((acc, user) => {
      const stage = user.loan_process_step || user.stage || 'Unknown';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    const stageChartData = Object.entries(stageDistribution).map(([name, value]) => ({ name, value }));

    return { totalUsers, todayUsers, consentGiven, totalLoans, stageChartData };
  }, [mfUsersData, mfLoansData]);

  // --- Lead Trends (Last 30 days) ---
  const leadTrends = useMemo(() => {
    const source = allLeadsData.length ? allLeadsData : leadsData;
    const last30 = {};
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      last30[key] = { date: key, leads: 0, mfUsers: 0 };
    }

    source.forEach(lead => {
      const key = new Date(lead.createdAt).toISOString().slice(0, 10);
      if (last30[key]) last30[key].leads += 1;
    });

    mfUsersData.forEach(user => {
      const dateStr = user.createdAt || user.created_at;
      if (!dateStr) return;
      const key = new Date(dateStr).toISOString().slice(0, 10);
      if (last30[key]) last30[key].mfUsers += 1;
    });

    return Object.values(last30).map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    }));
  }, [leadsData, allLeadsData, mfUsersData]);

  // --- Gender Distribution ---
  const genderDistribution = useMemo(() => {
    const source = allLeadsData.length ? allLeadsData : leadsData;
    const dist = source.reduce((acc, lead) => {
      const gender = lead.gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(dist)
      .filter(([name]) => name && name !== 'Unknown')
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [leadsData, allLeadsData]);

  // --- Income Distribution ---
  const incomeDistribution = useMemo(() => {
    const source = allLeadsData.length ? allLeadsData : leadsData;
    const buckets = { '0-20K': 0, '20K-50K': 0, '50K-1L': 0, '1L-5L': 0, '5L+': 0 };

    source.forEach(lead => {
      const income = Number(lead.income || lead.monthlyIncome || 0);
      if (income <= 20000) buckets['0-20K']++;
      else if (income <= 50000) buckets['20K-50K']++;
      else if (income <= 100000) buckets['50K-1L']++;
      else if (income <= 500000) buckets['1L-5L']++;
      else buckets['5L+']++;
    });

    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [leadsData, allLeadsData]);

  // --- Job Type Distribution ---
  const jobTypeDistribution = useMemo(() => {
    const source = allLeadsData.length ? allLeadsData : leadsData;
    const dist = source.reduce((acc, lead) => {
      const job = lead.jobType || 'Unknown';
      acc[job] = (acc[job] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(dist)
      .filter(([name]) => name && name !== 'Unknown')
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [leadsData, allLeadsData]);

  // --- Lender Performance Data ---
  const lenderPerformance = useMemo(() => {
    return lenderData.map(l => ({
      ...l,
      successRate: parseFloat(l.successRate) || 0,
    })).sort((a, b) => b.totalLeads - a.totalLeads);
  }, [lenderData]);

  // --- Loan Amount Distribution ---
  const loanAmountDistribution = useMemo(() => {
    if (summaryData?.loanAmountBuckets) return summaryData.loanAmountBuckets;
    return [];
  }, [summaryData]);

  const handleApplyDateFilter = () => {
    fetchAllData();
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'leads', label: 'Lead Analytics' },
    { id: 'mutualfunds', label: 'Mutual Funds' },
    { id: 'lenders', label: 'Lender Performance' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive overview of leads and mutual fund performance</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              className="text-sm border-none outline-none bg-transparent"
              value={dateRange.fromDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, fromDate: e.target.value }))}
            />
            <span className="text-gray-300">-</span>
            <input
              type="date"
              className="text-sm border-none outline-none bg-transparent"
              value={dateRange.toDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, toDate: e.target.value }))}
            />
          </div>
          <button
            onClick={handleApplyDateFilter}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <Filter size={14} />
            Apply
          </button>
          <button
            onClick={fetchAllData}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* === OVERVIEW TAB === */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <KpiCard
              title="Total Leads"
              value={leadMetrics.allLeads}
              icon={Users}
              color="primary"
              loading={loading}
            />
            <KpiCard
              title="Today's Leads"
              value={leadMetrics.todayLeads}
              icon={TrendingUp}
              color="success"
              loading={loading}
            />
            <KpiCard
              title="Loan Demand"
              value={`${(leadMetrics.totalLoanAmount / 100000).toFixed(1)}L`}
              icon={IndianRupee}
              color="warning"
              loading={loading}
            />
            <KpiCard
              title="MF Users"
              value={mfMetrics.totalUsers}
              icon={UserCheck}
              color="purple"
              loading={loading}
            />
            <KpiCard
              title="MF Loans"
              value={mfMetrics.totalLoans}
              icon={Activity}
              color="cyan"
              loading={loading}
            />
            <KpiCard
              title="KYC Consent"
              value={mfMetrics.consentGiven}
              icon={ShieldCheck}
              color="success"
              loading={loading}
            />
          </div>

          {/* Lead Trends Chart */}
          <ChartCard title="Lead & MF User Acquisition Trend" subtitle="Last 30 days daily breakdown">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="mfGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="leads" stroke="#6366f1" fill="url(#leadGradient)" strokeWidth={2} name="Leads" />
                <Area type="monotone" dataKey="mfUsers" stroke="#10b981" fill="url(#mfGradient)" strokeWidth={2} name="MF Users" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Gender Distribution" subtitle="Lead demographics">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDistribution}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {genderDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Income Distribution" subtitle="Monthly income ranges">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Job Type Breakdown" subtitle="Employment categories">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobTypeDistribution}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {jobTypeDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* === LEADS TAB === */}
      {activeTab === 'leads' && (
        <>
          {/* Lead KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Leads" value={leadMetrics.allLeads} icon={Users} color="primary" loading={loading} />
            <KpiCard title="Today's Leads" value={leadMetrics.todayLeads} icon={TrendingUp} color="success" loading={loading} />
            <KpiCard title="Total Loan Demand" value={`${(leadMetrics.totalLoanAmount / 100000).toFixed(1)}L`} icon={IndianRupee} color="warning" loading={loading} />
            <KpiCard title="Verified Leads" value={leadMetrics.verified} icon={UserCheck} color="purple" loading={loading} />
          </div>

          {/* Lead Trend */}
          <ChartCard title="Daily Lead Acquisition" subtitle="Number of new leads per day">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="#6366f1" fill="url(#leadAreaGrad)" strokeWidth={2} name="Leads" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Lead Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Gender Distribution" subtitle="Lead gender breakdown">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderDistribution} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" nameKey="name">
                    {genderDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Income Range Distribution" subtitle="Leads by monthly income">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Job Type Distribution" subtitle="Employment type of leads">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobTypeDistribution} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Loan Amount Buckets" subtitle="Requested loan amount distribution">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loanAmountDistribution.length ? loanAmountDistribution : incomeDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* === MUTUAL FUNDS TAB === */}
      {activeTab === 'mutualfunds' && (
        <>
          {/* MF KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total MF Users" value={mfMetrics.totalUsers} icon={Users} color="primary" loading={loading} />
            <KpiCard title="Today's Registrations" value={mfMetrics.todayUsers} icon={TrendingUp} color="success" loading={loading} />
            <KpiCard title="Consent Given" value={mfMetrics.consentGiven} icon={ShieldCheck} color="purple" loading={loading} />
            <KpiCard title="Total Loans" value={mfMetrics.totalLoans} icon={IndianRupee} color="warning" loading={loading} />
          </div>

          {/* MF Trend */}
          <ChartCard title="MF User Registration Trend" subtitle="Daily new MF user registrations">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mfAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="mfUsers" stroke="#10b981" fill="url(#mfAreaGrad)" strokeWidth={2} name="MF Users" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* MF Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="MF User Stage Distribution" subtitle="Onboarding funnel stages">
              <ResponsiveContainer width="100%" height="100%">
                {mfMetrics.stageChartData.length > 0 ? (
                  <BarChart data={mfMetrics.stageChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Users" />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No stage data available</div>
                )}
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="KYC Stage Statistics" subtitle="KYC completion stages">
              <ResponsiveContainer width="100%" height="100%">
                {kycData.length > 0 ? (
                  <BarChart data={kycData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Users">
                      {kycData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No KYC data available</div>
                )}
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* === LENDER PERFORMANCE TAB === */}
      {activeTab === 'lenders' && (
        <>
          {/* Lender Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Lenders"
              value={lenderPerformance.length}
              icon={Users}
              color="primary"
              loading={loading}
            />
            <KpiCard
              title="Total Leads Sent"
              value={lenderPerformance.reduce((s, l) => s + l.totalLeads, 0)}
              icon={TrendingUp}
              color="success"
              loading={loading}
            />
            <KpiCard
              title="Total Approvals"
              value={lenderPerformance.reduce((s, l) => s + l.success, 0)}
              icon={UserCheck}
              color="purple"
              loading={loading}
            />
            <KpiCard
              title="Total Rejections"
              value={lenderPerformance.reduce((s, l) => s + l.rejected, 0)}
              icon={Activity}
              color="danger"
              loading={loading}
            />
          </div>

          {/* Lender Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Lender-wise Lead Distribution" subtitle="Total leads processed by each lender" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                {lenderPerformance.length > 0 ? (
                  <BarChart data={lenderPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="lenderName" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-25} textAnchor="end" height={70} />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="success" stackId="a" fill="#10b981" name="Approved" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No lender data available</div>
                )}
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Lender Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Lender Performance Table</h3>
              <p className="text-xs text-gray-400 mt-0.5">Detailed success rates by lender</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Lender</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total Leads</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Approved</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Rejected</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lenderPerformance.length > 0 ? lenderPerformance.map((lender, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{lender.lenderName}</td>
                      <td className="text-center px-5 py-3 text-gray-600">{lender.totalLeads.toLocaleString()}</td>
                      <td className="text-center px-5 py-3">
                        <span className="text-emerald-600 font-medium">{lender.success.toLocaleString()}</span>
                      </td>
                      <td className="text-center px-5 py-3">
                        <span className="text-red-500 font-medium">{lender.rejected.toLocaleString()}</span>
                      </td>
                      <td className="text-center px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min(lender.successRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-600">{lender.successRate}%</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">No lender data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
