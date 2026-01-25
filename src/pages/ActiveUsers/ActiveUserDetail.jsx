import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  CreditCard,
  IndianRupee,
  Shield,
  Bell,
  Fingerprint,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Globe,
  FileText,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { getUserDetail } from '../../api-services/Modules/ActiveUsersApi';

const ActiveUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserDetail(id);
      const userData = res?.data?.data || res?.data;
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user detail:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 font-medium mb-4">{error || 'User not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'employment', label: 'Employment & Financial' },
    { id: 'verification', label: 'Verification & Settings' },
    { id: 'activity', label: 'Recent Activity' },
  ];

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatIncome = (income) => {
    if (!income) return 'N/A';
    const num = Number(income);
    if (isNaN(num)) return income;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      PAGE_VIEW: 'bg-blue-100 text-blue-700',
      API_CALL: 'bg-purple-100 text-purple-700',
      SESSION_HEARTBEAT: 'bg-green-100 text-green-700',
      LOGIN: 'bg-emerald-100 text-emerald-700',
      LOGOUT: 'bg-amber-100 text-amber-700',
      ACTION: 'bg-indigo-100 text-indigo-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.fullName?.trim() || user.firstName || user.phoneNumber || `User #${user.id}`}
            </h1>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              User ID: <span className="text-indigo-600 font-semibold">#{user.id}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Joined: {formatDate(user.createdAt)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.isOnline ? (
            <span className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
              <Wifi size={16} />
              Online
            </span>
          ) : (
            <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
              <WifiOff size={16} />
              Offline
            </span>
          )}
          <button
            onClick={fetchUserDetail}
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary Card */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col items-center text-center">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-indigo-50"
                />
              ) : (
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                  <User size={40} />
                </div>
              )}
              <h2 className="text-lg font-bold text-gray-900">
                {user.fullName?.trim() || user.firstName || user.phoneNumber || `User #${user.id}`}
              </h2>
              <p className="text-gray-500 text-sm">{user.emailAddress || 'No email'}</p>
              <p className="text-gray-400 text-sm">{user.phoneNumber || 'No phone'}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase">Activities (24h)</span>
                <span className="text-sm font-bold text-gray-800">{user.activityCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase">Last Login</span>
                <span className="text-sm font-medium text-gray-700">{formatDate(user.lastLogin)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase">Last Active</span>
                <span className="text-sm font-medium text-gray-700">{formatDateTime(user.lastActivityAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Verification Status</h3>
            <div className="space-y-3">
              <StatusBadge label="Email Verified" status={user.isEmailVerified} />
              <StatusBadge label="Phone Verified" status={user.isPhoneVerified} />
              <StatusBadge label="PAN Verified" status={user.isPANVerified} />
              <StatusBadge label="Profile Completed" status={user.isProfileCompleted} />
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Account Status</h3>
            <div className="space-y-3">
              <StatusBadge label="Account Blocked" status={!user.isBlocked} invertColors />
              <StatusBadge label="Account Suspended" status={!user.isSuspended} invertColors />
            </div>
          </div>
        </div>

        {/* Right Column: Tabs & Content */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all relative ${
                    activeTab === tab.id
                      ? 'text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <User className="text-indigo-600" size={20} />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={User} label="Full Name" value={user.fullName} />
                    <DetailItem icon={Mail} label="Email Address" value={user.emailAddress} />
                    <DetailItem icon={Phone} label="Phone Number" value={user.phoneNumber} />
                    <DetailItem icon={User} label="Gender" value={user.gender} className="capitalize" />
                    <DetailItem icon={Calendar} label="Date of Birth" value={formatDate(user.dateOfBirth)} />
                    <DetailItem icon={Globe} label="IP Address" value={user.ipAddress} />
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <MapPin className="text-indigo-600" size={20} />
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={MapPin} label="Address" value={user.address} className="md:col-span-2" />
                    <DetailItem icon={MapPin} label="City" value={user.city} />
                    <DetailItem icon={MapPin} label="State" value={user.state} />
                    <DetailItem icon={MapPin} label="Country" value={user.country} />
                    <DetailItem icon={MapPin} label="Postal Code" value={user.postalCode} />
                  </div>
                </div>
              </div>
            )}

            {/* Employment Tab */}
            {activeTab === 'employment' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Briefcase className="text-indigo-600" size={20} />
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={Briefcase} label="Job Type" value={user.jobType} className="capitalize" />
                    <DetailItem icon={IndianRupee} label="Monthly Income" value={formatIncome(user.monthlyIncome)} />
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <CreditCard className="text-indigo-600" size={20} />
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={CreditCard} label="PAN Number" value={user.panNumber} className="tracking-wider" />
                    <DetailItem icon={IndianRupee} label="Required Loan Amount" value={formatIncome(user.requiredLoanAmount)} />
                    <DetailItem icon={FileText} label="Looking For" value={user.lookingFor} className="capitalize" />
                  </div>
                </div>

                {user.userPreference && user.userPreference.length > 0 && (
                  <>
                    <hr className="border-gray-100" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4">User Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.userPreference.map((pref, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                          >
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Shield className="text-indigo-600" size={20} />
                    Verification Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <VerificationCard title="Email" status={user.isEmailVerified} icon={Mail} />
                    <VerificationCard title="Phone" status={user.isPhoneVerified} icon={Phone} />
                    <VerificationCard title="PAN" status={user.isPANVerified} icon={CreditCard} />
                    <VerificationCard title="Profile" status={user.isProfileCompleted} icon={User} />
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Bell className="text-indigo-600" size={20} />
                    User Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingCard title="Notifications" enabled={user.isNotificationEnabled} icon={Bell} />
                    <SettingCard title="MPIN" enabled={user.isMpinEnabled} icon={Shield} />
                    <SettingCard title="Biometric" enabled={user.isBioMetricEnabled} icon={Fingerprint} />
                    <SettingCard title="Getting Offers" enabled={user.isGettingOffers} icon={FileText} />
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Account Timestamps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={Clock} label="Created At" value={formatDateTime(user.createdAt)} />
                    <DetailItem icon={Clock} label="Updated At" value={formatDateTime(user.updatedAt)} />
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Activity className="text-indigo-600" size={20} />
                  Recent Activities
                </h3>
                {user.recentActivities && user.recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {user.recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getActivityTypeColor(
                              activity.activityType
                            )}`}
                          >
                            {activity.activityType?.replace(/_/g, ' ')}
                          </span>
                          <div>
                            {activity.pagePath && (
                              <p className="text-sm font-medium text-gray-800">{activity.pagePath}</p>
                            )}
                            {activity.actionName && (
                              <p className="text-sm font-medium text-gray-800">{activity.actionName}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              {activity.deviceType && <span>{activity.deviceType}</span>}
                              {activity.ipAddress && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <span>{activity.ipAddress}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(activity.activityTimestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No recent activities found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const DetailItem = ({ icon: Icon, label, value, className = '' }) => (
  <div className={`flex items-start gap-3 ${className}`}>
    <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-gray-800 font-semibold text-sm ${className}`}>{value || 'N/A'}</p>
    </div>
  </div>
);

const StatusBadge = ({ label, status, invertColors = false }) => {
  const isPositive = invertColors ? status : status;
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      {isPositive ? (
        <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
          <CheckCircle2 size={16} />
          {invertColors ? 'No' : 'Yes'}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
          <XCircle size={16} />
          {invertColors ? 'Yes' : 'No'}
        </span>
      )}
    </div>
  );
};

const VerificationCard = ({ title, status, icon: Icon }) => (
  <div
    className={`p-4 rounded-xl border ${
      status ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${status ? 'bg-emerald-100' : 'bg-gray-200'}`}>
          <Icon size={18} className={status ? 'text-emerald-600' : 'text-gray-500'} />
        </div>
        <span className="font-semibold text-gray-800">{title}</span>
      </div>
      {status ? (
        <CheckCircle2 className="text-emerald-500" size={20} />
      ) : (
        <XCircle className="text-gray-400" size={20} />
      )}
    </div>
  </div>
);

const SettingCard = ({ title, enabled, icon: Icon }) => (
  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Icon size={18} className="text-gray-600" />
        </div>
        <span className="font-medium text-gray-700">{title}</span>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
        }`}
      >
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  </div>
);

export default ActiveUserDetail;
