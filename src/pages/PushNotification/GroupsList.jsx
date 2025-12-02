// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import DataTable from "../../components/Table/DataTable";

// export default function GroupList() {
//   const navigate = useNavigate();

//   const [groups, setGroups] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch group list from backend
//   useEffect(() => {
//     async function fetchGroups() {
//       try {
//         const res = await fetch("/api/push-notification-groups");
//         const data = await res.json();
//         setGroups(data);
//       } catch (error) {
//         console.error("Error fetching groups:", error);
//       }
//       setLoading(false);
//     }

//     fetchGroups();
//   }, []);

//   const columns = [
//     { accessorKey: "title", header: "Group Title" },
//     { accessorKey: "audienceCount", header: "Users" },
//     { accessorKey: "createdAt", header: "Created On" },
//   ];

//   return (
//     <div className="p-6">
//       <DataTable
//         columns={columns}
//         data={groups}
//         loading={loading}
//         totalDataCount={groups.length}
//         title="Push Notification Groups"
//         onCreate={() => navigate("/group/create")} // ✅ Create button callback
//         createLabel="Create Group"
//         onPageChange={() => {}}
//       />
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import DataTable from "../../components/Table/DataTable";

// export default function GroupList() {
//   const navigate = useNavigate();

//   const [groups, setGroups] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch group list from backend
//   useEffect(() => {
//     async function fetchGroups() {
//       try {
//         const res = await fetch(
//           "https://uat.cready.in/api/push-notification/admin/group"
//         );

//         const json = await res.json();

//         // API returns: json.data.data (array)
//         const list = json?.data?.data || [];

//         // Map API response to table format
//         const formatted = list.map((item) => ({
//           id: item.id,
//           title: item.groupName,             // Table expects "title"
//           audienceCount: item.audienceCount || "—", // API doesn’t provide yet
//           createdAt: new Date(item.createdAt).toLocaleString(),
//         }));

//         setGroups(formatted);
//       } catch (error) {
//         console.error("Error fetching groups:", error);
//       }

//       setLoading(false);
//     }

//     fetchGroups();
//   }, []);

//   const columns = [
//     { accessorKey: "title", header: "Group Title" },
//     { accessorKey: "audienceCount", header: "Users" }, // currently "—"
//     { accessorKey: "createdAt", header: "Created On" },
//   ];

//   return (
//     <div className="p-6">
//       <DataTable
//         columns={columns}
//         data={groups}
//         loading={loading}
//         totalDataCount={groups.length}
//         title="Push Notification Groups"
//         onCreate={() => navigate("/group/create")}
//         createLabel="Create Group"
//         onPageChange={() => {}}
//       />
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import DataTable from "../../components/Table/DataTable";

// export default function GroupList() {
//   const navigate = useNavigate();

//   const [groups, setGroups] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Modal states
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [groupName, setGroupName] = useState("");
//   const [creating, setCreating] = useState(false);

//   // Fetch Groups
//   const fetchGroups = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         "https://uat.cready.in/api/push-notification/admin/group"
//       );
//       const json = await res.json();

//       const list = json?.data?.data || [];

//       const formatted = list.map((item) => ({
//         id: item.id,
//         title: item.groupName,
//         audienceCount: item.audienceCount || "—",
//         createdAt: new Date(item.createdAt).toLocaleString(),
//       }));

//       setGroups(formatted);
//     } catch (err) {
//       console.error("Error fetching groups:", err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchGroups();
//   }, []);

//   // CREATE GROUP API CALL
//   const createGroup = async () => {
//     if (!groupName.trim()) {
//       alert("Group name is required");
//       return;
//     }

//     setCreating(true);

//     try {
//       await fetch("https://uat.cready.in/api/push-notification/admin/group", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ groupName }),
//       });

//       setCreating(false);
//       setIsModalOpen(false);
//       setGroupName("");

//       // Refresh list
//       fetchGroups();
//     } catch (err) {
//       console.error("Error creating group:", err);
//       setCreating(false);
//     }
//   };

//   const columns = [
//     { accessorKey: "title", header: "Group Title" },
//     { accessorKey: "audienceCount", header: "Users" },
//     { accessorKey: "createdAt", header: "Created On" },
//   ];

//   return (
//     <div className="p-6">
//       {/* TABLE */}
//       <DataTable
//         columns={columns}
//         data={groups}
//         loading={loading}
//         totalDataCount={groups.length}
//         title="Push Notification Groups"
//         onCreate={() => setIsModalOpen(true)}
//         createLabel="Create Group"
//         onPageChange={() => {}}
//       />

//       {/* ---------------------- MODAL ---------------------- */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl w-[350px]">
//             <h2 className="text-xl font-semibold mb-4">Create Group</h2>

//             <input
//               type="text"
//               placeholder="Enter Group Name"
//               value={groupName}
//               onChange={(e) => setGroupName(e.target.value)}
//               className="w-full border px-3 py-2 rounded-md mb-4"
//             />

//             <div className="flex justify-end gap-3">
//               <button
//                 className="px-4 py-2 bg-gray-300 rounded"
//                 onClick={() => setIsModalOpen(false)}
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={createGroup}
//                 disabled={creating}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 {creating ? "Creating..." : "Create"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import DataTable from "../../components/Table/DataTable";
import { groupListFullColumns } from "../../components/TableHeader";

export default function GroupList() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  

  // Fetch Groups
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://uat.cready.in/api/push-notification/admin/group"
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

  useEffect(() => {
    fetchGroups();
  }, []);

  // CREATE GROUP API CALL
  const createGroup = async () => {
    if (!groupName.trim()) {
      alert("Group name is required");
      return;
    }

    setCreating(true);

    try {
      await fetch("https://uat.cready.in/api/push-notification/admin/group", {
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
  };

  const handleAddUsers = (groupId) => {
    navigate(`/group/create/${groupId}`);
  };

  // Columns for table
  const columns = [
    { accessorKey: "title", header: "Group Title" },
    { accessorKey: "audienceCount", header: "Users" },
    { accessorKey: "createdAt", header: "Created On" },
    {
      header: "Action",
      cell: ({ row }) => (
        <button
          onClick={() => navigate(`/group/create/${row.original.id}`)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FaUserPlus />
        </button>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Push Notification Groups
        </h1>

        <DataTable
          columns={groupListFullColumns({
            handleEdit,
            handleAddUsers,
          })}
          data={groups}
          loading={loading}
          totalDataCount={groups.length}
          onCreate={() => setIsModalOpen(true)}
          createLabel="Create Group"
          onPageChange={() => {}}
        />
      </div>

      {/* ---------------------- MODAL ---------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[350px]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Create Group
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
                onClick={createGroup}
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
