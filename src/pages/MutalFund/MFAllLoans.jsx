import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  Landmark,
  Wallet,
  TrendingUp,
  IndianRupee,
  Layers,
  Scale
} from 'lucide-react';

import { getAllMFLoans } from '../../api-services/Modules/MutalFundApi';
import { MFAllLoansColumn } from '../../components/TableHeader';
import ExportModal from '../../components/ExportModal';

// --- Custom Stat Card Component ---
const CustomStatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${colorClass.bg} ${colorClass.text}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
      <h3 className="text-lg font-extrabold text-slate-800">{value}</h3>
    </div>
  </div>
);

const MFAllLoans = () => {
  const navigate = useNavigate();

  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [query, setQuery] = useState({ search: '' });

  /* ========================= FETCH ========================= */

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await getAllMFLoans();

      // Aapke JSON structure ke hisaab se path ye hai:
      // response.data (axios) -> data (success/data) -> data (code/detail/data) -> data (count/skip/data) -> data (actual array)
      const list = response?.data?.data?.data?.data?.data;

      if (Array.isArray(list)) {
        setRawData(list);
      } else {
        console.error("Data is not an array:", list);
        setRawData([]); // Fallback to empty array
      }
    } catch (err) {
      console.error(err);
      setRawData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  /* ========================= FRONTEND CALCULATIONS ========================= */

  const stats = useMemo(() => {
    if (!rawData.length) return { totalAmount: 0, totalDisbursed: 0, avgRate: 0, totalInterest: 0, count: 0 };

    const totals = rawData.reduce((acc, curr) => {
      acc.loan_amount += Number(curr.loan_amount || 0);
      acc.disbursement += Number(curr.disbursement_amount || 0);
      acc.interest_rate += Number(curr.interest_rate || 0);
      acc.interest_amt += Number(curr.interest_amount || 0);
      return acc;
    }, { loan_amount: 0, disbursement: 0, interest_rate: 0, interest_amt: 0 });

    return {
      totalAmount: totals.loan_amount,
      totalDisbursed: totals.disbursement,
      avgRate: (totals.interest_rate / rawData.length) * 100,
      totalInterest: totals.interest_amt,
      count: rawData.length
    };
  }, [rawData]);

  /* ========================= TABLE LOGIC ========================= */

  const filteredData = useMemo(() => {
    let rows = [...rawData];
    if (query.search) {
      const term = query.search.toLowerCase();
      rows = rows.filter(item =>
        item.id?.toString().includes(term) ||
        item.user_id?.toString().includes(term)
      );
    }
    return rows;
  }, [rawData, query]);

  useEffect(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    setData(filteredData.slice(start, end));
    setTotalDataCount(filteredData.length);
  }, [filteredData, pagination]);

  const onSearchHandler = useCallback((term) => {
    setQuery({ search: term });
    setPagination({ pageIndex: 0, pageSize: 10 });
  }, []);

  const handleOpenExportModal = () => setIsExportModalOpen(true);
  const handleCloseExportModal = () => !isExporting && setIsExportModalOpen(false);


  const handleEdit = (row) => {
    navigate(`/fetch-mf-loans/${row.user_id}`, { state: { lead: row } });
  };
  return (
    <div className=" bg-[#f8fafc] min-h-screen ">
      <Toaster />

      {/* --- Custom Dashboard Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <CustomStatCard
          title="Total Sanction"
          value={`₹${stats.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={Landmark}
          colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
        />
        <CustomStatCard
          title="Total Disbursed"
          value={`₹${stats.totalDisbursed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={Wallet}
          colorClass={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
        />
        <CustomStatCard
          title="Avg. Interest"
          value={`${stats.avgRate.toFixed(2)}%`}
          icon={TrendingUp}
          colorClass={{ bg: 'bg-orange-50', text: 'text-orange-600' }}
        />
        <CustomStatCard
          title="Interest Earned"
          value={`₹${stats.totalInterest.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          colorClass={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
        />
        <CustomStatCard
          title="Active Loans"
          value={stats.count}
          icon={Layers}
          colorClass={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
        />
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <DataTable
          title="Mutual Fund Loan Transactions"
          columns={MFAllLoansColumn({handleEdit})}
          data={data}
          totalDataCount={totalDataCount}
          loading={loading}
          pagination={pagination}
          onPageChange={(p) => setPagination(p)}
          onSearch={onSearchHandler}
          onRefresh={fetchLeads}
          onExport={handleOpenExportModal}
        />
      </div>

      <ExportModal
        open={isExportModalOpen}
        onClose={handleCloseExportModal}
        onSubmit={() => { }} // Apne purane excel logic ko yaha call karein
        isSubmitting={isExporting}
      />
    </div>
  );
};

export default MFAllLoans;