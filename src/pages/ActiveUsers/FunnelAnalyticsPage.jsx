import { useState, useEffect, useCallback } from 'react';
import {
  Filter,
  RefreshCw,
  TrendingDown,
  Users,
  ArrowDown,
  ArrowRight,
  BarChart3,
  Plus,
  X,
  CheckCircle,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Eye,
  Phone,
  Calendar,
  MapPin,
} from 'lucide-react';
import { getUserFunnelAnalytics, getUserJourney } from '../../api-services/Modules/ActiveUsersApi';

// Predefined funnel templates
const FUNNEL_TEMPLATES = {
  onboarding: {
    name: 'User Onboarding',
    pages: ['login', 'register', 'profile', 'dashboard'],
  },
  loanApplication: {
    name: 'Loan Application',
    pages: ['dashboard', 'loan-apply', 'document-upload', 'loan-status'],
  },
  kycCompletion: {
    name: 'KYC Completion',
    pages: ['profile', 'kyc-start', 'pan-verification', 'kyc-complete'],
  },
};

// User Detail Modal Component
const UserFunnelDetailModal = ({ user, funnelPages, onClose }) => {
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        const response = await getUserJourney(user.userId);
        setJourneyData(response?.data?.data || null);
      } catch (error) {
        console.error('Failed to fetch user journey:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchJourney();
    }
  }, [user?.userId]);

  const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '-';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getStepStatus = (step) => {
    if (user.completedSteps?.includes(step)) {
      return { completed: true, current: step === user.currentStep };
    }
    return { completed: false, current: false };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                  <span className="text-2xl font-bold">{user.fullName?.charAt(0) || 'U'}</span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">{user.fullName || 'Unknown User'}</h2>
                <div className="flex items-center gap-4 mt-1 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {user.phoneNumber || '-'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    Started: {formatDateTime(user.startedAt)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Summary */}
          <div className="mt-4 flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/80">Funnel Progress</span>
                <span className="font-bold">{user.progressPercentage}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    user.isCompleted ? 'bg-emerald-400' : 'bg-yellow-400'
                  }`}
                  style={{ width: `${user.progressPercentage}%` }}
                />
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              user.isCompleted ? 'bg-emerald-500' : 'bg-yellow-500'
            }`}>
              {user.isCompleted ? (
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircle size={16} /> Completed
                </span>
              ) : (
                <span className="flex items-center gap-1 font-semibold">
                  <Clock size={16} /> In Progress
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Funnel Steps Visual */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-indigo-500" />
              Funnel Steps Progress
            </h3>
            <div className="flex items-center justify-between flex-wrap gap-4">
              {funnelPages.map((step, index) => {
                const status = getStepStatus(step);
                return (
                  <div key={index} className="flex items-center">
                    <div className={`flex flex-col items-center`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all ${
                        status.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : status.current
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        {status.completed ? (
                          <CheckCircle size={20} />
                        ) : (
                          <span className="font-bold">{index + 1}</span>
                        )}
                      </div>
                      <span className={`mt-2 text-sm font-medium ${
                        status.completed ? 'text-emerald-600' : 'text-gray-500'
                      }`}>
                        {step}
                      </span>
                      {status.current && !status.completed && (
                        <span className="text-xs text-indigo-600 font-medium">Current</span>
                      )}
                    </div>
                    {index < funnelPages.length - 1 && (
                      <div className={`w-12 h-1 mx-2 ${
                        status.completed ? 'bg-emerald-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completed Steps Detail */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-500" />
              Completed Steps ({user.completedSteps?.length || 0}/{funnelPages.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {funnelPages.map((step, index) => {
                const isCompleted = user.completedSteps?.includes(step);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? <CheckCircle size={16} /> : index + 1}
                        </div>
                        <span className={`font-medium ${
                          isCompleted ? 'text-emerald-700' : 'text-gray-500'
                        }`}>
                          {step}
                        </span>
                      </div>
                      {isCompleted ? (
                        <span className="text-xs text-emerald-600 font-medium px-2 py-1 bg-emerald-100 rounded">
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-100 rounded">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Journey Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-500" />
              Complete User Journey (Last 24 Hours)
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                Loading journey data...
              </div>
            ) : journeyData && journeyData.journeySteps?.length > 0 ? (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                <div className="space-y-4">
                  {journeyData.journeySteps.map((step, index) => {
                    const isFunnelStep = funnelPages.includes(step.pagePath?.toLowerCase());
                    return (
                      <div key={index} className="relative flex items-start gap-4 ml-6">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-6 w-4 h-4 rounded-full border-2 ${
                          isFunnelStep
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'bg-white border-gray-300'
                        }`} />

                        {/* Step Content */}
                        <div className={`flex-1 p-4 rounded-lg ${
                          isFunnelStep ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${
                                isFunnelStep ? 'text-indigo-700' : 'text-gray-700'
                              }`}>
                                {step.pagePath || 'Unknown Page'}
                              </span>
                              {isFunnelStep && (
                                <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded">
                                  Funnel Step
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(step.timestamp)}
                            </span>
                          </div>
                          {step.actionName && (
                            <p className="text-sm text-gray-500 mt-1">
                              Action: {step.actionName}
                            </p>
                          )}
                          {step.duration > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              Time spent: {formatDuration(step.duration)}
                            </p>
                          )}
                        </div>

                        {/* Arrow to next */}
                        {index < journeyData.journeySteps.length - 1 && (
                          <ArrowDown size={14} className="absolute -left-4 top-full text-gray-300" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Journey Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Pages</p>
                      <p className="text-xl font-bold text-gray-800">
                        {journeyData.journeySteps?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Session Duration</p>
                      <p className="text-xl font-bold text-gray-800">
                        {formatDuration(journeyData.totalDuration)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Session ID</p>
                      <p className="text-sm font-mono text-gray-600 truncate">
                        {journeyData.sessionId || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No journey data available for this user</p>
                <p className="text-sm">Journey data is available for the last 24 hours</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FunnelAnalyticsPage = () => {
  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('onboarding');
  const [customPages, setCustomPages] = useState([]);
  const [customFunnelName, setCustomFunnelName] = useState('Custom Funnel');
  const [newPage, setNewPage] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showUsers, setShowUsers] = useState(true);
  const [userFilter, setUserFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchFunnelData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const funnelConfig = isCustomMode
      ? { name: customFunnelName, pages: customPages }
      : FUNNEL_TEMPLATES[selectedTemplate];

    if (!funnelConfig.pages || funnelConfig.pages.length < 2) {
      setError('Please add at least 2 pages to the funnel');
      setLoading(false);
      return;
    }

    try {
      const response = await getUserFunnelAnalytics(funnelConfig.name, funnelConfig.pages);
      const data = response?.data?.data || null;
      setFunnelData(data);
    } catch (err) {
      setError('Failed to fetch funnel analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedTemplate, isCustomMode, customPages, customFunnelName]);

  useEffect(() => {
    if (!isCustomMode) {
      fetchFunnelData();
    }
  }, [selectedTemplate, isCustomMode]);

  const handleAddPage = () => {
    if (newPage.trim() && !customPages.includes(newPage.trim())) {
      setCustomPages([...customPages, newPage.trim()]);
      setNewPage('');
    }
  };

  const handleRemovePage = (pageToRemove) => {
    setCustomPages(customPages.filter((p) => p !== pageToRemove));
  };

  const getDropOffColor = (percentage) => {
    if (percentage < 20) return 'text-emerald-600';
    if (percentage < 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarWidth = (percentage) => {
    return `${Math.max(percentage, 5)}%`;
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return 'bg-emerald-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const filteredUsers = funnelData?.users?.filter((user) => {
    if (userFilter === 'completed') return user.isCompleted;
    if (userFilter === 'in-progress') return !user.isCompleted;
    return true;
  }) || [];

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 p-1">
      {/* User Detail Modal */}
      {selectedUser && (
        <UserFunnelDetailModal
          user={selectedUser}
          funnelPages={funnelData?.funnelPages || []}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funnel Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track user conversion through different stages
          </p>
        </div>
        <button
          onClick={fetchFunnelData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
        >
          <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Funnel Configuration */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-indigo-500" />
          <h3 className="font-semibold text-gray-800">Configure Funnel</h3>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!isCustomMode}
              onChange={() => setIsCustomMode(false)}
              className="w-4 h-4 text-indigo-600"
            />
            <span className="text-sm text-gray-700">Use Template</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={isCustomMode}
              onChange={() => setIsCustomMode(true)}
              className="w-4 h-4 text-indigo-600"
            />
            <span className="text-sm text-gray-700">Custom Funnel</span>
          </label>
        </div>

        {!isCustomMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(FUNNEL_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedTemplate === key
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-800">{template.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {template.pages.join(' → ')}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funnel Name
              </label>
              <input
                type="text"
                value={customFunnelName}
                onChange={(e) => setCustomFunnelName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter funnel name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Pages (in order)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPage}
                  onChange={(e) => setNewPage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPage()}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter page path (e.g., login, dashboard)"
                />
                <button
                  onClick={handleAddPage}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {customPages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customPages.map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                  >
                    <span className="text-xs font-medium text-gray-600">{index + 1}.</span>
                    <span className="text-sm text-gray-800">{page}</span>
                    <button
                      onClick={() => handleRemovePage(page)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={fetchFunnelData}
              disabled={customPages.length < 2 || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Analyze Funnel'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Funnel Visualization */}
      {funnelData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-indigo-500" />
                <span className="text-sm text-gray-600">Started</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {funnelData.totalUsersStarted?.toLocaleString('en-IN') || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={16} className="text-emerald-500" />
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {funnelData.totalUsersCompleted?.toLocaleString('en-IN') || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={16} className="text-amber-500" />
                <span className="text-sm text-gray-600">Conversion Rate</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {funnelData.conversionRate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>

          {/* Funnel Steps */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={16} className="text-indigo-500" />
              <h3 className="font-semibold text-gray-800">{funnelData.funnelName}</h3>
            </div>

            <div className="space-y-4">
              {funnelData.steps?.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-indigo-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">{step.stepName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-700">
                            {step.usersCount?.toLocaleString('en-IN') || 0} users
                          </span>
                          <span className="text-sm text-gray-500">
                            ({step.percentage?.toFixed(1) || 0}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-lg transition-all duration-500"
                          style={{ width: getBarWidth(step.percentage) }}
                        />
                      </div>
                    </div>
                  </div>
                  {index < funnelData.steps.length - 1 && step.dropOffCount > 0 && (
                    <div className="ml-12 mt-2 mb-4 flex items-center gap-2">
                      <ArrowDown size={14} className="text-gray-400" />
                      <span className={`text-sm font-medium ${getDropOffColor(step.dropOffPercentage)}`}>
                        -{step.dropOffCount?.toLocaleString('en-IN')} ({step.dropOffPercentage?.toFixed(1)}% drop-off)
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Individual User Progress */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowUsers(!showUsers)}
                className="flex items-center gap-2"
              >
                <User size={16} className="text-indigo-500" />
                <h3 className="font-semibold text-gray-800">Individual User Progress</h3>
                <span className="text-sm text-gray-500">({funnelData.users?.length || 0} users)</span>
                {showUsers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showUsers && (
                <div className="flex items-center gap-2">
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Users</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                  </select>
                </div>
              )}
            </div>

            {showUsers && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Current Step</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Completed Steps</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Started</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-500">
                          No users found in this funnel
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedUser(user)}
                        >
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
                                  <span className="text-sm font-semibold text-indigo-600">
                                    {user.fullName?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{user.fullName || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{user.phoneNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getProgressColor(user.progressPercentage)}`}
                                  style={{ width: `${user.progressPercentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {user.progressPercentage}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-700">
                              {user.currentStep || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {user.completedSteps?.map((step, stepIndex) => (
                                <span
                                  key={stepIndex}
                                  className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs"
                                >
                                  {step}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {formatDate(user.startedAt)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {user.isCompleted ? (
                              <span className="flex items-center gap-1 text-emerald-600 text-sm">
                                <CheckCircle size={14} />
                                Completed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-amber-600 text-sm">
                                <Clock size={14} />
                                In Progress
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                              }}
                              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              <Eye size={14} />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FunnelAnalyticsPage;
