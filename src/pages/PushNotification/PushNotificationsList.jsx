import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/Table/DataTable";
import { pushNotificationColumns } from "../../components/TableHeader";
import { sendPushNotification } from "../../api-services/Modules/Leads"
import { Toaster } from "react-hot-toast";
import ToastNotification from "../../components/Notification/ToastNotification";

export default function PushNotificationList() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch group list from backend

  async function fetchGroups() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/push-notification/admin/templates`);
      const response = await res.json();
      if (response?.success) {
        setGroups(response?.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching groups:", error);
    }
    setLoading(false);
  }

  async function sendNotification(templateId) {
    console.log(templateId, "templateId")

    const response = await sendPushNotification({ templateId: templateId });

    if (response?.data?.success) {
      const { successCount, failureCount, totalUsers } = response.data;
      ToastNotification.success(
        `Notification sent! ${successCount}/${totalUsers} delivered${failureCount > 0 ? `, ${failureCount} failed` : ''}`
      );
    } else {
      ToastNotification.error(`Failed to send notification`);
    }
  }


  useEffect(() => {
    fetchGroups();
  }, []);

  const handleEdit = (group) => {
    console.log("Edit group:", group);
    // setEditId(group.id);
    navigate(`/push-notification/${group.id}`)
  };

  return (
    <div className="p-6">
      <Toaster />
      <DataTable
        columns={pushNotificationColumns({
          sendNotification,
          handleEdit
        })}
        data={groups}
        loading={loading}
        totalDataCount={groups.length}
        title="Push Notification Groups"
        onCreate={() => navigate("/push-notification/create")} // ✅ Create button callback
        createLabel="Create Template"
        onPageChange={() => { }}
             onRefresh={fetchGroups}
      />
    </div>
  );
}
