// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { 
//   ArrowLeft, User, Mail, Phone, Calendar, 
//   Briefcase, Landmark, ShieldCheck, BadgeCheck,
//   TrendingUp, Wallet, Receipt, Percent, Clock
// } from 'lucide-react';

// const AllUserDetail = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   // Extracting data based on your specific JSON structure
//   const rawData = location.state?.user;
//   const userBase = rawData?.user;
//   const loan = rawData?.loanCreation?.[0]; // Taking the first loan object
//   const portfolios = rawData?.portfolios || [];


//   console.log(rawData, "rawData")
//   if (!rawData) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
//         <p className="text-slate-500 font-medium">User details not found.</p>
//         <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-bold">Go Back</button>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8">
//       {/* --- Header --- */}
//       <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
//             <ArrowLeft size={20} className="text-slate-600" />
//           </button>
//           <div>
//             <h1 className="text-2xl font-black text-slate-800">{userBase?.name || "N/A"}</h1>
//             <p className="text-slate-500 text-sm font-medium">Principal XID: <span className="text-indigo-600">{rawData.principal_xid}</span></p>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <span className={`px-4 py-2 rounded-full text-xs font-bold border ${rawData.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
//             {rawData.isActive ? 'ACTIVE ACCOUNT' : 'INACTIVE'}
//           </span>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* --- LEFT: User & Loan Summary --- */}
//         <div className="space-y-6">
//           {/* Identity Card */}
//           <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
//             <div className="flex items-center gap-4 mb-6">
//               <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl">
//                 {userBase?.name?.charAt(0)}
//               </div>
//               <div>
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Information</p>
//                 <p className="text-slate-700 font-bold">{userBase?.phoneNumber}</p>
//                 <p className="text-slate-500 text-xs">{userBase?.emailAddress}</p>
//               </div>
//             </div>
//             <div className="space-y-3 pt-4 border-t border-slate-50">
//                <DetailRow icon={ShieldCheck} label="KYC Status" value={rawData.verifyKyc_xid === 2 ? "Verified" : "Pending"} success={rawData.verifyKyc_xid === 2} />
//                <DetailRow icon={Calendar} label="Last Updated" value={new Date(rawData.updatedAt).toLocaleDateString('en-IN')} />
//             </div>
//           </div>

//           {/* Loan Overview Card */}
//           {loan && (
//             <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm bg-gradient-to-b from-white to-slate-50">
//               <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase">
//                 <Wallet size={18} className="text-indigo-600" /> Loan Terms
//               </h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="p-4 bg-white rounded-2xl border border-slate-100">
//                   <p className="text-[10px] font-bold text-slate-400 uppercase">Amount</p>
//                   <p className="text-lg font-black text-slate-800">₹{parseFloat(loan.disburshmentAmount).toLocaleString()}</p>
//                 </div>
//                 <div className="p-4 bg-white rounded-2xl border border-slate-100">
//                   <p className="text-[10px] font-bold text-slate-400 uppercase">Interest</p>
//                   <p className="text-lg font-black text-indigo-600">{loan.rateOfInterest}%</p>
//                 </div>
//                 <div className="p-4 bg-white rounded-2xl border border-slate-100">
//                   <p className="text-[10px] font-bold text-slate-400 uppercase">Tenure</p>
//                   <p className="text-lg font-black text-slate-800">{loan.tenure} Mo</p>
//                 </div>
//                 <div className="p-4 bg-white rounded-2xl border border-slate-100">
//                   <p className="text-[10px] font-bold text-slate-400 uppercase">Fee</p>
//                   <p className="text-lg font-black text-slate-800">₹{loan.processingFee}</p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* --- RIGHT: Portfolio Table --- */}
//         <div className="lg:col-span-2 space-y-6">
//           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
//             <div className="p-6 border-b border-slate-50 flex items-center justify-between">
//               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
//                 <Receipt size={20} className="text-indigo-600" /> Collateral Portfolio
//               </h3>
//               <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full">
//                 {portfolios.length} Holdings
//               </span>
//             </div>
            
