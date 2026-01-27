import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import {
  Users, TrendingUp, IndianRupee, UserCheck, ShieldCheck,
  Activity, ArrowUpRight, ArrowDownRight, RefreshCw,
  Calendar, Mail, Phone, CreditCard, Briefcase,
  PieChart as PieChartIcon, BarChart3, Target,
} from 'lucide-react';
import { getComprehensiveAnalytics } from '../../api-services/Modules/DashboardApi';

// --- Color Palette ---
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

// --- KPI Card ---
const KpiCard = ({ title, value, icon: Icon, color, subtitle, loading }) => {
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
      <h3 className="text-2xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
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

// --- Empty State ---
const EmptyChart = ({ message = 'No data available' }) => (
  <div className="flex items-center justify-center h-full text-gray-400 text-sm">{message}</div>
);

// --- Main Dashboard ---
const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getComprehensiveAnalytics();
      if (response?.data?.success) {
        setData(response.data.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to connect to analytics API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const leads = data?.leads || {};
  const mf = data?.mutualFunds || {};
  const lenders = data?.lenders || [];

  // Format daily trends for combined view
  const combinedDailyTrend = useMemo(() => {
    if (!leads.dailyLeads?.length && !mf.dailyMfUsers?.length) return [];

    const dateMap = {};

    // Fill last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dateMap[key] = { date: key, leads: 0, mfUsers: 0 };
    }

    leads.dailyLeads?.forEach(item => {
      if (dateMap[item.date]) dateMap[item.date].leads = item.count;
    });

    mf.dailyMfUsers?.forEach(item => {
      if (dateMap[item.date]) dateMap[item.date].mfUsers = item.count;
    });

    return Object.values(dateMap).map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    }));
  }, [leads.dailyLeads, mf.dailyMfUsers]);

  // Lender performance with computed success rate
  const lenderPerformance = useMemo(() => {
    return lenders.map(l => ({
      ...l,
      successRate: l.totalLeads > 0 ? ((l.success / l.totalLeads) * 100).toFixed(1) : '0.0',
    })).sort((a, b) => b.totalLeads - a.totalLeads);
  }, [lenders]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'leads', label: 'Lead Analytics', icon: Users },
    { id: 'mutualfunds', label: 'Mutual Funds', icon: PieChartIcon },
    { id: 'lenders', label: 'Lender Performance', icon: Target },
  ];

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={fetchData} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive overview of leads, mutual funds & lender performance</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* === OVERVIEW TAB === */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard title="Total Leads" value={leads.totalLeads || 0} icon={Users} color="primary" loading={loading} />
            <KpiCard title="Today's Leads" value={leads.todayLeads || 0} icon={TrendingUp} color="success" loading={loading} />
            <KpiCard title="Loan Demand" value={leads.totalLoanAmount ? `${(leads.totalLoanAmount / 100000).toFixed(1)}L` : '0'} icon={IndianRupee} color="warning" loading={loading} />
            <KpiCard title="MF Users" value={mf.totalMfUsers || 0} icon={UserCheck} color="purple" loading={loading} />
            <KpiCard title="MF Consent" value={mf.consentGiven || 0} icon={ShieldCheck} color="cyan" loading={loading} />
            <KpiCard title="Active Lenders" value={lenderPerformance.length} icon={Activity} color="danger" loading={loading} />
          </div>

          {/* Verification Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Email Verified" value={leads.verification?.emailVerified || 0} icon={Mail} color="primary" loading={loading} subtitle={`of ${leads.verification?.total || 0} total`} />
            <KpiCard title="Phone Verified" value={leads.verification?.phoneVerified || 0} icon={Phone} color="success" loading={loading} subtitle={`of ${leads.verification?.total || 0} total`} />
            <KpiCard title="PAN Verified" value={leads.verification?.panVerified || 0} icon={CreditCard} color="warning" loading={loading} subtitle={`of ${leads.verification?.total || 0} total`} />
            <KpiCard title="Today MF Users" value={mf.todayMfUsers || 0} icon={Briefcase} color="purple" loading={loading} />
          </div>

          {/* Combined Trend */}
          <ChartCard title="Lead & MF User Acquisition Trend" subtitle="Last 30 days daily breakdown">
            <ResponsiveContainer width="100%" height="100%">
              {combinedDailyTrend.length > 0 ? (
                <AreaChart data={combinedDailyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="leads" stroke="#6366f1" fill="url(#leadGradient)" strokeWidth={2} name="Leads" />
                  <Area type="monotone" dataKey="mfUsers" stroke="#10b981" fill="url(#mfGradient)" strokeWidth={2} name="MF Users" />
                </AreaChart>
              ) : <EmptyChart />}
            </ResponsiveContainer>
          </ChartCard>

          {/* Distribution Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Gender Distribution" subtitle="All leads by gender">
              <ResponsiveContainer width="100%" height="100%">
                {leads.genderDistribution?.length > 0 ? (
                  <PieChart>
                    <Pie data={leads.genderDistribution} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                      {leads.genderDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Income Distribution" subtitle="Monthly income ranges">
              <ResponsiveContainer width="100%" height="100%">
                {leads.incomeDistribution?.length > 0 ? (
                  <BarChart data={leads.incomeDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Users" />
                  </BarChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Job Type Breakdown" subtitle="Employment categories">
              <ResponsiveContainer width="100%" height="100%">
                {leads.jobTypeDistribution?.length > 0 ? (
                  <PieChart>
                    <Pie data={leads.jobTypeDistribution} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                      {leads.jobTypeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* === LEADS TAB === */}
      {activeTab === 'leads' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Leads" value={leads.totalLeads || 0} icon={Users} color="primary" loading={loading} />
            <KpiCard title="Today's Leads" value={leads.todayLeads || 0} icon={TrendingUp} color="success" loading={loading} />
            <KpiCard title="Total Loan Demand" value={leads.totalLoanAmount ? `${(leads.totalLoanAmount / 100000).toFixed(1)}L` : '0'} icon={IndianRupee} color="warning" loading={loading} />
            <KpiCard title="PAN Verified" value={leads.verification?.panVerified || 0} icon={CreditCard} color="purple" loading={loading} />
          </div>

          {/* Daily Trend */}
          <ChartCard title="Daily Lead Acquisition" subtitle="New leads per day (last 30 days)">
            <ResponsiveContainer width="100%" height="100%">
              {leads.dailyLeads?.length > 0 ? (
                <AreaChart data={leads.dailyLeads.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#leadAreaGrad)" strokeWidth={2} name="Leads" />
                </AreaChart>
              ) : <EmptyChart />}
            </ResponsiveContainer>
          </ChartCard>

          {/* Weekly Trend */}
          <ChartCard title="Weekly Lead Trend" subtitle="Leads per week (last 12 weeks)">
            <ResponsiveContainer width="100%" height="100%">
              {leads.weeklyLeads?.length > 0 ? (
                <BarChart data={leads.weeklyLeads.map(d => ({ ...d, week: new Date(d.week).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Leads" />
                </BarChart>
              ) : <EmptyChart />}
            </ResponsiveContainer>
          </ChartCard>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Gender Distribution" subtitle="Lead demographics">
              <ResponsiveContainer width="100%" height="100%">
                {leads.genderDistribution?.length > 0 ? (
                  <PieChart>
                    <Pie data={leads.genderDistribution} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" nameKey="name">
                      {leads.genderDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Age Distribution" subtitle="Lead age groups">
              <ResponsiveContainer width="100%" height="100%">
                {leads.ageDistribution?.length > 0 ? (
                  <BarChart data={leads.ageDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Users" />
                  </BarChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Job Type Distribution" subtitle="Employment breakdown">
              <ResponsiveContainer width="100%" height="100%">
                {leads.jobTypeDistribution?.length > 0 ? (
                  <BarChart data={leads.jobTypeDistribution} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Count" />
                  </BarChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Income Range" subtitle="Monthly income distribution">
              <ResponsiveContainer width="100%" height="100%">
                {leads.incomeDistribution?.length > 0 ? (
                  <BarChart data={leads.incomeDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} name="Users" />
                  </BarChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Loan Amount Demand" subtitle="Requested loan amount buckets">
              <ResponsiveContainer width="100%" height="100%">
                {leads.loanAmountBuckets?.length > 0 ? (
                  <BarChart data={leads.loanAmountBuckets} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Leads" />
                  </BarChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Lead Sources (UTM)" subtitle="Top traffic sources">
              <ResponsiveContainer width="100%" height="100%">
                {leads.sourceDistribution?.length > 0 ? (
                  <BarChart data={leads.sourceDistribution} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} name="Leads" />
                  </BarChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Verification Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Users" value={leads.verification?.total || 0} icon={Users} color="primary" loading={loading} />
            <KpiCard title="Email Verified" value={leads.verification?.emailVerified || 0} icon={Mail} color="success" loading={loading} subtitle={leads.verification?.total ? `${((leads.verification.emailVerified / leads.verification.total) * 100).toFixed(1)}%` : ''} />
            <KpiCard title="Phone Verified" value={leads.verification?.phoneVerified || 0} icon={Phone} color="warning" loading={loading} subtitle={leads.verification?.total ? `${((leads.verification.phoneVerified / leads.verification.total) * 100).toFixed(1)}%` : ''} />
            <KpiCard title="PAN Verified" value={leads.verification?.panVerified || 0} icon={CreditCard} color="purple" loading={loading} subtitle={leads.verification?.total ? `${((leads.verification.panVerified / leads.verification.total) * 100).toFixed(1)}%` : ''} />
          </div>
        </>
      )}

      {/* === MUTUAL FUNDS TAB === */}
      {activeTab === 'mutualfunds' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total MF Users" value={mf.totalMfUsers || 0} icon={Users} color="primary" loading={loading} />
            <KpiCard title="Today's Registrations" value={mf.todayMfUsers || 0} icon={TrendingUp} color="success" loading={loading} />
            <KpiCard title="Consent Given" value={mf.consentGiven || 0} icon={ShieldCheck} color="purple" loading={loading} />
            <KpiCard title="Users with Portfolio" value={mf.portfolio?.usersWithPortfolio || 0} icon={Briefcase} color="warning" loading={loading} />
          </div>

          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard title="Total Portfolios" value={mf.portfolio?.totalPortfolios || 0} icon={Activity} color="cyan" loading={loading} />
            <KpiCard title="Portfolio Value" value={mf.portfolio?.totalValue ? `${(mf.portfolio.totalValue / 10000000).toFixed(2)} Cr` : '0'} icon={IndianRupee} color="success" loading={loading} />
            <KpiCard title="Users with Portfolio" value={mf.portfolio?.usersWithPortfolio || 0} icon={UserCheck} color="primary" loading={loading} />
          </div>

          {/* MF Trend */}
          <ChartCard title="MF User Registration Trend" subtitle="Daily new MF user registrations (last 30 days)">
            <ResponsiveContainer width="100%" height="100%">
              {mf.dailyMfUsers?.length > 0 ? (
                <AreaChart data={mf.dailyMfUsers.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mfAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#mfAreaGrad)" strokeWidth={2} name="MF Users" />
                </AreaChart>
              ) : <EmptyChart />}
            </ResponsiveContainer>
          </ChartCard>

          {/* MF Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Onboarding Stage Distribution" subtitle="MF user funnel stages">
              <ResponsiveContainer width="100%" height="100%">
                {mf.stageDistribution?.length > 0 ? (
                  <BarChart data={mf.stageDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Users">
                      {mf.stageDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="KYC Stage Statistics" subtitle="KYC completion status">
              <ResponsiveContainer width="100%" height="100%">
                {mf.kycStatistics?.length > 0 ? (
                  <BarChart data={mf.kycStatistics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Users">
                      {mf.kycStatistics.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top AMCs" subtitle="Most popular Asset Management Companies" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                {mf.topAmcs?.length > 0 ? (
                  <BarChart data={mf.topAmcs} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={90} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Holdings" />
                  </BarChart>
                ) : <EmptyChart />}
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* === LENDER PERFORMANCE TAB === */}
      {activeTab === 'lenders' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Lenders" value={lenderPerformance.length} icon={Users} color="primary" loading={loading} />
            <KpiCard title="Total Leads Sent" value={lenderPerformance.reduce((s, l) => s + l.totalLeads, 0)} icon={TrendingUp} color="success" loading={loading} />
            <KpiCard title="Total Approved" value={lenderPerformance.reduce((s, l) => s + l.success, 0)} icon={UserCheck} color="purple" loading={loading} />
            <KpiCard title="Total Rejected" value={lenderPerformance.reduce((s, l) => s + l.rejected, 0)} icon={Activity} color="danger" loading={loading} />
          </div>

          {/* Stacked Bar Chart */}
          <ChartCard title="Lender-wise Approval vs Rejection" subtitle="Lead outcomes by each lender" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              {lenderPerformance.length > 0 ? (
                <BarChart data={lenderPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="lenderName" tick={{ fontSize: 9 }} stroke="#94a3b8" angle={-30} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="success" stackId="a" fill="#10b981" name="Approved" />
                  <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : <EmptyChart />}
            </ResponsiveContainer>
          </ChartCard>

          {/* Lender Performance Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Lender Performance Details</h3>
              <p className="text-xs text-gray-400 mt-0.5">Detailed breakdown of success rates by lender</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Lender Name</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total Leads</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Approved</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Rejected</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lenderPerformance.length > 0 ? lenderPerformance.map((lender, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400 font-medium">{idx + 1}</td>
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
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${Number(lender.successRate) >= 50 ? 'bg-emerald-500' : Number(lender.successRate) >= 25 ? 'bg-amber-500' : 'bg-red-400'}`}
                              style={{ width: `${Math.min(Number(lender.successRate), 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-12">{lender.successRate}%</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">No lender data available</td>
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
