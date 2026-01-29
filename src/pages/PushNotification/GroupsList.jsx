import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/Table/DataTable";
import { groupListFullColumns } from "../../components/TableHeader";
import { RefreshCw, Users, Loader2 } from "lucide-react";

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
        audienceCount: item.audienceCount || "—",
        createdAt: new Date(item.createdAt).toLocaleString(),
      }));

      setGroups(formatted);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
    setLoading(false);
  };

  const fetchSingleGroup = async (id) => {
    console.log(id)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/push-notification/admin/group/${id}`
      );
      const json = await res.json();

      if (json?.success) {
        setGroupName(json?.data?.groupName); // Autofill modal
      }
    } catch (err) {
      console.error("Error fetching group:", err);
    }
  };



  // CREATE GROUP API CALL
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

      // Refresh list
      fetchGroups();
    } catch (err) {
      console.error("Error creating group:", err);
      setCreating(false);
    }
  };

  const handleEdit = (group) => {
    console.log("Edit group:", group);
    setEditId(group.id);
    setIsModalOpen(true);
    // fetchSingleGroup(group);
    setGroupName(group?.title)
  };

  const updateGroup = async () => {
    if (!groupName.trim()) {
      alert("Group name is required");
      return;
    }

    setCreating(true);

    try {
      if (editId) {
        // UPDATE API (PUT)
        await fetch(`${import.meta.env.VITE_API_URL}/push-notification/admin/group/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: groupName }), // <-- correct payload
        });
      } else {
        // CREATE API (POST)
        await fetch(`${import.meta.env.VITE_API_URL}/push-notification/admin/group`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupName }), // <-- correct payload
        });
      }

      setCreating(false);
      setIsModalOpen(false);
      setGroupName("");
      setEditId(null);

      fetchGroups(); // Refresh table
    } catch (err) {
      console.error("Error saving group:", err);
      setCreating(false);
    }
  };


  const handleAddUsers = (groupId) => {
    console.log(groupId)
    navigate(`/group/create?name=${groupId?.title}&groupId=${groupId?.id}`);
  };

  // Sync all loan groups from lookingFor field
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
        fetchGroups(); // Refresh the list
      } else {
        alert("Failed to sync groups");
      }
    } catch (err) {
      console.error("Error syncing groups:", err);
      alert("Error syncing groups");
    }
    setSyncing(false);
  };

  // Sync a specific group
  const syncSpecificGroup = async (groupType) => {
    setSyncing(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/push-notification/admin/groups/sync/${groupType}`,
        { method: "POST" }
      );
      const json = await res.json();

      if (json?.success || json?.data) {
        alert(`Group synced successfully! Users: ${json?.data?.synced || 0}`);
        fetchGroups();
      } else {
        alert("Failed to sync group");
      }
    } catch (err) {
      console.error("Error syncing group:", err);
      alert("Error syncing group");
    }
    setSyncing(false);
  };


  const onSearchHandler = useCallback((term) => {
    setQuery(prev => ({ ...prev, search: term }));
    // setPagination(p => ({ ...p, pageIndex: 10 }));
    setPagination({
      pageIndex: 0,
      pageSize: 10
    });
  }, []);

  const onPageChange = useCallback((pageInfo) => {
    setPagination(pageInfo);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [query]);



  return (
    <div className="">
      {/* Sync Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Auto-Sync Groups</h3>
            <p className="text-sm text-gray-500">
              Sync loan groups from user&apos;s &quot;Looking For&quot; preferences
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
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
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

        {/* Quick Sync Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 mr-2">Quick sync:</span>
          {[
            { label: "All Users", type: "all-users" },
            { label: "Active Users", type: "active-users" },
            { label: "Wedding Loan", type: "wedding-loan" },
            { label: "Personal Loan", type: "instant-personal-loan" },
            { label: "Travel Loan", type: "travel-loan" },
            { label: "Home Renovation", type: "home-renovation-loan" },
            { label: "Emergency Loan", type: "emergency-loan" },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => syncSpecificGroup(item.type)}
              disabled={syncing}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full disabled:opacity-50 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={groupListFullColumns({
          handleEdit,
          handleAddUsers,
        })}
        title="Groups"
        data={groups}
        loading={loading}
        totalDataCount={groups.length}
        onCreate={() => setIsModalOpen(true)}
        createLabel="Create Group"
        onPageChange={onPageChange}
        onRefresh={fetchGroups}
        onSearch={onSearchHandler}
      />

      {/* ---------------------- MODAL ---------------------- */}
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
                onClick={() => setIsModalOpen(false)}
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
