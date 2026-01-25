import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Activity,
  Eye,
  Clock,
  TrendingUp,
  RefreshCw,
  Wifi,
  WifiOff,
  Monitor,
  Smartphone,
  BarChart3,
  PieChart
} from 'lucide-react';
import StatCard from '../../components/dashboard-pro/StatCard';
import TrendChart from '../../components/dashboard-pro/TrendChart';
import SkeletonLoader from '../../components/dashboard-pro/SkeletonLoader';
import { getActivityStats, getActiveUsers } from '../../api-services/Modules/ActiveUsersApi';
import { Link } from 'react-router-dom';

const ActiveUsersDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.allSettled([
        getActivityStats(),
        getActiveUsers(1, 10),
      ]);

      if (statsRes.status === 'fulfilled') {
        const data = statsRes.value?.data?.data || statsRes.value?.data;
        setStats(data);
      }

      if (usersRes.status === 'fulfilled') {
        const data = usersRes.value?.data?.data?.users || usersRes.value?.data?.users || [];
        setRecentUsers(data);
      }

      if (statsRes.status === 'rejected' && usersRes.status === 'rejected') {
        setError('Failed to fetch data from server');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Format activity breakdown for chart
  const activityBreakdownData = useMemo(() => {
    if (!stats?.activityBreakdown) return [];
    const { pageViews, apiCalls, heartbeats, actions } = stats.activityBreakdown;
    return [
      { name: 'Page Views', value: pageViews || 0, color: '#6366f1' },
      { name: 'API Calls', value: apiCalls || 0, color: '#8b5cf6' },
      { name: 'Heartbeats', value: heartbeats || 0, color: '#10b981' },
      { name: 'Actions', value: actions || 0, color: '#f59e0b' },
    ].filter(item => item.value > 0);
  }, [stats]);

  // Format activity by hour for chart
  const activityByHourData = useMemo(() => {
    if (!stats?.activityByHour) return [];
    return stats.activityByHour.map(item => ({
      hour: `${item.hour}:00`,
      activities: item.count || 0,
    }));
  }, [stats]);

  // Format top pages for chart
  const topPagesData = useMemo(() => {
    if (!stats?.topPages) return [];
    return stats.topPages.slice(0, 8).map(item => ({
      page: item.path?.split('/').pop() || item.path || 'Unknown',
      visits: item.count || 0,
    }));
  }, [stats]);

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
          <p className="text-sm text-gray-500 mt-1">Real-time user activity monitoring</p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Online Now"
          value={stats?.onlineUsersNow || 0}
          icon={Wifi}
          color="success"
          format="number"
          subtitle="Active in last 5 min"
        />
        <StatCard
          title="Active Users (24h)"
          value={stats?.totalActiveUsers24h || 0}
          icon={Users}
          color="primary"
          format="number"
          subtitle="Unique users today"
        />
        <StatCard
          title="Total Activities (24h)"
          value={stats?.totalActivities24h || 0}
          icon={Activity}
          color="purple"
          format="number"
          subtitle="All activity types"
        />
        <StatCard
          title="Page Views (24h)"
          value={stats?.activityBreakdown?.pageViews || 0}
          icon={Eye}
          color="cyan"
          format="number"
          subtitle="Screen visits"
        />
      </div>

      {/* Activity Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-600">Page Views</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {(stats?.activityBreakdown?.pageViews || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">API Calls</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {(stats?.activityBreakdown?.apiCalls || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-gray-600">Heartbeats</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {(stats?.activityBreakdown?.heartbeats || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-600">Actions</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {(stats?.activityBreakdown?.actions || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity by Hour */}
        {activityByHourData.length > 0 && (
          <TrendChart
            title="Activity by Hour"
            subtitle="User activity distribution throughout the day"
            type="bar"
            data={activityByHourData}
            xAxisKey="hour"
            dataKeys={[
              { key: 'activities', name: 'Activities', color: '#6366f1' },
            ]}
            height="h-72"
          />
        )}

        {/* Top Pages */}
        {topPagesData.length > 0 && (
          <TrendChart
            title="Top Pages"
            subtitle="Most visited screens in the app"
            type="bar"
            data={topPagesData}
            xAxisKey="page"
            dataKeys={[
              { key: 'visits', name: 'Visits', color: '#10b981' },
            ]}
            height="h-72"
          />
        )}
      </div>

      {/* Activity Breakdown Pie Chart */}
      {activityBreakdownData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-gray-800">Activity Type Breakdown</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {activityBreakdownData.map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <span className="text-lg font-bold" style={{ color: item.color }}>
                    {((item.value / (stats?.totalActivities24h || 1)) * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700">{item.name}</p>
                <p className="text-xs text-gray-500">{item.value.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Active Users */}
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
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <tr key={user.id || index} className="border-b border-gray-50 hover:bg-gray-50">
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
                              {user.firstName?.[0] || user.phoneNumber?.[0] || 'U'}{user.lastName?.[0] || ''}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {user.fullName?.trim() || user.firstName || user.phoneNumber || `User #${user.id}`}
                          </p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-600 text-xs">{user.emailAddress || '-'}</p>
                      <p className="text-gray-500 text-xs">{user.phoneNumber || '-'}</p>
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

export default ActiveUsersDashboard;
