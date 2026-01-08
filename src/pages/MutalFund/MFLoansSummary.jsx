// import React, { useEffect, useState, useMemo } from 'react';
// import { TrendingUp, IndianRupee, CheckCircle2, AlertCircle } from 'lucide-react';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, CartesianGrid } from 'recharts';
// import { getMFLoansSummary } from '../../api-services/Modules/MutalFundApi';

// const MFSummaryDashboard = () => {
//   const [loading, setLoading] = useState(false);
//   const [stats, setStats] = useState({
//     total_loans: 0,
//     total_loan_amount: 0,
//     average_loan_amount: 0,
//     active_loans: 0,
//     total_disbursal_amount: 0,
//     average_disbursal_amount: 0,
//     total_interest_amount: 0,
//     average_interest_rate: 0
//   });

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const response = await getMFLoansSummary();
      
//       console.log("Full API Response:", response.data); // Console check karo

//       if (response?.data?.success) {
//         // Agar response direct wahi JSON hai jo tune bheja:
//         const dataPath = response?.data?.data?.data; 
        
//         setStats({
//           total_loans: dataPath.total_loans || 0,
//           total_loan_amount: dataPath.total_loan_amount || 0,
//           average_loan_amount: dataPath.average_loan_amount || 0,
//           active_loans: dataPath.active_loans || 0,
//           total_disbursal_amount: dataPath.total_disbursal_amount || 0,
//           average_disbursal_amount: dataPath.average_disbursal_amount || 0,
//           total_interest_amount: dataPath.total_interest_amount || 0,
//           average_interest_rate: dataPath.average_interest_rate || 0,
//           completed: dataPath.total_loan_process_completed || 0,
//           rejected: dataPath.total_loan_rejected || 0
//         });
//       }
//     } catch (err) {
//       console.error("Fetch Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, []);

//   // Charts Logic (Data check ke saath)
//   const amountData = [
//     { name: 'Sanctioned', amount: stats.total_loan_amount || 0 },
//     { name: 'Disbursed', amount: stats.total_disbursal_amount || 0 },
//   ];

//   const statusData = [
//     { name: 'Active', value: stats.active_loans || 0, fill: '#6366f1' },
//     { name: 'Completed', value: stats.completed || 0, fill: '#10b981' },
//     { name: 'Rejected', value: stats.rejected || 0, fill: '#ef4444' },
//   ];

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Metrics Row */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//         <StatCard title="Total Loans" value={stats.total_loans} icon={CheckCircle2} color="bg-blue-600" />
//         <StatCard title="Total Amount" value={`₹${stats.total_loan_amount.toLocaleString()}`} icon={IndianRupee} color="bg-indigo-600" />
//         <StatCard title="Avg Interest" value={`${(stats.average_interest_rate * 100).toFixed(2)}%`} icon={TrendingUp} color="bg-emerald-600" />
//         <StatCard title="Disbursed" value={`₹${stats.total_disbursal_amount.toLocaleString()}`} icon={AlertCircle} color="bg-orange-600" />
//       </div>

      

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Bar Chart */}
//         <div className="bg-white p-6 rounded-xl shadow-sm border">
//           <h3 className="font-bold mb-4">Financial Overview</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={amountData}>
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                 <XAxis dataKey="name" />
//                 <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
//                 <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
//                 <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Pie Chart */}
//         <div className="bg-white p-6 rounded-xl shadow-sm border">
//           <h3 className="font-bold mb-4">Loan Status Distribution</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie data={statusData} innerRadius={60} outerRadius={80} dataKey="value" nameKey="name">
//                   {statusData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ title, value, icon: Icon, color }) => (
//   <div className="bg-white p-4 rounded-xl border flex items-center gap-4">
//     <div className={`p-3 rounded-lg ${color} text-white`}> <Icon size={20} /> </div>
//     <div>
//       <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
//       <p className="text-lg font-bold">{value}</p>
//     </div>
//   </div>
// );

// export default MFSummaryDashboard;

import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, IndianRupee, CheckCircle2, 
  Clock, AlertOctagon, Wallet, BarChart3, PieChart as PieIcon 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend, CartesianGrid 
} from 'recharts';
import { getMFLoansSummary } from '../../api-services/Modules/MutalFundApi';

const MFSummaryDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getMFLoansSummary();
      // Yaha hum direct wo object set kar rahe hain jo tune bheja
      if (response?.data?.success) {
        setStats(response.data.data?.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (!stats) return <div className="p-10 text-center">Loading Analytics...</div>;

  // --- Chart Data Preparation ---

  // 1. Amount Comparison (The Money Flow)
  const amountFlowData = [
    { name: 'Total Sanctioned', amount: stats.total_loan_amount, fill: '#6366f1' },
    { name: 'Active Loan', amount: stats.active_loan_amount, fill: '#8b5cf6' },
    { name: 'Total Disbursed', amount: stats.total_disbursal_amount, fill: '#10b981' },
  ];

  // 2. Status Distribution (The Process)
  const processData = [
    { name: 'Completed', value: stats.total_loan_process_completed || 0, fill: '#10b981' },
    { name: 'Pending', value: stats.total_loan_process_pending || 0, fill: '#f59e0b' },
    { name: 'Rejected', value: stats.total_loan_rejected || 0, fill: '#ef4444' },
    { name: 'Active', value: stats.active_loans || 0, fill: '#6366f1' },
  ];

  return (
    <div className=" bg-[#f8fafc] min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">MF Loan Insights</h1>

      {/* --- Section 1: Top Key Performance Indicators (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Avg. Interest Rate" 
          value={`${(stats.average_interest_rate * 100).toFixed(2)}%`} 
          icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" 
        />
        <StatCard 
          title="Total Interest Earned" 
          value={`₹${stats.total_interest_amount.toLocaleString()}`} 
          icon={Wallet} color="text-blue-600" bg="bg-blue-50" 
        />
        <StatCard 
          title="Avg. Ticket Size" 
          value={`₹${Math.round(stats.average_loan_amount).toLocaleString()}`} 
          icon={IndianRupee} color="text-purple-600" bg="bg-purple-50" 
        />
        <StatCard 
          title="Avg. Disbursal" 
          value={`₹${stats.average_disbursal_amount.toLocaleString()}`} 
          icon={CheckCircle2} color="text-indigo-600" bg="bg-indigo-50" 
        />
      </div>

      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Section 2: Money Flow Bar Chart (Large) --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <BarChart3 size={18} /> Loan Capital Flow
            </h3>
            <span className="text-xs font-medium text-slate-400">Values in INR</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={amountFlowData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  formatter={(val) => `₹${val.toLocaleString()}`}
                />
                <Bar dataKey="amount" radius={[10, 10, 0, 0]} barSize={60}>
                  {amountFlowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- Section 3: Process Pie Chart --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <PieIcon size={18} /> Loan Pipeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={processData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={10} 
                  dataKey="value"
                >
                  {processData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-center">
             <div>
               <p className="text-xs text-slate-400">Total Leads</p>
               <p className="font-bold text-slate-700">{stats.total_loans}</p>
             </div>
             <div>
               <p className="text-xs text-slate-400">Active</p>
               <p className="font-bold text-indigo-600">{stats.active_loans}</p>
             </div>
             <div>
               <p className="text-xs text-slate-400">Rejected</p>
               <p className="font-bold text-red-500">{stats.total_loan_rejected}</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// UI Helper Component
const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={`p-3 rounded-xl ${bg} ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default MFSummaryDashboard;