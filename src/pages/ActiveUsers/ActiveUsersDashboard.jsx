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
  Filter,
  Globe,
  HelpCircle
} from 'lucide-react';

const InfoTip = ({ text }) => (
  <span
    className="inline-flex items-center text-gray-300 hover:text-indigo-500 cursor-help align-middle"
    title={text}
  >
    <HelpCircle size={13} />
  </span>
);
import StatCard from '../../components/dashboard-pro/StatCard';
import TrendChart from '../../components/dashboard-pro/TrendChart';
import SkeletonLoader from '../../components/dashboard-pro/SkeletonLoader';
import { getActivityStats, getLiveUsers } from '../../api-services/Modules/ActiveUsersApi';
import { Link } from 'react-router-dom';

const ActiveUsersDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
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
      const [statsRes, usersRes] = await Promise.allSettled([
        getActivityStats(mobileOnly, true),
        getLiveUsers(mobileOnly),
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

  const STAGE_DESCRIPTIONS = {
    'Active (24h)':
      'Unique App + Web users with any activity in the last 24 hours.',
    'Active (12h)':
      'Of the 24h-active users, how many were active in the last 12 hours.',
    'Active (1h)':
      'Of the 24h-active users, how many were active in the last 1 hour.',
    'Online Now':
      'Of the 24h-active users, how many are still on the app/website right now (heartbeat in last 5 min).',
  };

  const funnelData = useMemo(() => {
    const stages = stats?.engagementFunnel;
    if (!Array.isArray(stages) || stages.length === 0) return [];
    const STAGE_COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981'];
    const top = Math.max(...stages.map((s) => s.count || 0), 1);
    return stages.map((s, i) => {
      const count = s.count || 0;
      const prev = i === 0 ? null : stages[i - 1]?.count || 0;
      const widthPct = Math.max(8, Math.round((count / top) * 100));
      const dropFromPrev =
        prev != null && prev > 0
          ? Math.round(((prev - count) / prev) * 100)
          : null;
      const conversionFromTop =
        i === 0
          ? 100
          : top > 0
            ? Math.round((count / top) * 100)
            : 0;
      return {
        stage: s.stage,
        count,
        widthPct,
        dropFromPrev,
        conversionFromTop,
        color: STAGE_COLORS[i % STAGE_COLORS.length],
        description: STAGE_DESCRIPTIONS[s.stage] || '',
      };
    });
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div title="App + Web users with a heartbeat in the last 5 minutes. Reflects who is actively on the app/website right now (CMS sessions excluded).">
          <StatCard
            title="Online Now"
            value={stats?.onlineUsersNow || 0}
            icon={Wifi}
            color="success"
            format="number"
            subtitle="Active in last 5 min"
            to="/live-users"
          />
        </div>
        <div title="Unique App + Web users with at least one activity in the last 24 hours. Each user counted once. CMS-only admins excluded.">
          <StatCard
            title="Active Users (24h)"
            value={stats?.totalActiveUsers24h || 0}
            icon={Users}
            color="primary"
            format="number"
            subtitle="Unique users today"
            to="/active-users-list"
          />
        </div>
        <div title="Sum of all activities (page views + API calls + heartbeats + actions) by App + Web users in the last 24 hours.">
          <StatCard
            title="Total Activities (24h)"
            value={stats?.totalActivities24h || 0}
            icon={Activity}
            color="purple"
            format="number"
            subtitle="All activity types"
            to="/active-users-list"
          />
        </div>
        <div title="Total screen / page views by App + Web users in the last 24 hours. Heartbeats and API calls are not counted here.">
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
      </div>

      {/* Engagement Funnel + Source Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-1">
                  Engagement Funnel (App + Web)
                  <InfoTip text="Recency funnel: starting from users active in the last 24h, the bars show how many of them were also active in the last 12h, last 1h, and right now (online in last 5 min). Bigger drop = users tailing off; small drop = high stickiness." />
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Recency funnel — last 24h users narrowing to those still online
                </p>
              </div>
            </div>
            <span
              className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold"
              title="All numbers exclude CMS-only admin browsing. Backend filters by principalSource_xid + non-CMS pageviews."
            >
              CMS excluded
            </span>
          </div>

          {funnelData.length > 0 ? (
            <div className="space-y-3">
              {funnelData.map((s, i) => (
                <div key={s.stage} className="group" title={s.description}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="font-medium text-gray-700">{s.stage}</span>
                      <InfoTip text={s.description} />
                      {i > 0 && s.dropFromPrev !== null && s.dropFromPrev > 0 && (
                        <span
                          className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded"
                          title={`${s.dropFromPrev}% drop from "${funnelData[i - 1].stage}"`}
                        >
                          -{s.dropFromPrev}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-800">
                        {s.count.toLocaleString('en-IN')}
                      </span>
                      <span
                        className="text-xs text-gray-400"
                        title={`${s.conversionFromTop}% of "Active (24h)"`}
                      >
                        ({s.conversionFromTop}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-8 bg-gray-50 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full transition-all duration-500 ease-out"
                      style={{
                        width: `${s.widthPct}%`,
                        background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                Overall retention: <span className="font-semibold text-gray-700">
                  {funnelData[0]?.count > 0
                    ? Math.round(
                        ((funnelData[funnelData.length - 1]?.count || 0) /
                          funnelData[0].count) *
                          100
                      )
                    : 0}%
                </span>{' '}
                of 24h-active users are still online
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No funnel data yet
            </div>
          )}
        </div>

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
            <div className="space-y-4">
              {[
                {
                  label: 'App',
                  count: sourceBreakdown.app || 0,
                  icon: Smartphone,
                  color: '#6366f1',
                  tip: 'Users who signed up via the mobile app (principalSource_xid = 1).',
                },
                {
                  label: 'Web',
                  count: sourceBreakdown.web || 0,
                  icon: Globe,
                  color: '#10b981',
                  tip: 'Users who signed up via the website (principalSource_xid = 2).',
                },
                {
                  label: 'Unknown',
                  count: sourceBreakdown.unknown || 0,
                  icon: HelpCircle,
                  color: '#9ca3af',
                  tip: 'Users without a recorded principalSource_xid (NULL or other). Often older accounts or admin users.',
                },
              ]
                .filter((row) => row.count > 0)
                .map((row) => {
                  const pct = Math.round(((row.count || 0) / sourceTotal) * 100);
                  const RowIcon = row.icon;
                  return (
                    <div key={row.label} title={row.tip}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 flex items-center gap-2">
                          <RowIcon size={14} style={{ color: row.color }} />
                          {row.label}
                          <InfoTip text={row.tip} />
                        </span>
                        <span className="text-gray-500">
                          {row.count.toLocaleString('en-IN')}{' '}
                          <span className="text-gray-400">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: row.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div
                  className="text-center"
                  title="App: signed up via mobile app"
                >
                  <p className="text-2xl font-bold text-indigo-600">
                    {(sourceBreakdown.app || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">App</p>
                </div>
                <div
                  className="text-center"
                  title="Web: signed up via website"
                >
                  <p className="text-2xl font-bold text-emerald-600">
                    {(sourceBreakdown.web || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Web</p>
                </div>
                <div
                  className="text-center"
                  title="Unknown: no source tagged on principal"
                >
                  <p className="text-2xl font-bold text-gray-500">
                    {(sourceBreakdown.unknown || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Unknown</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No app or web users in last 24h
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div title="Total non-CMS activities (page views, API calls, heartbeats, actions) bucketed by hour-of-day. Sourced from the recentActivities log of users active in the last 24h.">
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
