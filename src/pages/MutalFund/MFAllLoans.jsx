

// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import DataTable from '@components/Table/MainTable';
// import { Toaster } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import ToastNotification from '@components/Notification/ToastNotification';
// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
// import { getAllMFLoans, getAllMFUsers } from '../../api-services/Modules/MutalFundApi';
// import { leadsColumn, MFAllLoansColumn, MFAllUsersColumn } from '../../components/TableHeader';
// import SummaryCards from '../../components/SummaryCards';
// import ExportModal from '../../components/ExportModal';



// const exportToExcel = async (rawData) => {
//   if (!rawData || rawData.length === 0) {
//     ToastNotification.error("No data to export");
//     return;
//   }

//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Leads Lender Offers");

//   const allLenders = Array.from(
//     new Set(
//       rawData.flatMap(item =>
//         item.lender_responses?.map(lr => lr?.lender?.name)
//       )
//     )
//   ).filter(Boolean);

//   worksheet.columns = [
//     { header: "First Name", key: "firstName", width: 15 },
//     { header: "Last Name", key: "lastName", width: 15 },
//     { header: "Email", key: "email", width: 25 },
//     { header: "Phone", key: "phone", width: 15 },
//     { header: "Income", key: "income", width: 15 },
//     { header: "Created At", key: "createdAt", width: 15 },
//     { header: "ipAddress", key: "ipAddress", width: 15 },
//     { header: "creditConsentText", key: "creditConsentText", width: 15 },
//     { header: "communicationConsentText", key: "communicationConsentText", width: 15 },
//     ...allLenders.map(lender => ({
//       header: lender,
//       key: lender,
//       width: 15,
//     })),
//   ];

//   worksheet.getRow(1).font = { bold: true };

//   rawData.forEach(item => {
//     const lenderStatusMap = {};

//     allLenders.forEach(lender => {
//       lenderStatusMap[lender] = "No";
//     });

//     item.lender_responses?.forEach(lr => {
//       const lenderName = lr?.lender?.name;
//       if (lenderName && lr.isOffer) {
//         lenderStatusMap[lenderName] = "Yes";
//       }
//     });

//     worksheet.addRow({
//       firstName: item.firstName || "N/A",
//       lastName: item.lastName || "N/A",
//       email: item.emailAddress || "N/A",
//       phone: item.phoneNumber || "N/A",
//       income: item.income || item.monthlyIncome || 0,
//       //  ipAddress: item.ipAddress,
//       // creditConsentText: item.creditConsentText,
//       // communicationConsentText: item.communicationConsentText,
//       createdAt: item.createdAt
//         ? new Date(item.createdAt).toLocaleDateString("en-IN")
//         : "N/A",
//       ...lenderStatusMap,
//     });
//   });

//   const buffer = await workbook.xlsx.writeBuffer();
//   const blob = new Blob([buffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });

//   saveAs(blob, "All_Leads_Report.xlsx");
// };
// const MFAllLoans = () => {
//   const navigate = useNavigate();

//   const [rawData, setRawData] = useState([]);      // 🔥 full data
//   const [data, setData] = useState([]);            // 🔥 paginated data
//   const [totalDataCount, setTotalDataCount] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [activeIncomeFilter, setActiveIncomeFilter] = useState('');
//   const [isExportModalOpen, setIsExportModalOpen] = useState(false);
//   const [isExporting, setIsExporting] = useState(false);

//   const [summaryMetrics, setSummaryMetrics] = useState({
//     totalLeads: 0,
//     totalLoanAmount: 0,
//     todayLeads: 0,
//     dedupe: 0
//   });

//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });

//   const [query, setQuery] = useState({
//     search: '',
//     filter_date: '',
//     startDate: null,
//     endDate: null,
//     gender: '',
//     minIncome: undefined,
//     maxIncome: undefined,
//         jobType: '',
//   });

//   /* ========================= OPTIONS ========================= */

