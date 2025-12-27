// import React, { useEffect, useState, useCallback, useMemo } from 'react'
// import DataTable from '@components/Table/DataTable';
// import { Toaster } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom'
// import ToastNotification from '@components/Notification/ToastNotification';
// import { getLeads } from '../../../api-services/Modules/Leads';
// import { leadsColumn } from '../../../components/TableHeader';


// const debounce = (func, delay) => {
//   let timeoutId;
//   return (...args) => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => func(...args), delay);
//   };
// };

// const Leads = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState([]);
//   const [totalDataCount, setTotalDataCount] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [activeIncomeFilter, setActiveIncomeFilter] = useState('');
//   const [tablePagination, setTablePagination] = useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });

//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });

//   const [query, setQuery] = useState({
//     page_no: 1,
//     limit: 10,
//     search: '',
//     filter_date: '',
//     startDate: null,
//     endDate: null,
//     status: 'success',
//     gender: '',
//   });

//   const genderOptions = useMemo(() => [
//     { label: 'Male', value: 'male' },
//     { label: 'Female', value: 'female' },
//     { label: 'Other', value: 'other' },
//   ], []);

//   // 1️⃣ Define income ranges somewhere in your parent or inside DataTable
//   // const incomeRanges = [
//   //   { label: 'All', value: '' },
//   //   { label: 'Less than ₹20,000', value: '0-20000' },
//   //   { label: '₹20,001 - ₹50,000', value: '20001-50000' },
//   //   { label: '₹50,001 - ₹1,00,000', value: '50001-100000' },
//   //   { label: 'Above ₹1,00,000', value: '100001-' },
//   // ];

//   const incomeRanges = [
//     { label: 'All', value: '' },
//     { label: 'Less than ₹20,000', value: '0-20000' },
//     { label: '₹20,001 - ₹50,000', value: '20001-50000' },
//     { label: '₹50,001 - ₹1,00,000', value: '50001-100000' },
//     { label: 'Above ₹1,00,000', value: '100001-100000000' }, // 👈 FIX
//   ];




//   const handleGenderFilter = useCallback((newGender) => {
//     setQuery(prev => ({ ...prev, gender: newGender, page_no: 1 }));
//   }, []);




//   const handleCreate = () => {
//     navigate("/blogs/create");
//   };


//   // ⭐⭐⭐ FETCH + FRONTEND DATE FILTER ⭐⭐⭐
//   const fetchBlogs = async () => {
//     try {
//       setLoading(true);

//       // Fetch without date filter
//       const response = await getLeads();

//       if (response?.data?.success) {
//         let rows = response?.data?.data?.rows || [];

//         // ⭐ TODAY / YESTERDAY / LAST 7 DAYS
//         if (query.filter_date) {
//           const today = new Date();
//           const yesterday = new Date();
//           yesterday.setDate(today.getDate() - 1);

//           rows = rows.filter(item => {
//             const created = new Date(item.createdAt);

//             if (query.filter_date === "today") {
//               return created.toDateString() === today.toDateString();
//             }

//             if (query.filter_date === "yesterday") {
//               return created.toDateString() === yesterday.toDateString();
//             }

//             if (query.filter_date === "last_7_days") {
//               const last7 = new Date();
//               last7.setDate(today.getDate() - 7);
//               return created >= last7 && created <= today;
//             }

//             return true;
//           });
//         }

//         // ⭐ Custom Date Range Filter (frontend only)
//         if (query.startDate && query.endDate) {
//           rows = rows.filter(item => {
//             const created = new Date(item.createdAt);
//             return created >= new Date(query.startDate) &&
//               created <= new Date(query.endDate);
//           });
//         }

//         if (query.gender) {
//           rows = rows.filter(item => item.gender?.toLowerCase() == query.gender.toLowerCase());
//         }


//         // Set filtered data
//         setData(rows);
//         setTotalDataCount(rows.length);

//       } else {
//         ToastNotification.error("Error fetching data");
//       }
//     } catch (error) {
//       console.error('Error fetching:', error);
//       ToastNotification.error('Failed to fetch data');
//     } finally {
//       setLoading(false);
//     }
//   };


//   console.log(data, "data")


