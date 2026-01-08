// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { 
//   ArrowLeft, User, Mail, Phone, Calendar, 
//   Briefcase, MapPin, ShieldCheck, Landmark, 
//   Clock, CheckCircle2, XCircle 
// } from 'lucide-react';

// const AllUserDetail = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const user = location.state?.user; // State se user data pakadna

//   const [activeTab, setActiveTab] = useState("Personal");

//   if (!user) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
//         <p className="text-slate-500 font-medium">User details not found.</p>
//         <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-bold flex items-center gap-2">
//           <ArrowLeft size={18} /> Go Back
//         </button>
//       </div>
//     );
//   }

//   const tabs = ["Personal", "Employment", "Verification"];

//   return (
//     <div className="bg-[#f8fafc] min-h-screen p-6">
//       {/* --- Header Section --- */}
//       <div className="flex items-center gap-4 mb-8">
//         <button 
//           onClick={() => navigate(-1)}
//           className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
//         >
//           <ArrowLeft size={20} className="text-slate-600" />
//         </button>
//         <div>
//           <h1 className="text-2xl font-extrabold text-slate-800">
//             {user.firstName} {user.lastName}
//           </h1>
//           <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
//             User ID: <span className="text-indigo-600 font-bold">{user.id}</span>
//             <span className="text-slate-300">|</span>
//             <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-slate-400">
//               <Clock size={12} /> Joined: {new Date(user.createdAt).toLocaleDateString('en-IN')}
//             </span>
//           </p>
//         </div>
//       </div>

//       {/* --- Tab Navigation --- */}
//       <div className="flex gap-8 mb-6 border-b border-slate-200">
//         {tabs.map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`pb-4 text-sm font-bold transition-all relative ${
//               activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
//             }`}
//           >
//             {tab}
//             {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full" />}
//           </button>
//         ))}
//       </div>

//       {/* --- Main Content Area --- */}
//       <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        
//         {/* 🔹 Tab 1: Personal Details */}
//         {activeTab === "Personal" && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10">
//             <DetailItem icon={User} label="Full Name" value={`${user.firstName} ${user.lastName}`} />
//             <DetailItem icon={Mail} label="Email Address" value={user.emailAddress} />
//             <DetailItem icon={Phone} label="Phone Number" value={user.phoneNumber} />
//             <DetailItem icon={Calendar} label="Date of Birth" value={user.date_of_birth || "N/A"} />
//             <DetailItem icon={User} label="Gender" value={user.gender || "Not Specified"} className="capitalize" />
//             <DetailItem icon={MapPin} label="IP Address" value={user.ipAddress || "0.0.0.0"} />
//           </div>
//         )}

//         {/* 🔹 Tab 2: Employment & Income */}
//         {activeTab === "Employment" && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10">
//             <DetailItem icon={Briefcase} label="Job Type" value={user.jobType || "N/A"} className="capitalize" />
//             <DetailItem 
//                 icon={Landmark} 
//                 label="Monthly Income" 
//                 value={user.income || user.monthlyIncome ? `₹${Number(user.income || user.monthlyIncome).toLocaleString('en-IN')}` : "N/A"} 
//             />
//             {/* Additional employment fields if available in your API */}
//             <DetailItem icon={ShieldCheck} label="Employment Verified" value={user.jobType ? "Yes" : "No"} />
//           </div>
//         )}

//         {/* 🔹 Tab 3: Consent & Verification */}
//         {activeTab === "Verification" && (
//           <div className="space-y-8">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <ConsentCard 
//                 title="Credit Consent" 
//                 text={user.creditConsentText} 
//                 status={!!user.creditConsentText} 
//               />
//               <ConsentCard 
//                 title="Communication Consent" 
//                 text={user.communicationConsentText} 
//                 status={!!user.communicationConsentText} 
//               />
//             </div>
//             <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
//                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Meta Data</p>
//                <p className="text-xs text-slate-500 leading-relaxed">
//                   User accepted all terms and conditions from IP <strong>{user.ipAddress}</strong> on <strong>{new Date(user.createdAt).toLocaleString()}</strong>.
//                </p>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// /* --- UI Helper Components --- */

// const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
//   <div className="flex items-start gap-4">
//     <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400">
//       <Icon size={20} />
//     </div>
//     <div>
//       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
//       <p className={`text-slate-800 font-bold text-sm ${className}`}>{value || "---"}</p>
//     </div>
//   </div>
// );

// const ConsentCard = ({ title, text, status }) => (
//   <div className={`p-6 rounded-2xl border ${status ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-slate-50'}`}>
//     <div className="flex items-center justify-between mb-3">
//       <h4 className="font-bold text-slate-800">{title}</h4>
//       {status ? (
//         <CheckCircle2 size={20} className="text-emerald-500" />
//       ) : (
//         <XCircle size={20} className="text-red-400" />
//       )}
//     </div>
//     <p className="text-xs text-slate-600 italic leading-relaxed">
//       "{text || "No consent text available for this user."}"
//     </p>
//   </div>
// );

// export default AllUserDetail;

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, 
  Fingerprint, CreditCard, Activity, 
  CheckCircle2, Clock, ShieldCheck
} from 'lucide-react';

const AllUserDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [activeTab, setActiveTab] = useState("Profile");

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <p className="text-slate-500 font-medium">User details not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-bold">Go Back</button>
      </div>
    );
  }

  // Status Badge Color Logic
  const getStatusStyles = (step) => {
    if (step === 'LOAN_PROCESS_COMPLETED') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (step === 'PENDING') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6">
      {/* --- Header Section --- */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">{user.first_name} {user.last_name}</h1>
            <p className="text-slate-500 text-sm font-medium">User ID: <span className="text-indigo-600 font-bold">{user.user_id}</span></p>
          </div>
        </div>
        
        {/* Loan Process Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-xs uppercase tracking-wide ${getStatusStyles(user.loan_process_step)}`}>
          <Activity size={14} />
          {user.loan_process_step?.replace(/_/g, ' ')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Left Column: Summary Card --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
              <User size={40} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{user.first_name}</h2>
            <p className="text-slate-400 text-sm mb-6">{user.email}</p>
            
            <div className="w-full pt-6 border-t border-slate-50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Loan ID</span>
                <span className="text-sm font-bold text-slate-800">#{user.loan_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">PAN Status</span>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <ShieldCheck size={14} /> Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Column: Tabs & Detailed Info --- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-extrabold text-slate-800 mb-8 flex items-center gap-2">
              <Fingerprint className="text-indigo-600" size={20} /> Identity & Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <DetailBox icon={Mail} label="Email Address" value={user.email} />
              <DetailBox icon={Phone} label="Phone Number" value={user.phone_number} />
              <DetailBox icon={CreditCard} label="PAN Number" value={user.pan} className="tracking-widest" />
              <DetailBox icon={Calendar} label="Date of Birth" value={new Date(user.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
            </div>

            <hr className="my-10 border-slate-50" />

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Registration Complete</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    This user has successfully completed the KYC and PAN verification. 
                    The loan process is currently in the <strong>{user.loan_process_step}</strong> stage.
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
const DetailBox = ({ icon: Icon, label, value, className = "" }) => (
  <div className="flex items-start gap-4">
    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-slate-800 font-bold text-sm ${className}`}>{value || "N/A"}</p>
    </div>
  </div>
);

export default AllUserDetail;