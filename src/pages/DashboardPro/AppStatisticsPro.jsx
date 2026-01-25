import { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, UserPlus, Activity, Users, Percent, RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import StatCard from '../../components/dashboard-pro/StatCard';
import TrendChart from '../../components/dashboard-pro/TrendChart';
import FunnelChart from '../../components/dashboard-pro/FunnelChart';
import SkeletonLoader from '../../components/dashboard-pro/SkeletonLoader';
import { getComprehensiveAnalytics } from '../../api-services/Modules/DashboardApi';
import { getActivityStats, getActiveUsers } from '../../api-services/Modules/ActiveUsersApi';
import { Link } from 'react-router-dom';

const AppStatisticsPro = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [appMetrics, setAppMetrics] = useState(null);
  const [activeUsersStats, setActiveUsersStats] = useState(null);
  const [recentActiveUsers, setRecentActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, appMetricsRes, activeUsersStatsRes, activeUsersListRes] = await Promise.allSettled([
        getComprehensiveAnalytics(),
        fetch(`${BASE_URL}/public/admin/app-metrics`).then(r => r.json()),
        getActivityStats(),
        getActiveUsers(1, 10),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data?.success) {
        setAnalyticsData(analyticsRes.value.data.data);
      }
      if (appMetricsRes.status === 'fulfilled' && appMetricsRes.value?.success) {
        setAppMetrics(appMetricsRes.value);
      }
      if (activeUsersStatsRes.status === 'fulfilled') {
        const data = activeUsersStatsRes.value?.data?.data || activeUsersStatsRes.value?.data;
        setActiveUsersStats(data);
      }
      if (activeUsersListRes.status === 'fulfilled') {
        const data = activeUsersListRes.value?.data?.data?.users || activeUsersListRes.value?.data?.users || [];
        setRecentActiveUsers(data);
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

      {/* Active Users Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Active Users</h2>
            <p className="text-sm text-gray-500">Real-time user activity monitoring</p>
          </div>
          <Link
            to="/active-users-list"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All Users
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Online Now"
            value={activeUsersStats?.onlineUsersNow || 0}
            icon={Wifi}
            color="success"
            format="number"
            subtitle="Active in last 5 min"
          />
          <StatCard
            title="Active Users (24h)"
            value={activeUsersStats?.totalActiveUsers24h || 0}
            icon={Users}
            color="primary"
            format="number"
            subtitle="Unique users today"
          />
          <StatCard
            title="Total Activities (24h)"
            value={activeUsersStats?.totalActivities24h || 0}
            icon={Activity}
            color="purple"
            format="number"
            subtitle="All activity types"
          />
          <StatCard
            title="Page Views (24h)"
            value={activeUsersStats?.activityBreakdown?.pageViews || 0}
            icon={Activity}
            color="cyan"
            format="number"
            subtitle="Screen visits"
          />
        </div>
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

      {/* Recent Active Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-gray-800">Recently Active Users</h3>
          </div>
          <Link
            to="/active-users-list"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Contact</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Activities</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {recentActiveUsers.length > 0 ? (
                recentActiveUsers.map((user, index) => (
                  <tr key={user.id || index} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-xs font-semibold text-indigo-600">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{user.fullName || `${user.firstName} ${user.lastName}`}</p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-600 text-xs">{user.emailAddress}</p>
                      <p className="text-gray-500 text-xs">{user.phoneNumber}</p>
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
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-gray-700">
                        {(user.activityCount || 0).toLocaleString('en-IN')}
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
                    No active users found
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

export default AppStatisticsPro;
