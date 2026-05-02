import React, { useEffect, useState } from "react";
import { Phone, ShieldCheck, Calendar, Loader2, ArrowLeft, X } from "lucide-react";
import {
  requestExportOtp,
  verifyExportOtp,
} from "../api-services/Modules/Leads";
import ToastNotification from "./Notification/ToastNotification";

/**
 * OTP-gated export modal.
 *
 * Step 1: enter mobile number  -> requestOtp
 * Step 2: enter 6-digit OTP    -> verifyOtp -> short-lived token
 * Step 3: pick date range/mode -> onSubmit({ startDate, endDate, mode, token })
 *
 * Drop-in compatible with the existing ExportModal: parent passes
 * `open`, `onClose`, `onSubmit`, `isSubmitting`. The submit payload
 * adds a `token` field that the parent forwards on the actual export
 * API call as `X-Export-Token`.
 */

const getYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const ExportOtpModal = ({ open, onClose, onSubmit, isSubmitting = false }) => {
  const [step, setStep] = useState("mobile"); // 'mobile' | 'otp' | 'range'
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [token, setToken] = useState("");
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [busy, setBusy] = useState(false);

  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [exportMode, setExportMode] = useState("range");

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setStep("mobile");
      setMobile("");
      setOtp("");
      setSessionId(null);
      setToken("");
      setTokenExpiresAt(null);
      setBusy(false);
      setDates({ startDate: "", endDate: "" });
      setExportMode("range");
    }
  }, [open]);

  if (!open) return null;

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    if (busy) return;
    if (!/^\d{10}$/.test(mobile.trim())) {
      ToastNotification.error("Enter a valid 10-digit mobile number");
      return;
    }
    setBusy(true);
    try {
      const res = await requestExportOtp(mobile.trim());
      if (res?.data?.success) {
        setSessionId(res.data.data?.sessionId);
        setStep("otp");
        ToastNotification.success("OTP sent");
      } else {
        ToastNotification.error(
          res?.data?.message || "Failed to send OTP"
        );
      }
    } catch (err) {
      ToastNotification.error(
        err?.response?.data?.message || "Failed to send OTP"
      );
    }
    setBusy(false);
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault?.();
    if (busy) return;
    if (!/^\d{4,8}$/.test(otp.trim())) {
      ToastNotification.error("Enter the OTP");
      return;
    }
    setBusy(true);
    try {
      const res = await verifyExportOtp(sessionId, otp.trim());
      if (res?.data?.success) {
        setToken(res.data.data?.token);
        setTokenExpiresAt(res.data.data?.tokenExpiresAt);
        setStep("range");
        ToastNotification.success("Verified");
      } else {
        ToastNotification.error(res?.data?.message || "Incorrect OTP");
      }
    } catch (err) {
      ToastNotification.error(
        err?.response?.data?.message || "Incorrect OTP"
      );
    }
    setBusy(false);
  };

  const handleModeChange = (newMode) => {
    setExportMode(newMode);
    if (newMode !== "range") setDates({ startDate: "", endDate: "" });
  };

  const calculateDateRange = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (exportMode === "today") {
      const s = getYYYYMMDD(today);
      return { startDate: s, endDate: s };
    }
    if (exportMode === "yesterday") {
      const s = getYYYYMMDD(yesterday);
      return { startDate: s, endDate: s };
    }
    return dates;
  };

  const handleFinalSubmit = (e) => {
    e?.preventDefault?.();
    if (isSubmitting || busy) return;
    if (!token) {
      ToastNotification.error("Please verify OTP first");
      setStep("mobile");
      return;
    }
    const { startDate, endDate } = calculateDateRange();
    if (exportMode === "range" && (!startDate || !endDate)) {
      ToastNotification.error("Pick start and end date");
      return;
    }
    onSubmit({ startDate, endDate, mode: exportMode, token });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step !== "mobile" && (
              <button
                type="button"
                onClick={() => {
                  if (busy || isSubmitting) return;
                  setStep(step === "range" ? "otp" : "mobile");
                }}
                className="p-1 -ml-1 text-gray-500 hover:bg-gray-100 rounded"
                title="Back"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <h2 className="text-base font-bold text-gray-800">
              {step === "mobile" && "Verify Mobile"}
              {step === "otp" && "Enter OTP"}
              {step === "range" && "Select Export Range"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-1.5">
            {["mobile", "otp", "range"].map((s, i) => {
              const order = ["mobile", "otp", "range"];
              const idx = order.indexOf(step);
              const active = order.indexOf(s) <= idx;
              return (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    active ? "bg-indigo-500" : "bg-gray-200"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {step === "mobile" && (
            <form onSubmit={handleSendOtp}>
              <p className="text-xs text-gray-500 mb-3">
                Exports are tracked. Enter your registered mobile number to
                receive a one-time password.
              </p>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5" />
                Mobile Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit number"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm"
                autoFocus
              />
              <button
                type="submit"
                disabled={busy || !mobile}
                className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-semibold"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                {busy ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <p className="text-xs text-gray-500 mb-3">
                We sent a code to <span className="font-semibold">{mobile}</span>. It expires
                in 5 minutes.
              </p>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                One-time password
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="Enter OTP"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm tracking-[0.4em] text-center font-mono"
                autoFocus
              />
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={busy}
                  className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
                >
                  Resend
                </button>
                <button
                  type="submit"
                  disabled={busy || !otp}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {busy ? "Verifying..." : "Verify"}
                </button>
              </div>
            </form>
          )}

          {step === "range" && (
            <form onSubmit={handleFinalSubmit}>
              {tokenExpiresAt && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1.5 mb-3">
                  Verified. Token valid until{" "}
                  {new Date(tokenExpiresAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}

              <div className="mb-4 flex flex-col space-y-2">
                {[
                  { value: "today", label: "Today" },
                  { value: "yesterday", label: "Yesterday" },
                  { value: "range", label: "Date Range (select below)" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="exportMode"
                      value={opt.value}
                      checked={exportMode === opt.value}
                      onChange={(e) => handleModeChange(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-200"
                    />
                    <span className="text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>

              {exportMode === "range" && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" /> From
                    </label>
                    <input
                      type="date"
                      value={dates.startDate}
                      onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" /> To
                    </label>
                    <input
                      type="date"
                      value={dates.endDate}
                      onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Exporting..." : "Export"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportOtpModal;