//   const handleEdit = (data) => {
//     navigate(`/lead-detail/${data?.id}`, {
//       state: { lead: data }
//     });
//   };


//   const onPageChange = useCallback((pageInfo) => {
//     setTablePagination({
//       pageIndex: pageInfo.pageIndex,
//       pageSize: pageInfo.pageSize,
//     });

//     setQuery(prevQuery => ({
//       ...prevQuery,
//       page_no: pageInfo.pageIndex + 1,
//       limit: pageInfo.pageSize,
//     }));
//   }, []);


//   const onSearchHandler = useCallback(term => {
//     setQuery(prev => ({ ...prev, search: term, page_no: 1 }));
//   }, []);

//   const debouncedSearch = useMemo(() => debounce(onSearchHandler, 300), []);


//   const onFilterByDate = useCallback(type => {
//     setQuery(prev => ({
//       ...prev,
//       filter_date: prev.filter_date === type ? '' : type,
//       startDate: null,
//       endDate: null,
//       page_no: 1
//     }));
//   }, []);


//   const onFilterByRange = useCallback(range => {
//     setQuery(prev => ({
//       ...prev,
//       startDate: range.startDate,
//       endDate: range.endDate,
//       filter_date: '',
//       page_no: 1
//     }));
//   }, []);


//   useEffect(() => {
//     fetchBlogs();
//   }, [query.page_no, query.search, query.startDate, query.endDate, query.gender, query.minIncome, query.maxIncome]);

//   console.log(query.search, "query.search")


//   const dynamicFiltersArray = useMemo(() => [
//     {
//       key: 'gender_filter',
//       label: 'Gender',
//       activeValue: query.gender,
//       options: genderOptions,
//       onChange: handleGenderFilter,
//     }
//   ], [query.gender, query.income, genderOptions, handleGenderFilter]);

//   const handleIncomeFilter = (value) => {
//     setActiveIncomeFilter(value);

//     // Reset
//     if (!value) {
//       setQuery(prev => ({
//         ...prev,
//         minIncome: undefined,
//         maxIncome: undefined,
//         page_no: 1,
//       }));
//       return;
//     }

//     const [min, max] = value.split('-');

//     const minIncome = Number(min);
//     const maxIncome = Number(max); // 👈 ALWAYS number

//     setQuery(prev => ({
//       ...prev,
//       minIncome,
//       maxIncome,
//       page_no: 1,
//     }));
//   };




//   return (
//     <>
//       <Toaster />

//       <DataTable
//         columns={leadsColumn({ handleEdit })}
//         title='Leads'
//         data={data}
//         totalDataCount={totalDataCount}
//         createLabel="Create"
//         onPageChange={onPageChange}
//         setPagination={setPagination}
//         pagination={pagination}
//         loading={loading}

//         onSearch={debouncedSearch}
//         onRefresh={fetchBlogs}

//         onFilterByDate={onFilterByDate}
//         activeFilter={query.filter_date}

//         onFilterByRange={onFilterByRange}
//         activeDateRange={{
//           startDate: query.startDate,
//           endDate: query.endDate
//         }}

//         activeStatusFilter={query.status}

//         dynamicFilters={dynamicFiltersArray}

//         onFilterByIncome={handleIncomeFilter}
//         incomeRanges={incomeRanges}
//         activeIncomeFilter={activeIncomeFilter}
//       />
//     </>
//   );
// };

// export default Leads;



import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import { getLeads } from '../../../api-services/Modules/Leads';
import { leadsColumn } from '../../../components/TableHeader';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SummaryCards from '../../../components/SummaryCards';

