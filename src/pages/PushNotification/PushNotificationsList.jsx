import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPushNotification } from "../../api-services/Modules/Leads";
import { Toaster } from "react-hot-toast";
import ToastNotification from "../../components/Notification/ToastNotification";
import {
  Bell,
  Plus,
  Send,
  Edit2,
  Trash2,
  Users,
  FileText,
  Loader2,
  RefreshCw,
  Image,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

export default function PushNotificationList() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [lastSendResult, setLastSendResult] = useState(null);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/push-notification/admin/templates`
      );
      const response = await res.json();
      if (response?.success) {
        setTemplates(response?.data || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      ToastNotification.error("Failed to fetch templates");
    }
    setLoading(false);
  }

  const confirmSend = (template) => {
    setSelectedTemplate(template);
    setShowConfirm(true);
    setLastSendResult(null);
  };

  async function sendNotification() {
    if (!selectedTemplate) return;

    setSendingId(selectedTemplate.id);
    setShowConfirm(false);

    try {
      const response = await sendPushNotification({
        templateId: selectedTemplate.id,
      });

      if (response?.data?.success) {
        const { successCount, failureCount, totalUsers } = response.data;
        setLastSendResult({
          templateId: selectedTemplate.id,
          success: true,
          successCount,
          failureCount,
          totalUsers,
        });
        ToastNotification.success(
          `Notification sent! ${successCount}/${totalUsers} delivered`
        );
      } else {
        setLastSendResult({
          templateId: selectedTemplate.id,
          success: false,
        });
        ToastNotification.error("Failed to send notification");
      }
    } catch (error) {
      setLastSendResult({
        templateId: selectedTemplate.id,
        success: false,
      });
      ToastNotification.error("Failed to send notification");
    }

    setSendingId(null);
    setSelectedTemplate(null);
  }

  const handleEdit = (template) => {
    navigate(`/push-notification/${template.id}`);
  };

  const handleDelete = async (template) => {
    if (!window.confirm(`Delete template "${template.title}"?`)) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/push-notification/admin/templates/${template.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        ToastNotification.success("Template deleted");
        fetchTemplates();
      } else {
        ToastNotification.error("Failed to delete template");
      }
    } catch (error) {
      ToastNotification.error("Failed to delete template");
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Stats
  const totalTemplates = templates.length;
  const totalAudience = templates.reduce(
    (sum, t) => sum + (t.group?.members?.length || 0),
    0
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-7 h-7 text-indigo-600" />
            Push Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and send push notifications to your users
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchTemplates}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate("/push-notification/create")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalTemplates}</p>
              <p className="text-sm text-gray-500">Total Templates</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalAudience}</p>
              <p className="text-sm text-gray-500">Total Audience</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Send className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {lastSendResult?.success ? lastSendResult.successCount : "-"}
              </p>
              <p className="text-sm text-gray-500">Last Send Success</p>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-3 text-gray-500">Loading templates...</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Templates Yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first push notification template to get started
          </p>
          <button
            onClick={() => navigate("/push-notification/create")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Template Image */}
              {template.imageUrl ? (
                <div className="h-32 bg-gray-100 overflow-hidden">
                  <img
                    src={template.imageUrl}
                    alt={template.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                  <Image className="w-10 h-10 text-indigo-200" />
                </div>
              )}

              {/* Template Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 line-clamp-1">
                    {template.title}
                  </h3>
                  {lastSendResult?.templateId === template.id && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        lastSendResult.success
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {lastSendResult.success ? "Sent" : "Failed"}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-3 min-h-[40px]">
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  {template.message || "No message"}
                </p>

                {/* Group Info */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                    <Users className="w-3 h-3" />
                    {template.group?.groupName || "No Group"}
                  </span>
                  {template.group?.members && (
                    <span className="text-xs text-gray-400">
                      {template.group.members.length} users
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => confirmSend(template)}
                    disabled={sendingId === template.id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {sendingId === template.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {sendingId === template.id ? "Sending..." : "Send"}
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-50 rounded-full">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Send Notification?
              </h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-gray-800 mb-1">
                {selectedTemplate.title}
              </p>
              <p className="text-sm text-gray-500 line-clamp-2">
                {selectedTemplate.message}
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-gray-600">
                  Target: {selectedTemplate.group?.groupName || "Unknown Group"}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              This will send a push notification to all users in the selected
              group. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedTemplate(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendNotification}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
