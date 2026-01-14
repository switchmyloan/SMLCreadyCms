// import React from 'react';
// import { TrendingUp, Users, Download, Activity } from 'lucide-react';

// const AppMetricsDisplay = () => {
//   // Mock data representing the response from {{baseURL}}/api/public/admin/app-metrics
//   const stats = [
//     { label: 'Total Installs', value: '12,482', change: '+12%', icon: <Download size={20}/>, color: 'text-blue-600', bg: 'bg-blue-100' },
//     { label: 'Active Users', value: '3,120', change: '+5%', icon: <Users size={20}/>, color: 'text-purple-600', bg: 'bg-purple-100' },
//     { label: 'Avg Session', value: '4m 32s', change: '-2%', icon: <Activity size={20}/>, color: 'text-orange-600', bg: 'bg-orange-100' },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {stats.map((stat, i) => (
//           <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
//             <div className="flex justify-between items-start">
//               <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
//                 {stat.icon}
//               </div>
//               <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
//                 {stat.change}
//               </span>
//             </div>
//             <div className="mt-4">
//               <p className="text-sm text-gray-500">{stat.label}</p>
//               <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Detailed Table */}
//       <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
//           <h3 className="font-semibold">Recent Metric Logs</h3>
//           <button className="text-sm text-blue-600 hover:font-medium">View All</button>
//         </div>
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
//               <th className="px-6 py-3">Date</th>
//               <th className="px-6 py-3">Platform</th>
//               <th className="px-6 py-3">Events</th>
//               <th className="px-6 py-3">Status</th>
//             </tr>
//           </thead>
//           <tbody className="text-sm divide-y divide-gray-100">
//             {[1, 2, 3].map((item) => (
//               <tr key={item} className="hover:bg-gray-50 transition-colors">
//                 <td className="px-6 py-4 text-gray-600">2023-10-2{item}</td>
//                 <td className="px-6 py-4 font-medium">Android/iOS</td>
//                 <td className="px-6 py-4">4,200</td>
//                 <td className="px-6 py-4">
//                   <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md">Live</span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AppMetricsDisplay;

import React, { useEffect, useState, useCallback } from 'react';
import { Download, RefreshCw, Trash2, Loader2, AlertCircle, Calendar } from 'lucide-react';

const AppMetricsDisplay = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/public/admin/app-metrics`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const json = await response.json();
      
      if (json.success) {
        setMetrics(json);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <p className="text-gray-500 animate-pulse">Loading data...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-red-700 flex items-center gap-3">
      <AlertCircle size={20} />
      <p>Error: {error}</p>
      <button onClick={fetchMetrics} className="ml-auto underline font-bold">Retry</button>
    </div>
  );

  // Mapping summary data to cards
  const summaryCards = [
    { 
      label: 'New Installs', 
      value: metrics?.summary?.newInstalls?.toLocaleString() || '0', 
      icon: <Download size={20}/>, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'App Updates', 
      value: metrics?.summary?.updates?.toLocaleString() || '0', 
      icon: <RefreshCw size={20}/>, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Uninstalls After Install', 
      value: (metrics?.summary?.uninstallsAfterInstall) || '0', 
      icon: <Trash2 size={20}/>, 
      color: 'text-red-600', 
      bg: 'bg-red-50' 
    },
    { 
      label: 'Uninstalls After Update', 
      value: (metrics?.summary?.uninstallsAfterUpdate) || '0', 
      icon: <Trash2 size={20}/>, 
      color: 'text-red-600', 
      bg: 'bg-red-50' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* 📊 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {summaryCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* 📋 Data Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-900">Daily Breakdown</h3>
            <p className="text-xs text-gray-500">Showing last {metrics?.count} entries</p>
          </div>
          <button onClick={fetchMetrics} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Installs</th>
                <th className="px-6 py-4 text-center">Updates</th>
                <th className="px-6 py-4 text-center">Uninstalls After Install</th>
                <th className="px-6 py-4 text-center">Uninstalls After Update</th>
                {/* <th className="px-6 py-4 text-right">Status</th> */}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {metrics?.data?.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-700">
                        {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-green-600">
                    {item?.newInstalls}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-purple-600">
                    {item?.updates}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-blue-600">
                    {item?.uninstallsAfterInstall}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-blue-600">
                    {item?.uninstallsAfterUpdate}
                  </td>
                  {/* <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppMetricsDisplay;