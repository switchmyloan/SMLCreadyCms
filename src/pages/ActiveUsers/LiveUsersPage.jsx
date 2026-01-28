import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  RefreshCw,
  Wifi,
  WifiOff,
  MapPin,
  Clock,
  Smartphone,
  Monitor,
  ArrowRight,
  Eye,
  Activity,
} from 'lucide-react';
import { getLiveUsers, getUserJourney } from '../../api-services/Modules/ActiveUsersApi';
import { Link } from 'react-router-dom';

const LiveUsersPage = () => {
  const [liveUsers, setLiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userJourney, setUserJourney] = useState(null);
  const [journeyLoading, setJourneyLoading] = useState(false);

  const fetchLiveUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLiveUsers();
      const data = response?.data?.data || [];
      setLiveUsers(data);
    } catch (err) {
      setError('Failed to fetch live users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserJourney = useCallback(async (userId) => {
    setJourneyLoading(true);
    try {
      const response = await getUserJourney(userId);
      const data = response?.data?.data || null;
      setUserJourney(data);
    } catch (err) {
      console.error('Failed to fetch user journey:', err);
      setUserJourney(null);
    } finally {
      setJourneyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveUsers();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchLiveUsers, 10000);
    return () => clearInterval(interval);
  }, [fetchLiveUsers]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserJourney(user.userId);
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getDeviceIcon = (deviceType) => {
    if (deviceType === 'mobile') return <Smartphone size={14} className="text-blue-500" />;
    return <Monitor size={14} className="text-gray-500" />;
  };

  const onlineUsers = liveUsers.filter((u) => u.isOnline);
  const offlineUsers = liveUsers.filter((u) => !u.isOnline);

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Users Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time view of users and their current pages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            <Wifi size={14} />
            {onlineUsers.length} Online
          </div>
          <button
            onClick={fetchLiveUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Users List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Online Users */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-emerald-50">
              <div className="flex items-center gap-2">
                <Wifi size={16} className="text-emerald-600" />
                <h3 className="font-semibold text-emerald-800">
                  Online Users ({onlineUsers.length})
                </h3>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {loading && onlineUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : onlineUsers.length > 0 ? (
                onlineUsers.map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => handleUserClick(user)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedUser?.userId === user.userId ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-indigo-600">
                              {user.fullName?.[0] || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {user.fullName || `User #${user.userId}`}
                          </p>
                          <p className="text-xs text-gray-500">{user.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getDeviceIcon(user.deviceType)}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-indigo-500" />
                      <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {user.currentPage || 'Unknown'}
                      </span>
                      {user.previousPage && (
                        <>
                          <ArrowRight size={12} className="text-gray-400" />
                          <span className="text-gray-500 text-xs">from {user.previousPage}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {user.pagesVisited} pages
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Last: {formatTime(user.lastActivityAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <WifiOff size={24} className="mx-auto mb-2 text-gray-400" />
                  No users currently online
                </div>
              )}
            </div>
          </div>

          {/* Recently Offline Users */}
          {offlineUsers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <WifiOff size={16} className="text-gray-500" />
                  <h3 className="font-semibold text-gray-700">
                    Recently Active ({offlineUsers.length})
                  </h3>
                </div>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {offlineUsers.slice(0, 10).map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => handleUserClick(user)}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedUser?.userId === user.userId ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-500">
                            {user.fullName?.[0] || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {user.fullName || user.phoneNumber}
                          </p>
                          <p className="text-xs text-gray-400">
                            Last on: {user.currentPage}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTime(user.lastActivityAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Journey Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 sticky top-4">
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" />
                <h3 className="font-semibold text-gray-800">User Journey</h3>
              </div>
            </div>
            <div className="p-5">
              {!selectedUser ? (
                <div className="text-center py-8 text-gray-500">
                  <Users size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Select a user to view their journey</p>
                </div>
              ) : journeyLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <RefreshCw size={24} className="mx-auto mb-2 animate-spin text-indigo-500" />
                  <p className="text-sm">Loading journey...</p>
                </div>
              ) : !userJourney ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No journey data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-indigo-600">
                        {userJourney.fullName?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{userJourney.fullName}</p>
                      <p className="text-xs text-gray-500">{userJourney.phoneNumber}</p>
                    </div>
                  </div>

                  {/* Session Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-indigo-600">
                        {userJourney.journeySteps?.length || 0}
                      </p>
                      <p className="text-xs text-gray-500">Pages Visited</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-emerald-600">
                        {formatDuration(userJourney.totalDuration)}
                      </p>
                      <p className="text-xs text-gray-500">Session Time</p>
                    </div>
                  </div>

                  {/* Journey Steps */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Page Flow
                    </p>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-200" />

                      {userJourney.journeySteps?.map((step, index) => (
                        <div key={index} className="relative flex items-start gap-3 pb-3">
                          {/* Timeline dot */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium z-10 ${
                              index === 0
                                ? 'bg-emerald-500 text-white'
                                : index === userJourney.journeySteps.length - 1
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {step.stepNumber}
                          </div>
                          {/* Step content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {step.pagePath}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{formatTime(step.timestamp)}</span>
                              {step.duration > 0 && (
                                <span className="text-indigo-500">
                                  ({formatDuration(step.duration)})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View Detail Link */}
                  <Link
                    to={`/active-user/${selectedUser.userId}`}
                    className="block w-full text-center py-2 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    View Full Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveUsersPage;