//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
//                   <tr>
//                     <th className="px-6 py-4">ISIN & Folio</th>
//                     <th className="px-6 py-4">Quantity</th>
//                     <th className="px-6 py-4 text-right">Price</th>
//                     <th className="px-6 py-4 text-right">LTV</th>
//                     <th className="px-6 py-4 text-center">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-50">
//                   {portfolios.map((item) => (
//                     <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
//                       <td className="px-6 py-4">
//                         <p className="text-xs font-bold text-slate-800">{item.isin}</p>
//                         <p className="text-[10px] text-slate-400 font-mono">Folio: {item.folioNumber}</p>
//                       </td>
//                       <td className="px-6 py-4 text-xs font-bold text-slate-600">
//                         {parseFloat(item.quantity).toFixed(2)}
//                       </td>
//                       <td className="px-6 py-4 text-right text-xs font-bold text-slate-800">
//                         ₹{parseFloat(item.price).toLocaleString()}
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <span className="text-xs font-bold text-indigo-600">{(item.loan_to_value_ratio * 100)}%</span>
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         {item.approved === "true" ? (
//                           <BadgeCheck size={18} className="text-emerald-500 mx-auto" />
//                         ) : (
//                           <Clock size={18} className="text-slate-300 mx-auto" />
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// /* --- Internal Helpers --- */
// const DetailRow = ({ icon: Icon, label, value, success = false }) => (
//   <div className="flex justify-between items-center py-1">
//     <div className="flex items-center gap-2">
//       <Icon size={14} className="text-slate-400" />
//       <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
//     </div>
//     <span className={`text-xs font-bold ${success ? 'text-emerald-600' : 'text-slate-700'}`}>{value}</span>
//   </div>
// );

// export default AllUserDetail;



import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, 
  ShieldCheck, Wallet, Receipt, Percent, 
  Clock, CheckCircle2, Hash, Layers
} from 'lucide-react';

const AllUserDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Data Extraction from your JSON
  const data = location.state?.user;
  const userInfo = data?.user;
  const loan = data?.loanCreation?.[0]; // Pehla loan object
  const portfolios = data?.portfolios || [];

  if (!data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <p className="text-slate-500 font-medium">User details not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8 font-sans">
      
      {/* --- Header Section --- */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{userInfo?.name || "N/A"}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-slate-500 text-xs font-medium bg-slate-100 px-2 py-0.5 rounded">User ID: {data.user_id}</span>
              <span className="text-indigo-600 text-xs font-medium bg-indigo-50 px-2 py-0.5 rounded">Principal ID: {data.principal_xid}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider ${data.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            <div className={`w-2 h-2 rounded-full ${data.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {data.isActive ? 'Active Session' : 'Inactive'}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Left Column: Identity & Loan Summary --- */}
        <div className="space-y-6">
          
          {/* User Contact Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Contact & Verification</h3>
            <div className="space-y-5">
              <DetailItem icon={Phone} label="Phone Number" value={userInfo?.phoneNumber} />
              <DetailItem icon={Mail} label="Email Address" value={userInfo?.emailAddress} />
              <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">KYC Status</p>
                  <p className={`text-xs font-bold ${data.verifyKyc_xid === 2 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {data.verifyKyc_xid === 2 ? '✓ Verified' : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CAMS Status</p>
                  <p className="text-xs font-bold text-slate-700">{loan?.isCams ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Configuration Card */}
          {loan && (
            <div className="bg-[#1e293b] rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Loan Amount</p>
                  <h2 className="text-3xl font-black mt-1">₹{parseFloat(loan.disburshmentAmount).toLocaleString()}</h2>
                </div>
                <div className="p-2 bg-slate-700 rounded-xl">
                  <Wallet size={20} className="text-indigo-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Interest Rate</p>
                  <p className="text-lg font-bold flex items-center gap-1">{loan.rateOfInterest}% <Percent size={14} className="text-indigo-400"/></p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Tenure</p>
                  <p className="text-lg font-bold flex items-center gap-1">{loan.tenure} <Clock size={14} className="text-indigo-400"/> <span className="text-xs font-medium text-slate-400">Mo</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Processing Fee</p>
                  <p className="text-lg font-bold">₹{loan.processingFee}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Loan ID</p>
                  <p className="text-lg font-bold">#{loan.loan_id}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Right Column: Portfolio Table --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Layers size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Portfolio Details</h3>
              </div>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                {portfolios.length} Assets Linked
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scheme Info</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Qty / Price</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">LTV</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {portfolios.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-1.5 bg-slate-50 rounded text-slate-400 group-hover:text-indigo-600 transition-colors">
                            <Hash size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 mb-0.5">{item.isin}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Folio: <span className="text-slate-600">{item.folioNumber}</span></p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className="text-xs font-bold text-slate-700">{parseFloat(item.quantity).toFixed(2)} Units</p>
                        <p className="text-[10px] text-emerald-600 font-bold">@ ₹{parseFloat(item.price).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-black text-indigo-600">{(parseFloat(item.loan_to_value_ratio) * 100)}%</span>
                          <div className="w-8 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div className="bg-indigo-400 h-full" style={{ width: `${item.loan_to_value_ratio * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {item.approved === "true" ? (
                          <div className="flex justify-center" title="Approved">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                          </div>
                        ) : (
                          <div className="flex justify-center" title="Pending">
                            <Clock size={18} className="text-slate-300" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer Summary */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Portfolio Snapshot</p>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Units</p>
                  <p className="text-sm font-black text-slate-800">
                    {portfolios.reduce((acc, curr) => acc + parseFloat(curr.quantity), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Helper Component --- */
const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value || "N/A"}</p>
    </div>
  </div>
);

export default AllUserDetail;