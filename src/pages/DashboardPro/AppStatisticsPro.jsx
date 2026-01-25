import { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, UserPlus, Activity, Users, Percent, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import StatCard from '../../components/dashboard-pro/StatCard';
import TrendChart from '../../components/dashboard-pro/TrendChart';
import FunnelChart from '../../components/dashboard-pro/FunnelChart';
import SkeletonLoader from '../../components/dashboard-pro/SkeletonLoader';
import { getComprehensiveAnalytics } from '../../api-services/Modules/DashboardApi';

const AppStatisticsPro = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [appMetrics, setAppMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, appMetricsRes] = await Promise.allSettled([
        getComprehensiveAnalytics(),
        fetch(`${BASE_URL}/public/admin/app-metrics`).then(r => r.json()),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.success) {
        setAnalyticsData(analyticsRes.value.data.data);
      }
      if (appMetricsRes.status === 'fulfilled' && appMetricsRes.value?.success) {
        setAppMetrics(appMetricsRes.value);
      }

      if (analyticsRes.status === 'rejected' && appMetricsRes.status === 'rejected') {
        setError('Failed to fetch app statistics');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const leads = analyticsData?.leads || {};
  const mf = analyticsData?.mutualFunds || {};

  // KPI values
  const newInstalls = appMetrics?.summary?.newInstalls || 0;
  const totalUninstalls = (appMetrics?.summary?.uninstallsAfterInstall || 0) + (appMetrics?.summary?.uninstallsAfterUpdate || 0);
  const installBase = newInstalls - totalUninstalls; // Net active installs (matches Google Play Console)
  const totalUpdates = appMetrics?.summary?.updates || 0;
  const totalLeads = leads.totalLeads || 0;
  const todayLeads = leads.todayLeads || 0;
  const totalMfUsers = mf.totalMfUsers || 0;

  // Install-to-registration rate (based on install base)
  const installToRegRate = installBase > 0 ? ((totalLeads / installBase) * 100) : 0;

  // Daily app metrics trend
  const dailyAppTrend = useMemo(() => {
    if (!appMetrics?.data?.length) return [];
    return appMetrics.data
      .slice(-30)
      .map(item => ({
        date: new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        installs: item.newInstalls || 0,
        updates: item.updates || 0,
        uninstalls: (item.uninstallsAfterInstall || 0) + (item.uninstallsAfterUpdate || 0),
      }));
  }, [appMetrics?.data]);

  // Daily leads trend
  const dailyLeadsTrend = useMemo(() => {
    if (!leads.dailyLeads?.length) return [];
    return leads.dailyLeads.slice(-30).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      leads: item.count || 0,
    }));
  }, [leads.dailyLeads]);

  // KYC Funnel from verification data
  const kycFunnel = useMemo(() => {
    const v = leads.verification || {};
    const stages = [
      { name: 'Total Users', value: v.total || totalLeads, color: '#6366f1' },
      { name: 'Email Verified', value: v.emailVerified || 0, color: '#8b5cf6' },
      { name: 'Phone Verified', value: v.phoneVerified || 0, color: '#a855f7' },
      { name: 'PAN Verified', value: v.panVerified || 0, color: '#10b981' },
    ];
    return stages.filter(s => s.value > 0);
  }, [leads.verification, totalLeads]);

  // Source distribution (app vs web)
  const sourceDistribution = useMemo(() => {
    if (!leads.sourceDistribution?.length) return [];
    return leads.sourceDistribution.map((s, i) => ({
      ...s,
      color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'][i % 4],
    }));
  }, [leads.sourceDistribution]);

  // Gender distribution
  const genderDistribution = useMemo(() => {
    if (!leads.genderDistribution?.length) return [];
    const colors = { Male: '#6366f1', Female: '#ec4899', Other: '#f59e0b' };
    return leads.genderDistribution.map(g => ({
      ...g,
      color: colors[g.name] || '#8b5cf6',
    }));
  }, [leads.genderDistribution]);

  // Age distribution for chart
  const ageData = useMemo(() => {
    if (!leads.ageDistribution?.length) return [];
    return leads.ageDistribution.map(d => ({ range: d.range, count: d.count }));
  }, [leads.ageDistribution]);

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <SkeletonLoader variant="card" count={5} />
        <SkeletonLoader variant="chart" count={2} />
      </div>
    );
  }

  if (error && !analyticsData && !appMetrics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={fetchData} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">App Statistics Pro</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time user acquisition & engagement metrics</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50">
          <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard title="Total Installs" value={newInstalls} icon={Download} color="primary" format="number" />
        <StatCard title="Install Base" value={installBase} icon={Download} color="success" format="number" subtitle="Active installs" />
        <StatCard title="Total Leads" value={totalLeads} icon={UserPlus} color="purple" format="number" subtitle={`${todayLeads} today`} />
        <StatCard title="MF Users" value={totalMfUsers} icon={Activity} color="cyan" format="number" subtitle={`${mf.todayMfUsers || 0} today`} />
        <StatCard title="App Updates" value={totalUpdates} icon={Users} color="warning" format="number" />
        <StatCard title="Install → Lead" value={installToRegRate} icon={Percent} color="danger" format="percentage" />
      </div>

      {/* Daily App Metrics Trend */}
      {dailyAppTrend.length > 0 && (
        <TrendChart
          title="Daily App Metrics"
          subtitle="Installs, updates & uninstalls over 30 days"
          type="composed"
          data={dailyAppTrend}
          xAxisKey="date"
          dataKeys={[
            { key: 'installs', name: 'Installs', color: '#10b981', chartType: 'bar' },
            { key: 'updates', name: 'Updates', color: '#6366f1', chartType: 'bar' },
            { key: 'uninstalls', name: 'Uninstalls', color: '#ef4444', chartType: 'line' },
          ]}
          height="h-72"
        />
      )}

      {/* Daily Leads + KYC Funnel */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dailyLeadsTrend.length > 0 && (
          <TrendChart
            title="Daily Lead Registrations"
            subtitle="New lead sign-ups over 30 days"
            type="area"
            data={dailyLeadsTrend}
            xAxisKey="date"
            dataKeys={[{ key: 'leads', name: 'Leads', color: '#8b5cf6' }]}
            height="h-72"
          />
        )}
        {kycFunnel.length > 0 && (
          <FunnelChart
            title="KYC Verification Funnel"
            stages={kycFunnel}
            showPercentage={true}
          />
        )}
      </div> */}

      {/* Source + Gender Distribution */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sourceDistribution.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-base font-semibold text-gray-800 mb-1">Source Distribution</h4>
            <p className="text-sm text-gray-500 mb-4">App vs Web users</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                    {sourceDistribution.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {genderDistribution.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-base font-semibold text-gray-800 mb-1">Gender Distribution</h4>
            <p className="text-sm text-gray-500 mb-4">Lead gender breakdown</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                    {genderDistribution.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div> */}

      {/* Age + Income Distribution */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ageData.length > 0 && (
          <TrendChart
            title="Age Distribution"
            subtitle="User age bracket breakdown"
            type="bar"
            data={ageData}
            xAxisKey="range"
            dataKeys={[{ key: 'count', name: 'Users', color: '#8b5cf6' }]}
            height="h-64"
          />
        )}
        {leads.incomeDistribution?.length > 0 && (
          <TrendChart
            title="Income Distribution"
            subtitle="User income brackets"
            type="bar"
            data={leads.incomeDistribution.map(d => ({ range: d.range, count: d.count }))}
            xAxisKey="range"
            dataKeys={[{ key: 'count', name: 'Users', color: '#06b6d4' }]}
            height="h-64"
          />
        )}
      </div> */}

      {/* Job Type + Loan Amount Buckets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leads.jobTypeDistribution?.length > 0 && (
          <TrendChart
            title="Employment Type"
            subtitle="Job type breakdown of leads"
            type="bar"
            data={leads.jobTypeDistribution.map(d => ({ type: d.name, count: d.value }))}
            xAxisKey="type"
            dataKeys={[{ key: 'count', name: 'Users', color: '#f59e0b' }]}
            height="h-64"
          />
        )}
        {leads.loanAmountBuckets?.length > 0 && (
          <TrendChart
            title="Loan Amount Requested"
            subtitle="Distribution by amount bracket"
            type="bar"
            data={leads.loanAmountBuckets.map(d => ({ range: d.range, count: d.count }))}
            xAxisKey="range"
            dataKeys={[{ key: 'count', name: 'Applications', color: '#10b981' }]}
            height="h-64"
          />
        )}
      </div>
    </div>
  );
};

export default AppStatisticsPro;