//   const genderOptions = useMemo(() => [
//     { label: 'Male', value: 'male' },
//     { label: 'Female', value: 'female' },
//     { label: 'Other', value: 'other' },
//   ], []);

//   const incomeRanges = [
//     { label: 'All', value: '' },
//     { label: 'Less than ₹20,000', value: '0-20000' },
//     { label: '₹20,001 - ₹50,000', value: '20001-50000' },
//     { label: '₹50,001 - ₹1,00,000', value: '50001-100000' },
//     { label: 'Above ₹1,00,000', value: '100001-100000000' },
//   ];

//   const dobRanges = [
//     { label: 'All', value: '' },
//     { label: '18 - 25', value: '18-25' },
//     { label: '26 - 35', value: '26-35' },
//     { label: '36 - 45', value: '36-45' },
//     { label: '45+', value: '45-200' },
//   ];

//    const jobTypeOptions = useMemo(() => [
//       { label: 'Salaried', value: 'salaried' },
//       { label: 'Self Employed', value: 'self-employed' },
//       { label: 'Business', value: 'business' },
//       { label: 'Freelancer', value: 'freelancer' }
//     ], []);

//       const handleJobTypeFilter = useCallback((jobType) => {
//         setQuery(prev => ({
//           ...prev,
//           jobType,
//           page_no: 1
//         }));
//       }, []);

//   const handleDobFilter = useCallback((value) => {
//     if (!value) {
//       setQuery(prev => ({
//         ...prev,
//         minAge: undefined,
//         maxAge: undefined,
//         page_no: 1
//       }));
//       return;
//     }

//     const [min, max] = value.split('-');

//     setQuery(prev => ({
//       ...prev,
//       minAge: Number(min),
//       maxAge: Number(max),
//       page_no: 1
//     }));
//   }, []);

//   /* ========================= FETCH ========================= */

//   const fetchLeads = async () => {
//     try {
//       setLoading(true);
//       const response = await getAllMFLoans();
//         console.log(response.data.data)
//       if (response?.data?.success) {
//         setRawData(response.data.data.data.data.data || []);

//         setSummaryMetrics({
//           totalLeads: response?.data?.data?.summary?.totalLeads || 10,
//           totalLoanAmount: response?.data?.data?.summary?.totalLoanAmount,
//           todayLeads: response?.data?.data?.summary?.todayLeads,
//           dedupe: response?.data?.data?.summary?.dedupe,
//         });
//       } else {
//         ToastNotification.error("Failed to fetch leads");
//       }
//     } catch (err) {
//       ToastNotification.error("API Error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchLeads();
//   }, []);

//   /* ========================= FILTERING ========================= */

//   const filteredData = useMemo(() => {
//     let rows = [...rawData];

//     // 🔍 SEARCH
//     if (query.search) {
//       const term = query.search.toLowerCase();
//       rows = rows.filter(item =>
//         item.firstName?.toLowerCase().includes(term) ||
//         item.lastName?.toLowerCase().includes(term) ||
//         item.emailAddress?.toLowerCase().includes(term) ||
//         item.phoneNumber?.includes(term)
//       );
//     }

//     // 👤 GENDER
//     if (query.gender) {
//       rows = rows.filter(r => r.gender?.toLowerCase() === query.gender);
//     }

//     // 💰 INCOME
//     if (
//       query.minIncome !== undefined &&
//       query.maxIncome !== undefined
//     ) {
//       rows = rows.filter(item => {
//         const income = Number(
//           String(item.income || item.monthlyIncome || 0).replace(/,/g, '')
//         );
//         return income >= query.minIncome && income <= query.maxIncome;
//       });
//     }

//     // 📅 TODAY / YESTERDAY
//     if (query.filter_date) {
//       const today = new Date();
//       const yesterday = new Date();
//       yesterday.setDate(today.getDate() - 1);

