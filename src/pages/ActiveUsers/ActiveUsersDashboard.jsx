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
  Navigation,
  Target
} from 'lucide-react';
import StatCard from '../../components/dashboard-pro/StatCard';
import TrendChart from '../../components/dashboard-pro/TrendChart';
import SkeletonLoader from '../../components/dashboard-pro/SkeletonLoader';
import { getActivityStats, getActiveUsers, getLiveUsers } from '../../api-services/Modules/ActiveUsersApi';
import { Link } from 'react-router-dom';

const ActiveUsersDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [liveUsers, setLiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileOnly, setMobileOnly] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, liveRes] = await Promise.allSettled([
        getActivityStats(mobileOnly),
        getActiveUsers(1, 10, { mobileOnly }),
        getLiveUsers(mobileOnly),
      ]);

      if (statsRes.status === 'fulfilled') {
        const data = statsRes.value?.data?.data || statsRes.value?.data;
        setStats(data);
      }

      if (usersRes.status === 'fulfilled') {
        const data = usersRes.value?.data?.data?.users || usersRes.value?.data?.users || [];
        setRecentUsers(data);
      }

      if (liveRes.status === 'fulfilled') {
        const data = liveRes.value?.data?.data || liveRes.value?.data || [];
        setLiveUsers(Array.isArray(data) ? data.slice(0, 5) : []);
      }

      if (statsRes.status === 'rejected' && usersRes.status === 'rejected') {
        setError('Failed to fetch data from server');
      }
    } catch {
      setError('Failed to connect to server');
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Online Now"
          value={stats?.onlineUsersNow || 0}
          icon={Wifi}
          color="success"
          format="number"
          subtitle="Active in last 5 min"
          to="/live-users"
        />
        <StatCard
          title="Active Users (24h)"
          value={stats?.totalActiveUsers24h || 0}
          icon={Users}
          color="primary"
          format="number"
          subtitle="Unique users today"
          to="/active-users-list"
        />
        <StatCard
          title="Total Activities (24h)"
          value={stats?.totalActivities24h || 0}
          icon={Activity}
          color="purple"
          format="number"
          subtitle="All activity types"
          to="/active-users-list"
        />
        <StatCard
          title="Page Views (24h)"
          value={stats?.activityBreakdown?.pageViews || 0}
          icon={Eye}
          color="cyan"
          format="number"
          subtitle="Screen visits"
          to="/funnel-analytics"
        />
      </div>

      {/* Live Users Section */}
      {liveUsers.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Wifi className="w-5 h-5 text-emerald-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Live Users Right Now</h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                {liveUsers.length} online
              </span>
            </div>
            <Link
              to="/live-users"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View All Live
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {liveUsers.map((user, index) => (
              <div
                key={user.userId || index}
                className="bg-white rounded-lg p-3 border border-emerald-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-emerald-600">
                        {user.fullName?.[0] || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {user.fullName || `User #${user.userId}`}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.phoneNumber || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 rounded px-2 py-1">
                  <Navigation size={10} />
                  <span className="truncate">{user.currentPage || 'Unknown'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          title={`Activity by Hour (Now: ${currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })})`}
          subtitle="User activity distribution throughout the day (24h view)"
          type="bar"
          data={activityByHourData}
          xAxisKey="hour"
          dataKeys={[
            { key: 'activities', name: 'Activities', color: '#6366f1' },
          ]}
          height="h-72"
        />
        <TrendChart
          title="Top Pages"
          subtitle="Most visited screens in the app"
          type="bar"
          data={topPagesData.length > 0 ? topPagesData : [{ page: 'No data', visits: 0 }]}
          xAxisKey="page"
          dataKeys={[
            { key: 'visits', name: 'Visits', color: '#10b981' },
          ]}
          height="h-72"
        />
      </div>

      {/* Activity Breakdown */}
      {activityBreakdownData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-gray-800">Activity Type Breakdown</h3>
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
