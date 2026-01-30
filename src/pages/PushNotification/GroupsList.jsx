import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Users,
  Loader2,
  UserCheck,
  Phone,
  Mail,
  Plus,
  Edit2,
  UserPlus,
  Search,
  Zap,
  Activity,
  CreditCard,
  Home,
  Plane,
  Heart,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  X,
} from "lucide-react";

// System groups with icons and colors
const SYSTEM_GROUPS = [
  { label: "All Users", type: "all-users", groupName: "All Users", icon: Users, color: "blue", description: "All registered users" },
  { label: "Active Users", type: "active-users", groupName: "Active Users", icon: Activity, color: "green", description: "Users active in last 30 days" },
  { label: "Live Users", type: "live-users", groupName: "Live Users", icon: Zap, color: "yellow", description: "Currently online users" },
];

const LOAN_GROUPS = [
  { label: "Wedding Loan", type: "wedding-loan", groupName: "Wedding Loan", icon: Heart, color: "pink", description: "Looking for wedding loans" },
  { label: "Personal Loan", type: "instant-personal-loan", groupName: "Instant Personal Loan", icon: CreditCard, color: "purple", description: "Looking for personal loans" },
  { label: "Travel Loan", type: "travel-loan", groupName: "Travel Loan", icon: Plane, color: "cyan", description: "Looking for travel loans" },
  { label: "Home Renovation", type: "home-renovation-loan", groupName: "Home Renovation Loan", icon: Home, color: "orange", description: "Looking for home renovation" },
  { label: "Emergency Loan", type: "emergency-loan", groupName: "Emergency Loan", icon: AlertCircle, color: "red", description: "Looking for emergency loans" },
];

