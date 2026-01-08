import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Hash, 
  Info, Briefcase, Clock, ShieldCheck, 
  Wallet, TrendingUp, IndianRupee 
} from 'lucide-react';

const LoanDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const loan = location.state?.lead; 

  console.log(loan, "loan")
  const [activeTab, setActiveTab] = useState("Overview");

  if (!loan) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <p className="text-slate-500 font-medium">No loan details found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold">Go Back</button>
      </div>
    );
  }

  const tabs = ["Overview", "Financials", "Portfolio"];

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6">
      {/* --- Header Section --- */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-800">Loan #{loan.id}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${loan.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {loan.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Loan Type: <span className="text-indigo-600 font-bold">{loan.loan_type}</span></p>
        </div>
      </div>

      {/* --- Tab Navigation --- */}
      <div className="flex gap-8 mb-6 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full" />}
          </button>
        ))}
      </div>

      {/* --- Main Content Area --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10">
            <InfoItem icon={User} label="User ID" value={loan.user_id} />
            <InfoItem icon={Hash} label="Lender ID" value={loan.lender_id} />
            <InfoItem icon={Calendar} label="Start Date" value={new Date(loan.start_date).toLocaleDateString('en-IN')} />
            <InfoItem icon={Calendar} label="End Date" value={new Date(loan.end_date).toLocaleDateString('en-IN')} />
            <InfoItem icon={Clock} label="Tenure" value={`${loan.loan_tenure} Months`} />
            <InfoItem icon={ShieldCheck} label="Frequency" value={loan.loan_frequency} />
            <InfoItem icon={Briefcase} label="Bank Account ID" value={loan.bank_account_id} />
            <InfoItem icon={Info} label="Last Updated" value={new Date(loan.updated_at).toLocaleString()} />
          </div>
        )}

        {activeTab === "Financials" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatBox label="Sanctioned Amount" value={loan.loan_amount} icon={IndianRupee} color="blue" />
              <StatBox label="Disbursed Amount" value={loan.disbursement_amount} icon={Wallet} color="emerald" />
              <StatBox label="Remaining Amount" value={loan.remaining_amount} icon={TrendingUp} color="purple" />
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Interest Rate</p>
                <p className="text-2xl font-black text-slate-800">{(loan.interest_rate * 100).toFixed(2)}% <span className="text-sm font-medium text-slate-400">per annum</span></p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Interest Earned</p>
                <p className="text-2xl font-black text-orange-600">₹{loan.interest_amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Portfolio" && (
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Linked Portfolio IDs</h3>
            <div className="flex flex-wrap gap-3">
              {loan.portfolio_id.map((id) => (
                <div key={id} className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-bold text-sm">
                  Portfolio #{id}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-500 italic">Total {loan.portfolio_id.length} assets are pledged against this loan.</p>
          </div>
        )}

      </div>
    </div>
  );
};

/* --- Sub-Components for Clean Code --- */

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Icon size={18} /></div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-slate-800 font-bold text-sm">{value || "---"}</p>
    </div>
  </div>
);

const StatBox = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };
  return (
    <div className={`p-6 rounded-2xl border ${colors[color]} flex flex-col gap-3`}>
      <Icon size={24} />
      <div>
        <p className="text-[10px] font-bold uppercase opacity-80">{label}</p>
        <p className="text-xl font-black">₹{Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
};

export default LoanDetail;