import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Users, UserPlus, Briefcase, Calendar, ShieldCheck } from 'lucide-react';

import { getAllInternalMFUsers, getAllMFUsers } from '../../api-services/Modules/MutalFundApi';
import { MFAllInternalUsersColumn, MFAllUsersColumn } from '../../components/TableHeader';

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

const exportToExcel = async (rawData) => {
  if (!rawData || rawData.length === 0) {
    ToastNotification.error("No data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Leads Lender Offers");

  const allLenders = Array.from(
    new Set(
      rawData.flatMap(item =>
        item.lender_responses?.map(lr => lr?.lender?.name)
      )
    )
  ).filter(Boolean);

  worksheet.columns = [
    { header: "First Name", key: "firstName", width: 15 },
    { header: "Last Name", key: "lastName", width: 15 },
    { header: "Email", key: "email", width: 25 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Income", key: "income", width: 15 },
    { header: "Created At", key: "createdAt", width: 15 },
    //  { header: "ipAddress", key: "ipAddress", width: 15 },
    // { header: "creditConsentText", key: "creditConsentText", width: 15 },
    // { header: "communicationConsentText", key: "communicationConsentText", width: 15 },
    ...allLenders.map(lender => ({
      header: lender,
      key: lender,
      width: 15,
    })),
  ];

  worksheet.getRow(1).font = { bold: true };

  rawData.forEach(item => {
    const lenderStatusMap = {};
    allLenders.forEach(lender => { lenderStatusMap[lender] = "No"; });

    item.lender_responses?.forEach(lr => {
      if (lr?.lender?.name && lr.isOffer) lenderStatusMap[lr.lender.name] = "Yes";
    });

    // worksheet.addRow wala part change karein
    worksheet.addRow({
      firstName: item.first_name || item.firstName || "N/A",
      lastName: item.last_name || item.lastName || "N/A",
      email: item.email || item.emailAddress || "N/A",
      phone: item.phone_number || item.phoneNumber || "N/A",
      income: item.income || 0,
      createdAt: (item.createdAt || item.date_of_birth)
        ? new Date(item.createdAt || item.date_of_birth).toLocaleDateString("en-IN")
        : "N/A",
      ...lenderStatusMap,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "Leads_Report.xlsx");
};

const MFAllUsers = () => {
  const navigate = useNavigate();

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
        const fName = (item.firstName || item.first_name || "").toLowerCase();
        const lName = (item.lastName || item.last_name || "").toLowerCase();
        const email = (item.emailAddress || item.email || "").toLowerCase();
        const phone = (item.phoneNumber || item.phone_number || "");

        return fName.includes(term) ||
          lName.includes(term) ||
          email.includes(term) ||
          phone.includes(term);
      });
    }

    if (query.startDate && query.endDate) {
      const start = new Date(query.startDate).setHours(0, 0, 0, 0);
      const end = new Date(query.endDate).setHours(23, 59, 59, 999);
      rows = rows.filter(item => {
        const created = new Date(item.createdAt).getTime();
        return created >= start && created <= end;
      });
    }

    return rows;
  }, [rawData, query]);

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
      {/* <ExportMf
        open={isExportModalOpen}
        onClose={handleCloseExportModal}
        onSubmit={handleExport} // Apne export function ko yaha link karein
        isSubmitting={isExporting}
      /> */}

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