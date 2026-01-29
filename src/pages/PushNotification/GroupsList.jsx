import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/Table/DataTable";
import { groupListFullColumns } from "../../components/TableHeader";
import { RefreshCw, Users, Loader2, UserCheck, Phone, Mail } from "lucide-react";

// Default group tabs
const GROUP_TABS = [
  { label: "All Users", type: "all-users", groupName: "All Users" },
  { label: "Active Users", type: "active-users", groupName: "Active Users" },
  { label: "Live Users", type: "live-users", groupName: "Live Users" },
  { label: "Wedding Loan", type: "wedding-loan", groupName: "Wedding Loan" },
  { label: "Personal Loan", type: "instant-personal-loan", groupName: "Instant Personal Loan" },
  { label: "Travel Loan", type: "travel-loan", groupName: "Travel Loan" },
  { label: "Home Renovation", type: "home-renovation-loan", groupName: "Home Renovation Loan" },
  { label: "Emergency Loan", type: "emergency-loan", groupName: "Emergency Loan" },
];

export default function GroupList() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  // Tab and users state
  const [activeTab, setActiveTab] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [query, setQuery] = useState({
    search: '',
    filter_date: '',
    startDate: null,
    endDate: null,
    gender: '',
    minIncome: undefined,
    maxIncome: undefined,
    jobType: '',
  });

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

  // Fetch users in a specific group (single API call)
  const fetchGroupUsers = async (groupId) => {
    setLoadingUsers(true);
    setSelectedGroupId(groupId);
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

  // Handle tab click
  const handleTabClick = async (tab) => {
    setActiveTab(tab.type);
    setSyncResult(null);

    // Find the group by name
    const group = groups.find(g => g.title === tab.groupName);
    if (group) {
      await fetchGroupUsers(group.id);
    } else {
      setGroupUsers([]);
      setSelectedGroupId(null);
    }
  };

  // Sync and then show users
  const syncAndShowUsers = async (tab) => {
    setSyncing(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/push-notification/admin/groups/sync/${tab.type}`,
        { method: "POST" }
      );
      const json = await res.json();

      if (json?.success || json?.data) {
        await fetchGroups();
        // After syncing, fetch the updated group and users
        setTimeout(async () => {
          const updatedRes = await fetch(
            `${import.meta.env.VITE_API_URL}/push-notification/admin/group`
          );
          const updatedJson = await updatedRes.json();
          const list = updatedJson?.data?.data || [];
          const group = list.find(g => g.groupName === tab.groupName);
          if (group) {
            await fetchGroupUsers(group.id);
          }
        }, 500);
      }
    } catch (err) {
      console.error("Error syncing group:", err);
    }
    setSyncing(false);
  };

  // Sync all groups
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
        fetchGroups();
      } else {
        alert("Failed to sync groups");
      }
    } catch (err) {
      console.error("Error syncing groups:", err);
      alert("Error syncing groups");
    }
    setSyncing(false);
  };

  const handleEdit = (group) => {
    setEditId(group.id);
    setIsModalOpen(true);
    setGroupName(group?.title);
  };

  const updateGroup = async () => {
    if (!groupName.trim()) {
      alert("Group name is required");
      return;
    }

    setCreating(true);

    try {
      if (editId) {
        await fetch(`${import.meta.env.VITE_API_URL}/push-notification/admin/group/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: groupName }),
        });
      } else {
        await fetch(`${import.meta.env.VITE_API_URL}/push-notification/admin/group`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupName }),
        });
      }

      setCreating(false);
      setIsModalOpen(false);
      setGroupName("");
      setEditId(null);
      fetchGroups();
    } catch (err) {
      console.error("Error saving group:", err);
      setCreating(false);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      alert("Group name is required");
      return;
    }

    setCreating(true);

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/push-notification/admin/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName }),
      });

      setCreating(false);
      setIsModalOpen(false);
      setGroupName("");
      fetchGroups();
    } catch (err) {
      console.error("Error creating group:", err);
      setCreating(false);
    }
  };

  const handleAddUsers = (groupId) => {
    navigate(`/group/create?name=${groupId?.title}&groupId=${groupId?.id}`);
  };

  const onSearchHandler = useCallback((term) => {
    setQuery(prev => ({ ...prev, search: term }));
    setPagination({ pageIndex: 0, pageSize: 10 });
  }, []);

  const onPageChange = useCallback((pageInfo) => {
    setPagination(pageInfo);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [query]);

  // Get user count for a tab
  const getTabUserCount = (tab) => {
    const group = groups.find(g => g.title === tab.groupName);
    return group?.audienceCount || 0;
  };

  return (
    <div className="">
      {/* Sync Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Notification Groups</h3>
            <p className="text-sm text-gray-500">
              Manage and sync user groups for push notifications
            </p>
          </div>
          <button
            onClick={syncAllGroups}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {syncing ? "Syncing..." : "Sync All Groups"}
          </button>
        </div>

        {/* Sync Result */}
        {syncResult && syncResult.results && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">Sync completed successfully!</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {syncResult.results.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-green-700">
                  <Users className="w-3 h-3" />
                  <span>{item.groupName}: {item.userCount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap gap-1" aria-label="Tabs">
            {GROUP_TABS.map((tab) => (
              <button
                key={tab.type}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.type
                    ? "bg-indigo-100 text-indigo-700 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.type
                    ? "bg-indigo-200 text-indigo-800"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {getTabUserCount(tab)}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Users Table for Selected Tab */}
        {activeTab && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-700">
                {GROUP_TABS.find(t => t.type === activeTab)?.label} Users
              </h4>
              <button
                onClick={() => syncAndShowUsers(GROUP_TABS.find(t => t.type === activeTab))}
                disabled={syncing}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                Sync
              </button>
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-500">Loading users...</span>
              </div>
            ) : groupUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No users in this group</p>
                <button
                  onClick={() => syncAndShowUsers(GROUP_TABS.find(t => t.type === activeTab))}
                  className="mt-2 text-sm text-indigo-600 hover:underline"
                >
                  Click to sync users
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Looking For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupUsers.map((user, index) => (
                      <tr key={user.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{user.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserCheck className="w-4 h-4 text-indigo-600" />
                              </div>
                            )}
                            <span className="font-medium text-gray-800">
                              {user.fullName || user.firstName || `User #${user.id}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone className="w-3 h-3" />
                            {user.phoneNumber || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail className="w-3 h-3" />
                            {user.emailAddress || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                            {user.lookingFor || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-sm text-gray-500 text-right">
                  Total: {groupUsers.length} users
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Groups DataTable */}
      <DataTable
        columns={groupListFullColumns({
          handleEdit,
          handleAddUsers,
        })}
        title="All Groups"
        data={groups}
        loading={loading}
        totalDataCount={groups.length}
        onCreate={() => setIsModalOpen(true)}
        createLabel="Create Group"
        onPageChange={onPageChange}
        onRefresh={fetchGroups}
        onSearch={onSearchHandler}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[350px]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {editId ? "Edit Group" : "Create Group"}
            </h2>

            <input
              type="text"
              placeholder="Enter Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border px-3 py-2 rounded-md mb-4 focus:ring focus:outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditId(null);
                  setGroupName("");
                }}
              >
                Cancel
              </button>

              <button
                onClick={editId ? updateGroup : createGroup}
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