const Leads = () => {
  const navigate = useNavigate();

  const [rawData, setRawData] = useState([]);      // 🔥 full data
  const [data, setData] = useState([]);            // 🔥 paginated data
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeIncomeFilter, setActiveIncomeFilter] = useState('');

  const [summaryMetrics, setSummaryMetrics] = useState({
    totalLeads: 0,
    totalLoanAmount: 0,
    todayLeads: 0,
    dedupe: 0
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [query, setQuery] = useState({
    search: '',
    filter_date: '',
    startDate: null,
    endDate: null,
    gender: '',
    minIncome: undefined,
    maxIncome: undefined,
  });

  /* ========================= OPTIONS ========================= */

  const genderOptions = useMemo(() => [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ], []);

  const incomeRanges = [
    { label: 'All', value: '' },
    { label: 'Less than ₹20,000', value: '0-20000' },
    { label: '₹20,001 - ₹50,000', value: '20001-50000' },
    { label: '₹50,001 - ₹1,00,000', value: '50001-100000' },
    { label: 'Above ₹1,00,000', value: '100001-100000000' },
  ];


  const dobRanges = [
    { label: 'All', value: '' },
    { label: '18 - 25', value: '18-25' },
    { label: '26 - 35', value: '26-35' },
    { label: '36 - 45', value: '36-45' },
    { label: '45+', value: '45-200' },
  ];

  const handleDobFilter = useCallback((value) => {
    if (!value) {
      setQuery(prev => ({
        ...prev,
        minAge: undefined,
        maxAge: undefined,
        page_no: 1
      }));
      return;
    }

    const [min, max] = value.split('-');

    setQuery(prev => ({
      ...prev,
      minAge: Number(min),
      maxAge: Number(max),
      page_no: 1
    }));
  }, []);

  /* ========================= FETCH ========================= */

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await getLeads();

      if (response?.data?.success) {
        setRawData(response.data.data.rows || []);

        setSummaryMetrics({
          totalLeads: response?.data?.data?.summary?.totalLeads || 10,
          totalLoanAmount: response?.data?.data?.summary?.totalLoanAmount,
          todayLeads: response?.data?.data?.summary?.todayLeads,
          dedupe: response?.data?.data?.summary?.dedupe,
        });
      } else {
        ToastNotification.error("Failed to fetch leads");
      }
    } catch (err) {
      ToastNotification.error("API Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  /* ========================= FILTERING ========================= */

  const filteredData = useMemo(() => {
    let rows = [...rawData];

    // 🔍 SEARCH
    if (query.search) {
      const term = query.search.toLowerCase();
      rows = rows.filter(item =>
        item.firstName?.toLowerCase().includes(term) ||
        item.lastName?.toLowerCase().includes(term) ||
        item.emailAddress?.toLowerCase().includes(term) ||
        item.phoneNumber?.includes(term)
      );
    }

    // 👤 GENDER
    if (query.gender) {
      rows = rows.filter(r => r.gender?.toLowerCase() === query.gender);
    }

    // 💰 INCOME
    if (
      query.minIncome !== undefined &&
      query.maxIncome !== undefined
    ) {
      rows = rows.filter(item => {
        const income = Number(
          String(item.income || item.monthlyIncome || 0).replace(/,/g, '')
        );
        return income >= query.minIncome && income <= query.maxIncome;
      });
    }

    // 📅 TODAY / YESTERDAY
    if (query.filter_date) {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      rows = rows.filter(item => {
        const created = new Date(item.createdAt);

        if (query.filter_date === 'today') {
          return created.toDateString() === today.toDateString();
        }

        if (query.filter_date === 'yesterday') {
          return created.toDateString() === yesterday.toDateString();
        }

        return true;
      });
    }

    // 📆 CUSTOM RANGE
    if (query.startDate && query.endDate) {
      rows = rows.filter(item => {
        const created = new Date(item.createdAt);
        return (
          created >= new Date(query.startDate) &&
          created <= new Date(query.endDate)
        );
      });
    }

    // 🎂 DOB / AGE FILTER
    if (
      query.minAge !== undefined &&
      query.maxAge !== undefined
    ) {
      rows = rows.filter(item => {
        if (!item.dateOfBirth) return false;

        const dob = new Date(item.dateOfBirth);
        const ageDifMs = Date.now() - dob.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        return age >= query.minAge && age <= query.maxAge;
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

  const handleEdit = (row) => {
    navigate(`/lead-detail/${row.id}`, { state: { lead: row } });
  };

  const onPageChange = useCallback((pageInfo) => {
    setPagination(pageInfo);
  }, []);

  const onSearchHandler = useCallback((term) => {
    setQuery(prev => ({ ...prev, search: term }));
    // setPagination(p => ({ ...p, pageIndex: 10 }));
    setPagination({
      pageIndex: 0,
      pageSize: 10
    });
  }, []);

  const handleGenderFilter = useCallback((value) => {
    setQuery(prev => ({ ...prev, gender: value }));
    setPagination(p => ({ ...p, pageIndex: 0 }));
  }, []);

  const onFilterByDate = useCallback((type) => {
    setQuery(prev => ({
      ...prev,
      filter_date: prev.filter_date === type ? '' : type,
      startDate: null,
      endDate: null,
    }));
    setPagination(p => ({ ...p, pageIndex: 0 }));
  }, []);

  const onFilterByRange = useCallback((range) => {
    setQuery(prev => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
      filter_date: '',
    }));
    setPagination(p => ({ ...p, pageIndex: 0 }));
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

  const dynamicFiltersArray = useMemo(() => [
    {
      key: 'gender',
      label: 'Gender',
      activeValue: query.gender,
      options: genderOptions,
      onChange: handleGenderFilter,
    },
    {
      key: 'dob',
      label: 'Age',
      activeValue: query.minAge
        ? `${query.minAge}-${query.maxAge}`
        : '',
      options: dobRanges,
      onChange: handleDobFilter
    }
  ], [query.gender, query.minAge, query.maxAge]);

  const handleExport = async () => {
    if (!rawData || rawData.length === 0) {
      ToastNotification.error("No data to export");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads Lender Offers');

    /* =========================
       STEP 1: GET ALL UNIQUE LENDERS
    ========================= */

    const allLenders = Array.from(
      new Set(
        rawData.flatMap(item =>
          item.lender_responses?.map(lr => lr?.lender?.name)
        )
      )
    ).filter(Boolean);

    /* =========================
       STEP 2: DEFINE COLUMNS
    ========================= */

    worksheet.columns = [
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Income', key: 'income', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 15 },

      // 🔥 dynamic lender columns
      ...allLenders.map(lender => ({
        header: lender,
        key: lender,
        width: 15,
      })),


    ];

    /* =========================
       STEP 3: HEADER STYLING
    ========================= */

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFEFEF' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    /* =========================
       STEP 4: ADD ROWS
    ========================= */

    rawData.forEach(item => {
      const lenderStatusMap = {};

      // default = No for all lenders
      allLenders.forEach(lender => {
        lenderStatusMap[lender] = 'No';
      });

      // mark Yes where offer exists
      item.lender_responses?.forEach(lr => {
        const lenderName = lr?.lender?.name;
        if (lenderName && lr.isOffer) {
          lenderStatusMap[lenderName] = 'Yes';
        }
      });

      worksheet.addRow({
        firstName: item.firstName || 'N/A',
        lastName: item.lastName || 'N/A',
        email: item.emailAddress || 'N/A',
        phone: item.phoneNumber || 'N/A',
        income: item.income || item.monthlyIncome || 0,
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : 'N/A',
        ...lenderStatusMap
      });
    });

    /* =========================
       STEP 5: DOWNLOAD FILE
    ========================= */

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, 'Leads_Lender_Offer_Report.xlsx');
    ToastNotification.success("Excel exported successfully!");
  };

  const dynamicMetrics = useMemo(() => [
    {
      title: "Total Leads",
      value: Number(summaryMetrics.totalLeads) || 0,
      icon: "Users",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Loan Amount",
      value: Number(summaryMetrics.totalLoanAmount) || 0,
      icon: "CheckCircle",
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Today Leads",
      value: Number(summaryMetrics.todayLeads) || 0,
      icon: "XCircle",
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "Duplicate",
      value: Number(summaryMetrics.dedupe) || 0,
      icon: "TriangleAlert",
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    }
  ], [summaryMetrics]);



  return (
    <>
      <Toaster />

      <SummaryCards
        metrics={dynamicMetrics}
        loading={loading}
      />

      <DataTable
        title="Leads"
        columns={leadsColumn({ handleEdit })}
        data={data}
        totalDataCount={totalDataCount}
        loading={loading}

        pagination={pagination}
        onPageChange={onPageChange}

        onSearch={onSearchHandler}
        onRefresh={fetchLeads}

        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}

        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}

        dynamicFilters={dynamicFiltersArray}

        onFilterByIncome={handleIncomeFilter}
        incomeRanges={incomeRanges}
        activeIncomeFilter={activeIncomeFilter}

        onExport={handleExport}
      />
    </>
  );
};

export default Leads;