//       rows = rows.filter(item => {
//         const created = new Date(item.createdAt);

//         if (query.filter_date === 'today') {
//           return created.toDateString() === today.toDateString();
//         }

//         if (query.filter_date === 'yesterday') {
//           return created.toDateString() === yesterday.toDateString();
//         }

//         return true;
//       });
//     }

//     // 📆 CUSTOM RANGE
//     if (query.startDate && query.endDate) {
//       rows = rows.filter(item => {
//         const created = new Date(item.createdAt);
//         return (
//           created >= new Date(query.startDate) &&
//           created <= new Date(query.endDate)
//         );
//       });
//     }

//     // 🎂 DOB / AGE FILTER
//     if (
//       query.minAge !== undefined &&
//       query.maxAge !== undefined
//     ) {
//       rows = rows.filter(item => {
//         if (!item.date_of_birth) return false;

//         const dob = new Date(item.date_of_birth);
//         const ageDifMs = Date.now() - dob.getTime();
//         const ageDate = new Date(ageDifMs);
//         const age = Math.abs(ageDate.getUTCFullYear() - 1970);

//         return age >= query.minAge && age <= query.maxAge;
//       });
//     }

//       if (query.jobType) {
//       rows = rows.filter(item =>
//         item.jobType?.toLowerCase() === query.jobType
//       );
//     }


//     return rows;
//   }, [rawData, query]);

//   /* ========================= PAGINATION ========================= */

//   useEffect(() => {
//     const start = pagination.pageIndex * pagination.pageSize;
//     const end = start + pagination.pageSize;

//     setData(filteredData.slice(start, end));
//     setTotalDataCount(filteredData.length);
//   }, [filteredData, pagination]);

//   /* ========================= HANDLERS ========================= */

//   const handleEdit = (row) => {
//     navigate(`/lead-detail/${row.id}`, { state: { lead: row } });
//   };

//   const onPageChange = useCallback((pageInfo) => {
//     setPagination(pageInfo);
//   }, []);

//   const onSearchHandler = useCallback((term) => {
//     setQuery(prev => ({ ...prev, search: term }));
//     // setPagination(p => ({ ...p, pageIndex: 10 }));
//     setPagination({
//       pageIndex: 0,
//       pageSize: 10
//     });
//   }, []);

//   const handleGenderFilter = useCallback((value) => {
//     setQuery(prev => ({ ...prev, gender: value }));
//     setPagination(p => ({ ...p, pageIndex: 0 }));
//   }, []);

//   const onFilterByDate = useCallback((type) => {
//     setQuery(prev => ({
//       ...prev,
//       filter_date: prev.filter_date === type ? '' : type,
//       startDate: null,
//       endDate: null,
//     }));
//     setPagination(p => ({ ...p, pageIndex: 0 }));
//   }, []);

//   const onFilterByRange = useCallback((range) => {
//     setQuery(prev => ({
//       ...prev,
//       startDate: range.startDate,
//       endDate: range.endDate,
//       filter_date: '',
//     }));
//     setPagination(p => ({ ...p, pageIndex: 0 }));
//   }, []);

//   const handleIncomeFilter = (value) => {
//     setActiveIncomeFilter(value);

//     if (!value) {
//       setQuery(prev => ({ ...prev, minIncome: undefined, maxIncome: undefined }));
//       return;
//     }

//     const [min, max] = value.split('-').map(Number);
//     setQuery(prev => ({ ...prev, minIncome: min, maxIncome: max }));
//     setPagination(p => ({ ...p, pageIndex: 0 }));
//   };