const COLOR_CLASSES = {
  blue: { bg: "bg-blue-50", icon: "bg-blue-100 text-blue-600", border: "border-blue-200", text: "text-blue-700" },
  green: { bg: "bg-green-50", icon: "bg-green-100 text-green-600", border: "border-green-200", text: "text-green-700" },
  yellow: { bg: "bg-yellow-50", icon: "bg-yellow-100 text-yellow-600", border: "border-yellow-200", text: "text-yellow-700" },
  pink: { bg: "bg-pink-50", icon: "bg-pink-100 text-pink-600", border: "border-pink-200", text: "text-pink-700" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", border: "border-purple-200", text: "text-purple-700" },
  cyan: { bg: "bg-cyan-50", icon: "bg-cyan-100 text-cyan-600", border: "border-cyan-200", text: "text-cyan-700" },
  orange: { bg: "bg-orange-50", icon: "bg-orange-100 text-orange-600", border: "border-orange-200", text: "text-orange-700" },
  red: { bg: "bg-red-50", icon: "bg-red-100 text-red-600", border: "border-red-200", text: "text-red-700" },
};

export default function GroupList() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [editId, setEditId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingType, setSyncingType] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Users panel state
  const [showUsersPanel, setShowUsersPanel] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/push-notification/admin/group`
      );
      const json = await res.json();
      const list = json?.data?.data || [];
      const formatted = list.map((item) => ({
        id: item.id,
        title: item.groupName,
        audienceCount: item.memberCount || 0,
        createdAt: new Date(item.createdAt).toLocaleString(),
      }));
      setGroups(formatted);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
    setLoading(false);
  };

  const getGroupCount = (groupName) => {
    const group = groups.find((g) => g.title === groupName);
    return group?.audienceCount || 0;
  };

  const getGroupId = (groupName) => {
    const group = groups.find((g) => g.title === groupName);
    return group?.id;
  };

  const fetchGroupUsers = async (groupId) => {
    setLoadingUsers(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/push-notification/admin/group/${groupId}/members`
      );
      const json = await res.json();
      if (json?.success || json?.data) {
        setGroupUsers(json?.data?.users || []);
      }
    } catch (err) {
      console.error("Error fetching group users:", err);
      setGroupUsers([]);
    }
    setLoadingUsers(false);
  };

  const handleGroupClick = async (group, groupName) => {
    const groupId = getGroupId(groupName);
    if (groupId) {
      setSelectedGroup({ ...group, id: groupId, count: getGroupCount(groupName) });
      setShowUsersPanel(true);
      await fetchGroupUsers(groupId);
    }
  };

  const syncGroup = async (type) => {
    setSyncingType(type);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/push-notification/admin/groups/sync/${type}`,
        { method: "POST" }
      );
      const json = await res.json();
      if (json?.success || json?.data) {
        await fetchGroups();
        if (selectedGroup && selectedGroup.type === type) {
          const groupId = getGroupId(selectedGroup.groupName);
          if (groupId) await fetchGroupUsers(groupId);
        }
      }
    } catch (err) {
      console.error("Error syncing group:", err);
    }
    setSyncingType(null);
  };

  const syncAllGroups = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/push-notification/admin/groups/sync-all`,
        { method: "POST" }
      );
      const json = await res.json();
      if (json?.success || json?.data?.success) {
        setSyncResult(json?.data || json);
        await fetchGroups();
      }
    } catch (err) {
      console.error("Error syncing groups:", err);
    }
    setSyncing(false);
  };

  const handleEdit = (group) => {
    setEditId(group.id);
    setGroupName(group.title);
    setIsModalOpen(true);
  };

  const handleAddUsers = (group) => {
    navigate(`/group/create?name=${group.title}&groupId=${group.id}`);
  };

  const saveGroup = async () => {
    if (!groupName.trim()) return;
    setCreating(true);
    try {
      const url = editId
        ? `${import.meta.env.VITE_API_URL}/push-notification/admin/group/${editId}`
        : `${import.meta.env.VITE_API_URL}/push-notification/admin/group`;
      const method = editId ? "PUT" : "POST";
      const body = editId ? { name: groupName } : { groupName };

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setIsModalOpen(false);
      setGroupName("");
      setEditId(null);
      fetchGroups();
    } catch (err) {
      console.error("Error saving group:", err);
    }
    setCreating(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Filter custom groups (not system or loan groups)
  const systemGroupNames = [...SYSTEM_GROUPS, ...LOAN_GROUPS].map((g) => g.groupName);
  const customGroups = groups.filter((g) => !systemGroupNames.includes(g.title));
  const filteredCustomGroups = customGroups.filter((g) =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalUsers = getGroupCount("All Users");
  const activeUsers = getGroupCount("Active Users");
  const liveUsers = getGroupCount("Live Users");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Notification Groups
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage user groups for targeted push notifications
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchGroups}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={syncAllGroups}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {syncing ? "Syncing..." : "Sync All"}
          </button>
        </div>
      </div>

      {/* Sync Result Banner */}
      {syncResult?.results && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">All groups synced successfully!</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {syncResult.results.map((item, idx) => (
              <span key={idx} className="text-sm text-green-700">
                {item.groupName}: <strong>{item.userCount}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-800">{totalUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-800">{activeUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Active (30 days)</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-800">{liveUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Live Now</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Groups */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">System Groups</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SYSTEM_GROUPS.map((group) => {
            const Icon = group.icon;
            const colors = COLOR_CLASSES[group.color];
            const count = getGroupCount(group.groupName);
            const isSyncing = syncingType === group.type;

            return (
              <div
                key={group.type}
                className={`${colors.bg} rounded-xl p-4 border ${colors.border} cursor-pointer hover:shadow-md transition-all`}
                onClick={() => handleGroupClick(group, group.groupName)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${colors.icon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); syncGroup(group.type); }}
                    disabled={isSyncing}
                    className={`text-xs px-2 py-1 rounded-full ${colors.text} bg-white hover:bg-opacity-80 flex items-center gap-1`}
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                    Sync
                  </button>
                </div>
                <h3 className={`font-semibold ${colors.text}`}>{group.label}</h3>
                <p className="text-xs text-gray-500 mb-2">{group.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-800">{count.toLocaleString()}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loan Groups */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Loan Interest Groups</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {LOAN_GROUPS.map((group) => {
            const Icon = group.icon;
            const colors = COLOR_CLASSES[group.color];
            const count = getGroupCount(group.groupName);
            const isSyncing = syncingType === group.type;

            return (
              <div
                key={group.type}
                className={`${colors.bg} rounded-xl p-4 border ${colors.border} cursor-pointer hover:shadow-md transition-all`}
                onClick={() => handleGroupClick(group, group.groupName)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${colors.icon}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); syncGroup(group.type); }}
                    disabled={isSyncing}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                  </button>
                </div>
                <h3 className={`font-medium text-sm ${colors.text}`}>{group.label}</h3>
                <span className="text-xl font-bold text-gray-800">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Groups */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Custom Groups</h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              onClick={() => { setIsModalOpen(true); setEditId(null); setGroupName(""); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : filteredCustomGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No custom groups found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCustomGroups.map((group) => (
              <div
                key={group.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedGroup({ label: group.title, groupName: group.title, id: group.id, count: group.audienceCount });
                  setShowUsersPanel(true);
                  fetchGroupUsers(group.id);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{group.title}</h3>
                    <p className="text-xs text-gray-500">Created {group.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                    {group.audienceCount} users
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(group); }}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddUsers(group); }}
                      className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Users Side Panel */}
      {showUsersPanel && selectedGroup && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowUsersPanel(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{selectedGroup.label || selectedGroup.groupName}</h3>
                <p className="text-sm text-gray-500">{groupUsers.length} users</p>
              </div>
              <button onClick={() => setShowUsersPanel(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : groupUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No users in this group</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {groupUsers.map((user) => (
                    <div key={user.id} className="p-4 flex items-center gap-3 hover:bg-gray-50">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserCheck className="w-5 h-5 text-indigo-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {user.fullName || user.firstName || `User #${user.id}`}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {user.phoneNumber && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.phoneNumber}
                            </span>
                          )}
                          {user.emailAddress && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3" />
                              {user.emailAddress}
                            </span>
                          )}
                        </div>
                      </div>
                      {user.lookingFor && (
                        <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full whitespace-nowrap">
                          {user.lookingFor}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editId ? "Edit Group" : "Create New Group"}
            </h2>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setIsModalOpen(false); setEditId(null); setGroupName(""); }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveGroup}
                disabled={creating || !groupName.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
