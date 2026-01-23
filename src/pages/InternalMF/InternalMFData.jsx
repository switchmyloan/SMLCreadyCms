import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/FrontendTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Users, UserPlus, Briefcase, Calendar, ShieldCheck } from 'lucide-react';
import ExportMf from '../../pages/MutalFund/ExportMf'
import { getAllInternalMFUsers } from '../../api-services/Modules/MutalFundApi';
import { MFAllInternalUsersColumn } from '../../components/TableHeader';

// --- Custom Stat Card Component ---
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${colorClass.bg} ${colorClass.text}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
      <h3 className="text-lg font-extrabold text-slate-800">{value}</h3>
    </div>
  </div>
);

const LOAN_STATUS_OPTIONS = [
  { label: "Pending", value: "1" },
  { label: "Approved", value: "2" },
  { label: "Rejected", value: "3" },
];

const LTV_OPTIONS = [
  { label: "50% LTV", value: "0.500000" },
  { label: "75% LTV", value: "0.750000" },
];

const exportToExcel = async (rawData) => {
  if (!rawData || rawData.length === 0) {
    ToastNotification.error("No data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("MF User Report");

  // 1. Columns Define karein (Aapke naye JSON ke according)
  worksheet.columns = [
    { header: "User ID", key: "userId", width: 10 },
    { header: "Name", key: "name", width: 25 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Email", key: "email", width: 30 },
    { header: "Registration Date", key: "createdAt", width: 15 },
    { header: "Loan Status", key: "loanStatus", width: 15 },
    { header: "Disbursed Amount", key: "loanAmount", width: 15 },
    { header: "Tenure (Months)", key: "tenure", width: 15 },
    { header: "ROI (%)", key: "roi", width: 10 },
    { header: "Total Portfolios", key: "portfolioCount", width: 15 },
    { header: "Total Portfolio Value", key: "totalValue", width: 20 },
    { header: "Active Status", key: "active", width: 10 },
  ];

  // Header styling
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F2F2F2' }
  };

  // 2. Data Rows add karein
  rawData.forEach(item => {
    // Portfolio Calculation
    const totalValue = item.portfolios?.reduce((acc, p) => {
      return acc + (parseFloat(p.price || 0) * parseFloat(p.quantity || 0));
    }, 0);

    const loanInfo = item.loanCreation?.[0] || {};

    // Status Mapping (status_xid logic)
    const statusMap = { "1": "Pending", "2": "Success", "3": "Rejected" };
    const displayStatus = statusMap[loanInfo.status_xid?.toString()] || "N/A";

    worksheet.addRow({
      userId: item.user_id || "N/A",
      name: item.user?.name || "N/A",
      phone: item.user?.phoneNumber || "N/A",
      email: item.user?.emailAddress || "N/A",
      createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "N/A",
      loanStatus: displayStatus,
      loanAmount: loanInfo.disburshmentAmount || 0,
      tenure: loanInfo.tenure || "N/A",
      roi: loanInfo.rateOfInterest || 0,
      portfolioCount: item.portfolios?.length || 0,
      totalValue: totalValue.toFixed(2), // 2 decimal points tak value
      active: item.isActive ? "Yes" : "No",
    });
  });
  // 3. File Save karein
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `MF_Users_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, fileName);
};

const MFAllUsers = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState;
  const [selectedLTV, setSelectedLTV] = useState;

  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeIncomeFilter, setActiveIncomeFilter] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [query, setQuery] = useState({
    search: '',
    filter_date: '',
    startDate: null,
    endDate: null,
    minAge: undefined,
    maxAge: undefined,
  });

  /* ========================= FETCH ========================= */

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await getAllInternalMFUsers();

      if (response?.data?.success) {
        // Data setting with safety check
        const usersList = Array.isArray(response.data.data) ? response.data.data : [];
        setRawData(usersList);
      } else {
        ToastNotification.error("Failed to fetch leads");
      }
    } catch (err) {
      ToastNotification.error("API Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  /* ========================= FRONTEND STATS CALCULATION ========================= */

  const userStats = useMemo(() => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return { total: 0, today: 0, salaried: 0, verified: 0 };
    }

    const todayStr = new Date().toDateString();

    return rawData.reduce((acc, user) => {
      acc.total += 1;

      // Today's Users
      if (user.createdAt && new Date(user.createdAt).toDateString() === todayStr) {
        acc.today += 1;
      }

      // Salaried Count
      if (user.jobType?.toLowerCase() === 'salaried') {
        acc.salaried += 1;
      }

      // Consent/Verified (If data exists)
      if (user.creditConsentText) {
        acc.verified += 1;
      }

      return acc;
    }, { total: 0, today: 0, salaried: 0, verified: 0 });
  }, [rawData]);

  /* ========================= FILTERING ========================= */

  const filteredData = useMemo(() => {
    if (!Array.isArray(rawData)) return [];
    let rows = [...rawData];

    if (query.search) {
      const term = query.search.toLowerCase();
      rows = rows.filter(item => {
        // Check all possible field names used in your columns
        console.log(item, 'iii')
        const name = (item.user?.name || item.user?.name || "").toLowerCase();
        const email = (item?.user?.emailAddress || item?.user?.email || "").toLowerCase();
        const phone = (item?.user?.phoneNumber || item.phone_number || "").toString();

        return name.includes(term) ||
          email.includes(term) ||
          phone.includes(term);
      });
    }

    if (selectedStatus) {
      rows = rows.filter(item =>
        item.loanCreation?.[0]?.status_xid?.toString() === selectedStatus
      );
    }

    // 3. LTV Ratio Filter (New Logic)
    if (selectedLTV) {
      rows = rows.filter(item =>
        // check if 'any' portfolio in the array matches the selected LTV
        item.portfolios?.some(portfolio =>
          portfolio.loan_to_value_ratio === selectedLTV
        )
      );
    }


    return rows;
  }, [rawData, query, selectedStatus, selectedLTV]);

  /* ========================= PAGINATION ========================= */

  useEffect(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    setData(filteredData.slice(start, end));
    setTotalDataCount(filteredData.length);
  }, [filteredData, pagination]);

  /* ========================= HANDLERS ========================= */

  const handleEdit = (row) => navigate(`/internal-MF-Detail/${row.id}`, { state: { user: row } });

  const onSearchHandler = useCallback((term) => {
    setQuery(prev => ({ ...prev, search: term }));
    // Critical: Reset to page 0 when search changes
    setPagination({ pageIndex: 0, pageSize: 10 });
  }, []);

  const handleIncomeFilter = (value) => {
    setActiveIncomeFilter(value);
    if (!value) {
      setQuery(prev => ({ ...prev, minIncome: undefined, maxIncome: undefined }));
      return;
    }
    const [min, max] = value.split('-').map(Number);
    setQuery(prev => ({ ...prev, minIncome: min, maxIncome: max }));
    setPagination(p => ({ ...p, pageIndex: 0 }));
  };


  const filterDataByDate = (data, startDate, endDate) => {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    return data.filter(item => {
      // Agar createdAt nahi hai, toh date_of_birth use karo (ya current date fallback ke liye)
      const dateToCompare = item.createdAt || item.date_of_birth;

      if (!dateToCompare) return false;

      const created = new Date(dateToCompare).getTime();
      return created >= start && created <= end;
    });
  };

  const handleExport = async ({ startDate, endDate }) => {
    try {
      setIsExporting(true);

      // Agar dates select nahi hain, toh rawData (saara data) bhej do
      const dataToExport = (startDate && endDate)
        ? filterDataByDate(rawData, startDate, endDate)
        : rawData;

      if (dataToExport.length === 0) {
        ToastNotification.error("No data found");
        return;
      }

      await exportToExcel(dataToExport);
      ToastNotification.success("Export successful");
    } catch (err) {
      ToastNotification.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };
  const handleCloseExportModal = () => {
    if (!isExporting) {
      setIsExportModalOpen(false);
    }
  };


  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <Toaster />
      <ExportMf
        open={isExportModalOpen}
        onClose={handleCloseExportModal}
        onSubmit={handleExport} // Apne export function ko yaha link karein
        isSubmitting={isExporting}
      />

      {/* --- Section 1: Custom User Cards --- */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered"
          value={userStats.total}
          icon={Users}
          colorClass={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
        />
        <StatCard
          title="Joined Today"
          value={userStats.today}
          icon={UserPlus}
          colorClass={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
        />
        <StatCard
          title="Salaried Users"
          value={userStats.salaried}
          icon={Briefcase}
          colorClass={{ bg: 'bg-orange-50', text: 'text-orange-600' }}
        />
        <StatCard
          title="Consent Given"
          value={userStats.verified}
          icon={ShieldCheck}
          colorClass={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
        />
      </div> */}

      {/* --- Section 2: Table --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <DataTable
          title="Internal Mutual Fund User Base"
          columns={MFAllInternalUsersColumn({ handleEdit })}
          data={data}
          dynamicFilters={[

            {
              label: "LTV Ratio",
              key: "ltv_filter",
              options: LTV_OPTIONS,
              activeValue: selectedLTV,
              onChange: (val) => {
                setSelectedLTV(val);
                setPagination(p => ({ ...p, pageIndex: 0 }));
              },
            }
          ]}
          totalDataCount={totalDataCount}
          loading={loading}
          pagination={pagination}
          onPageChange={setPagination}
          onSearch={onSearchHandler}
          onRefresh={fetchLeads}
          onFilterByIncome={handleIncomeFilter}
          onExport={() => setIsExportModalOpen(true)}
        />
      </div>
    </div>
  );
};

export default MFAllUsers;