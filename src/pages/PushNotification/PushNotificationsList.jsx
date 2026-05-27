import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  sendPushNotification,
  schedulePushNotification,
  testSendPushToToken,
} from "../../api-services/Modules/Leads";
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
  Clock,
  Calendar,
  Smartphone,
  Globe,
  TestTube2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function PushNotificationList() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [lastSendResult, setLastSendResult] = useState(null);

  // Send mode in the confirm modal
  const [sendMode, setSendMode] = useState("now"); // 'now' | 'schedule'
  const [scheduleAt, setScheduleAt] = useState(""); // datetime-local string
  const [scheduling, setScheduling] = useState(false);

  // Channel filter chips
  const [channelFilter, setChannelFilter] = useState("all"); // 'all' | 'mobile' | 'web'

  // Test push panel (debug helper)
  const [testOpen, setTestOpen] = useState(false);
  const [testToken, setTestToken] = useState("");
  const [testTitle, setTestTitle] = useState("Test push from Cready CMS");
  const [testBody, setTestBody] = useState(
    "If you can see this, the push pipe is working end-to-end."
  );
  const [testImage, setTestImage] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const sendTestPush = async () => {
    if (!testToken.trim()) {
      ToastNotification.error("Paste the FCM token first");
      return;
    }
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await testSendPushToToken({
        token: testToken.trim(),
        title: testTitle,
        body: testBody,
        ...(testImage.trim() && { imageUrl: testImage.trim() }),
      });
      const data = res?.data?.data || res?.data;
      const success = (data?.successCount ?? 0) > 0;
      setTestResult({
        success,
        successCount: data?.successCount ?? 0,
        failureCount: data?.failureCount ?? 0,
      });
      if (success) {
        ToastNotification.success(
          `Push delivered! Open the browser tab where this token was minted — you should see it within 5 seconds.`
        );
      } else {
        ToastNotification.error(
          "Push dispatched but FCM rejected it. Token may be expired or unregistered."
        );
      }
    } catch (err) {
      const status = err?.response?.status;
      const isBackendMissing = status === 404;
      setTestResult({
        success: false,
        backendMissing: isBackendMissing,
        status,
        error: err?.message || String(err),
      });
      ToastNotification.error(
        isBackendMissing
          ? "Backend doesn't have /test-send-token yet — redeploy Cready_New_Backend"
          : err?.response?.data?.message || `Test push failed (HTTP ${status || "??"})`
      );
    }
    setTestSending(false);
  };

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
    setSendMode("now");
    // Default schedule = +15 mins from now, formatted for datetime-local input
    const d = new Date(Date.now() + 15 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    setScheduleAt(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`
    );
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

  async function scheduleNotification() {
    if (!selectedTemplate) return;
    if (!scheduleAt) {
      ToastNotification.error("Please pick a date & time");
      return;
    }
    const when = new Date(scheduleAt);
    if (Number.isNaN(when.getTime())) {
      ToastNotification.error("Invalid date/time");
      return;
    }
    if (when.getTime() <= Date.now()) {
      ToastNotification.error("Schedule time must be in the future");
      return;
    }

    setScheduling(true);
    try {
      const response = await schedulePushNotification({
        templateId: selectedTemplate.id,
        scheduledAt: when.toISOString(),
      });
      if (response?.data?.success) {
        ToastNotification.success(
          `Scheduled for ${when.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}`
        );
        setShowConfirm(false);
        setSelectedTemplate(null);
      } else {
        ToastNotification.error(
          response?.data?.message || "Failed to schedule notification"
        );
      }
    } catch (error) {
      ToastNotification.error(
        error?.response?.data?.message || "Failed to schedule notification"
      );
    }
    setScheduling(false);
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

  // Stats — counted across ALL templates regardless of current filter.
  const totalTemplates = templates.length;
  const mobileCount = templates.filter((t) => (t.channel || "mobile") === "mobile").length;
  const webCount = templates.filter((t) => t.channel === "web").length;
  const totalAudience = templates.reduce(
    (sum, t) => sum + (t.group?.members?.length || 0),
    0
  );

  const visibleTemplates = templates.filter((t) => {
    if (channelFilter === "all") return true;
    if (channelFilter === "web") return t.channel === "web";
    return (t.channel || "mobile") === "mobile";
  });

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

      {/* Debug: send a push directly to a raw FCM token */}
      <div className="bg-white rounded-xl border border-amber-200 mb-4 overflow-hidden">
        <button
          type="button"
          onClick={() => setTestOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-md">
              <TestTube2 className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">
                Test push to a raw token
              </p>
              <p className="text-xs text-gray-500">
                Bypass groups/templates — verify the FCM pipe works for a
                specific browser/device.
              </p>
            </div>
          </div>
          {testOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {testOpen && (
          <div className="px-4 pb-4 pt-2 border-t border-amber-100 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                FCM Token
              </label>
              <textarea
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                placeholder="Paste the @creddy_fcm_token value from the browser's localStorage…"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300"
              />
              <p className="text-xs text-gray-400 mt-1">
                On creadyweb: DevTools → Application → Local Storage →{" "}
                <code className="bg-gray-100 px-1 rounded">
                  @creddy_fcm_token
                </code>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={testImage}
                  onChange={(e) => setTestImage(e.target.value)}
                  placeholder="https://…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Body
              </label>
              <textarea
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={sendTestPush}
                disabled={testSending || !testToken.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
              >
                {testSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {testSending ? "Sending…" : "Send Test Push"}
              </button>
              {testResult && (
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    testResult.success
                      ? "bg-green-100 text-green-700"
                      : testResult.backendMissing
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {testResult.success
                    ? `✓ FCM accepted (${testResult.successCount} success / ${testResult.failureCount} failed)`
                    : testResult.backendMissing
                      ? `⚠ Backend endpoint missing (404) — redeploy needed`
                      : `✗ ${testResult.status ? `HTTP ${testResult.status}` : "Request failed"} — ${testResult.error || "unknown"}`}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Channel filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
          Channel:
        </span>
        <button
          type="button"
          onClick={() => setChannelFilter("all")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            channelFilter === "all"
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          All ({totalTemplates})
        </button>
        <button
          type="button"
          onClick={() => setChannelFilter("mobile")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            channelFilter === "mobile"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Mobile ({mobileCount})
        </button>
        <button
          type="button"
          onClick={() => setChannelFilter("web")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            channelFilter === "web"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Web ({webCount})
        </button>
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
      ) : visibleTemplates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          {channelFilter === "web" ? (
            <Globe className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
          ) : (
            <Smartphone className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No {channelFilter === "web" ? "Web" : "Mobile"} Templates
          </h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            {channelFilter === "web"
              ? "Create a template and pick the \"Web Browser\" channel to push notifications to creadyweb users who have granted browser permission."
              : "Create a template with the \"Mobile App\" channel to push to Cready mobile app users."}
          </p>
          <button
            onClick={() => navigate("/push-notification/create")}
            className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg ${
              channelFilter === "web"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <Plus className="w-4 h-4" />
            Create {channelFilter === "web" ? "Web" : "Mobile"} Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleTemplates.map((template) => (
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
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-semibold text-gray-800 line-clamp-1">
                    {template.title}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {template.channel === "web" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold uppercase tracking-wider">
                        <Globe className="w-3 h-3" />
                        Web
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold uppercase tracking-wider">
                        <Smartphone className="w-3 h-3" />
                        Mobile
                      </span>
                    )}
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

            {/* Send Now / Schedule toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSendMode("now")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  sendMode === "now"
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Send className="w-4 h-4" />
                Send Now
              </button>
              <button
                type="button"
                onClick={() => setSendMode("schedule")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  sendMode === "schedule"
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Clock className="w-4 h-4" />
                Schedule
              </button>
            </div>

            {sendMode === "schedule" ? (
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Send at
                </label>
                <input
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  min={new Date(Date.now() + 60 * 1000)
                    .toISOString()
                    .slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Notification will be sent automatically at this time.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                This will send a push notification to all users in the selected
                group. This action cannot be undone.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedTemplate(null);
                }}
                disabled={scheduling}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              {sendMode === "now" ? (
                <button
                  onClick={sendNotification}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Now
                </button>
              ) : (
                <button
                  onClick={scheduleNotification}
                  disabled={scheduling || !scheduleAt}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scheduling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  {scheduling ? "Scheduling..." : "Schedule"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
