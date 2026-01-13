import React, { useState } from 'react';

const ExportModal = ({ open, onClose, onSubmit, isSubmitting }) => {
  const [dates, setDates] = useState({ startDate: '', endDate: '' });

  if (!open) return null;

  const handleApply = () => {
    if (!dates.startDate || !dates.endDate) {
      alert("Please select both dates");
      return;
    }
    onSubmit(dates);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Export Leads Data</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Start Date</label>
            <input 
              type="date" 
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
            <input 
              type="date" 
              className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button 
            onClick={onClose}
            className="flex-1 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleApply}
            disabled={isSubmitting}
            className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:bg-blue-300"
          >
            {isSubmitting ? "Exporting..." : "Download Excel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;