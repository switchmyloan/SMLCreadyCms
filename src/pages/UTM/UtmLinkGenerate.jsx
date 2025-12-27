import React, { useState, useMemo } from 'react';
import { Link2, Copy, CheckCircle } from 'lucide-react';
import ToastNotification from '@components/Notification/ToastNotification';

const UTMGenerator = () => {
  const [form, setForm] = useState({
    baseUrl: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmContent: '',
    utmAffid: '',
  });

  /* =========================
     AUTO GENERATE UTM LINK
  ========================= */

  const utmLink = useMemo(() => {
    if (!form.baseUrl) return '';

    try {
      let base = form.baseUrl.trim();

      // ✅ auto add protocol
      if (!/^https?:\/\//i.test(base)) {
        base = `https://${base}`;
      }

      const url = new URL(base);

      Object.entries({
        utm_source: form.utmSource,
        utm_medium: form.utmMedium,
        utm_campaign: form.utmCampaign,
        utm_content: form.utmContent,
        utm_affid: form.utmAffid,
      }).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value);
      });

      return url.toString();
    } catch {
      return '';
    }
  }, [form]);

  /* =========================
     FINAL UTM HEADER OBJECT
  ========================= */

  const utmHeader = useMemo(() => ({
    utm_source: form.utmSource || 'NA',
    utm_medium: form.utmMedium || 'NA',
    utm_campaign: form.utmCampaign || 'NA',
    utm_content: form.utmContent || 'NA',
    utm_link: utmLink || 'NA',
    utm_affid: form.utmAffid || 'NA',
  }), [form, utmLink]);

  /* =========================
     HANDLERS
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const copyLink = async () => {
    if (!utmLink) return;
    await navigator.clipboard.writeText(utmLink);
    ToastNotification.success('UTM link copied!');
  };

  const copyHeader = async () => {
    await navigator.clipboard.writeText(JSON.stringify(utmHeader, null, 2));
    ToastNotification.success('UTM header copied!');
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Link2 className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">UTM Generator</h1>
          <p className="text-sm text-gray-500">
            Create trackable campaign URLs
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            ['baseUrl', 'Base URL', 'example.com'],
            ['utmSource', 'UTM Source', 'google, facebook'],
            ['utmMedium', 'UTM Medium', 'cpc, banner'],
            ['utmCampaign', 'UTM Campaign', 'loan_offer'],
            ['utmContent', 'UTM Content', 'cta_button'],
            ['utmAffid', 'UTM Aff ID', 'affiliate_123'],
          ].map(([name, label, placeholder]) => (
            <div key={name}>
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ))}
        </div>

        {/* Generated Link */}
        <div className="bg-gray-50 border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Generated UTM Link</span>
            {utmLink && <CheckCircle className="text-green-600" size={18} />}
          </div>
          <textarea
            readOnly
            value={utmLink}
            rows={3}
            placeholder="Generated link will appear here..."
            className="w-full bg-transparent text-sm resize-none outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={copyLink}
            disabled={!utmLink}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white
              ${utmLink ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}
            `}
          >
            <Copy size={16} />
            Copy Link
          </button>

          <button
            onClick={copyHeader}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900"
          >
            <Copy size={16} />
            Copy UTM Header
          </button>
        </div>

        {/* Preview Object */}
        <div className="bg-black text-green-400 rounded-xl p-4 text-sm font-mono overflow-auto">
          {JSON.stringify(utmHeader, null, 2)}
        </div>

      </div>
    </div>
  );
};

export default UTMGenerator;