//   const dynamicFiltersArray = useMemo(() => [
//     // {
//     //   key: 'gender',
//     //   label: 'Gender',
//     //   activeValue: query.gender,
//     //   options: genderOptions,
//     //   onChange: handleGenderFilter,
//     // },
//     //   {
//     //   key: 'jobType',                  // ✅ NEW
//     //   label: 'Job Type',
//     //   activeValue: query.jobType,
//     //   options: jobTypeOptions,
//     //   onChange: handleJobTypeFilter
//     // },
//     {
//       key: 'dob',
//       label: 'Age',
//       activeValue: query.minAge
//         ? `${query.minAge}-${query.maxAge}`
//         : '',
//       options: dobRanges,
//       onChange: handleDobFilter
//     }
//   ], [query.gender, query.minAge, query.maxAge, query.jobType, handleJobTypeFilter]);

//   const filterDataByDate = (data, startDate, endDate) => {
//     const start = new Date(startDate);
//     start.setHours(0, 0, 0, 0);

//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);

//     return data.filter(item => {
//       if (!item.createdAt) return false;
//       const created = new Date(item.createdAt);
//       return created >= start && created <= end;
//     });
//   };


//   const handleExport = async ({ startDate, endDate, mode }) => {
//     try {
//       setIsExporting(true);

//       // 🔥 STEP 1: FILTER FRONTEND DATA
//       const filteredData = filterDataByDate(rawData, startDate, endDate);

//       if (!filteredData.length) {
//         ToastNotification.error("No data found for selected date range");
//         return;
//       }

//       // 🔥 STEP 2: EXCEL EXPORT (tumhara existing code)
//       await exportToExcel(filteredData);

//       ToastNotification.success("Excel exported successfully");
//       setIsExportModalOpen(false);
//     } catch (error) {
//       console.error(error);
//       ToastNotification.error("Export failed");
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   const dynamicMetrics = useMemo(() => [
//     {
//       title: "Total Leads",
//       value: Number(summaryMetrics.totalLeads) || 0,
//       icon: "Users",
//       color: "text-blue-600",
//       bg: "bg-blue-50"
//     },
//     {
//       title: "Loan Amount",
//       value: Number(summaryMetrics.totalLoanAmount) || 0,
//       icon: "CheckCircle",
//       color: "text-green-600",
//       bg: "bg-green-50"
//     },
//     {
//       title: "Today Leads",
//       value: Number(summaryMetrics.todayLeads) || 0,
//       icon: "XCircle",
//       color: "text-red-600",
//       bg: "bg-red-50"
//     },
//     {
//       title: "Duplicate",
//       value: Number(summaryMetrics.dedupe) || 0,
//       icon: "TriangleAlert",
//       color: "text-yellow-600",
//       bg: "bg-yellow-50"
//     }
//   ], [summaryMetrics]);

//    const handleOpenExportModal = () => {
//     setIsExportModalOpen(true);
//   };

//   const handleCloseExportModal = () => {
//     if (!isExporting) {
//       setIsExportModalOpen(false);
//     }
//   };



//   return (
//     <>
//       <Toaster />
//       <ExportModal
//         open={isExportModalOpen}
//         onClose={handleCloseExportModal}
//         onSubmit={handleExport}
//         isSubmitting={isExporting}
//       />
//       <SummaryCards
//         metrics={dynamicMetrics}
//         loading={loading}
//       />

//       <DataTable
//         title="All MF Loans"
//         columns={MFAllLoansColumn({ handleEdit })}
//         data={data}
//         totalDataCount={totalDataCount}
//         loading={loading}

//         pagination={pagination}
//         onPageChange={onPageChange}

//         onSearch={onSearchHandler}
//         onRefresh={fetchLeads}

//         // onFilterByDate={onFilterByDate}
//         activeFilter={query.filter_date}

//         // onFilterByRange={onFilterByRange}
//         activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}

//         dynamicFilters={dynamicFiltersArray}

//         onFilterByIncome={handleIncomeFilter}
//         incomeRanges={incomeRanges}
//         activeIncomeFilter={activeIncomeFilter}

//         onExport={handleOpenExportModal}
//       />
//     </>
//   );
// };

// export default MFAllLoans;


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