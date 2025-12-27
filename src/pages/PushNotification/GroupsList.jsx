import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/Table/DataTable";
import { groupListFullColumns } from "../../components/TableHeader";

export default function GroupList() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);


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

  useEffect(() => {
    fetchGroups();
  }, []);



  return (
    <div className="">
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
        onPageChange={() => { }}
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
