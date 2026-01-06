import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getKycStageStatistics } from "../../api-services/Modules/DashboardApi";

const KycStageDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getKycStageStatistics(fromDate, toDate);
     setData(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load KYC stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          KYC Stage Statistics
        </h1>

        {/* Date Filters */}
        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded-md px-3 py-1 text-sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            className="border rounded-md px-3 py-1 text-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button
            onClick={fetchStats}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-indigo-700"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((item) => (
          <div
            key={item.stage}
            className="bg-white border rounded-xl shadow-sm p-4"
          >
            <p className="text-sm text-gray-500">{item.stage}</p>
            <p className="text-2xl font-bold text-gray-800">
              {item.count}
            </p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white border rounded-xl shadow-sm p-4 h-[350px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading statistics...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default KycStageDashboard;
