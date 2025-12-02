import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/Table/DataTable";

export default function PushNotificationList() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch group list from backend
  useEffect(() => {
    async function fetchGroups() {
      try {
        const res = await fetch("/api/push-notification-groups");
        const data = await res.json();
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
      setLoading(false);
    }

    fetchGroups();
  }, []);

  const columns = [
    { accessorKey: "title", header: "Group Title" },
    { accessorKey: "audienceCount", header: "Users" },
    { accessorKey: "createdAt", header: "Created On" },
  ];

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={groups}
        loading={loading}
        totalDataCount={groups.length}
        title="Push Notification Groups"
        onCreate={() => navigate("/push-notification/create")} // ✅ Create button callback
        createLabel="Create Template"
        onPageChange={() => {}}
      />
    </div>
  );
}
