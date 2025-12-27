// import React, { useCallback, useEffect, useMemo, useState } from 'react'
// import DataTable from '@components/Table/DataTable';
// import { Toaster } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom'
// import ToastNotification from '@components/Notification/ToastNotification';
// import { signInColumns } from '@components/TableHeader';
// import { getInAppLeads } from '../../../api-services/Modules/Leads';

// const debounce = (func, delay) => {
//   let timeoutId;
//   return (...args) => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => func(...args), delay);
//   };
// };

// const SignInUsers = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState([]);
//   const [totalDataCount, setTotalDataCount] = useState(0);
//   const [loading, setLoading] = useState(false);
//    const [tablePagination, setTablePagination] = useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 10
//   })
//   const [query, setQuery] = useState({
//     page_no: 1,
//     limit: 10,
//     search: '',
//     filter_date: '',
//     startDate: null,
//     endDate: null,
//     status: 'success'
//   })

//   const fetchBlogs = async () => {
//     try {
//       setLoading(true);
//       const response = await getInAppLeads(query.page_no, query.limit, '');
//       if (response?.data?.success) {
//         setData(response?.data?.data?.rows || []);
//         setTotalDataCount(response?.data?.data?.pagination?.total || 0);
//       } else {
//         ToastNotification.error("Error fetching data");
//       }
//     } catch (error) {
//       console.error('Error fetching:', error);

//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (data) => {
//     navigate(`/lead-detail/${data?.id}`, {
//       state: { lead: data }
//     })
//   }

//   const onPageChange = useCallback((pageInfo) => {
//     setTablePagination({
//       pageIndex: pageInfo.pageIndex,
//       pageSize: pageInfo.pageSize,
//     });
//     setQuery((prevQuery) => {
//       return {
//         ...prevQuery,
//         page_no: pageInfo.pageIndex + 1, // 1-based index for query
//         limit: pageInfo.pageSize, // new limit
//       };
//     });
//   }, []);

//    const handleStatusFilter = useCallback(newStatus => {
//     setQuery(prev => ({ ...prev, status: newStatus, page_no: 1 }));
//   }, []);


//   const onSearchHandler = useCallback(term => {
//     setQuery(prev => ({ ...prev, search: term, page_no: 1 }));
//   }, []);

//   const debouncedSearch = useMemo(() => debounce(onSearchHandler, 300), [onSearchHandler]);

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
//   }, [query.page_no,  query.status]);

//   return (
//     <>
//       <Toaster />
//       <DataTable
//         columns={signInColumns({
//           handleEdit
//         })}
//         title='Sign In Users'
//         data={data}
//         totalDataCount={totalDataCount}
//         // onCreate={handleCreate}
//         createLabel="Create"
//         onPageChange={onPageChange}
//         setPagination={setPagination}
//         pagination={pagination}
//         loading={loading}
//          onSearch={debouncedSearch}
//         onRefresh={fetchBlogs}
//         // onExport={handleExport}

//           // Filters
//         onFilterByDate={onFilterByDate}
//         activeFilter={query.filter_date}
//         onFilterByRange={onFilterByRange}
//         activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}

//         // STATUS FILTER
//         // onFilterChange={handleStatusFilter}
//         activeStatusFilter={query.status}
//       />
//     </>
//   )
// }

// export default SignInUsers;


import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import { signInColumns } from '@components/TableHeader';
import { getInAppLeads } from '../../../api-services/Modules/Leads';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SummaryCards from '../../../components/SummaryCards';


// ---------------- DEBOUNCE ----------------
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const SignInUsers = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeIncomeFilter, setActiveIncomeFilter] = useState('');

  const [rawData, setRawData] = useState([]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  });


  const [summaryMetrics, setSummaryMetrics] = useState({
    totalUsers: 0,
    totalLoanAmount: 0,
    totalOffers: 0,
    usersWithOffers: 0
  });

  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
    filter_date: '',
    startDate: null,
    endDate: null,
    status: 'success',
    gender: '',
    minIncome: undefined,
    maxIncome: undefined
  });

  // ---------------- FETCH DATA ----------------
  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const response = await getInAppLeads();

      if (response?.data?.success) {
        setRawData(response.data.data.rows || []);

        setSummaryMetrics({
          totalUsers: response?.data?.data?.summary?.totalUsers || 10,
          totalLoanAmount: response?.data?.data?.summary?.totalLoanAmount,
          totalOffers: response?.data?.data?.summary?.totalOffers,
          usersWithOffers: response?.data?.data?.summary?.usersWithOffers,
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

    return rows;
  }, [rawData, query]);


  useEffect(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;

    setData(filteredData.slice(start, end));
    setTotalDataCount(filteredData.length);
  }, [filteredData, pagination]);
  // ---------------- EDIT ----------------
  const handleEdit = (row) => {
    navigate(`/lead-detail/${row?.id}`, {
      state: { lead: row }
    });
  };

  // ---------------- PAGINATION ----------------
  const onPageChange = useCallback((pageInfo) => {
    setPagination({
      pageIndex: pageInfo.pageIndex,
      pageSize: pageInfo.pageSize
    });

    setQuery(prev => ({
      ...prev,
      page_no: pageInfo.pageIndex + 1,
      limit: pageInfo.pageSize
    }));
  }, []);

  // ---------------- SEARCH ----------------
  const onSearchHandler = useCallback((term) => {
    setQuery(prev => ({ ...prev, search: term }));
    // setPagination(p => ({ ...p, pageIndex: 10 }));
    setPagination({
      pageIndex: 0,
      pageSize: 10
    });
  }, []);

  useEffect(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;

    const slicedData = filteredData.slice(start, end);

    setData(slicedData);
    setTotalDataCount(filteredData.length);
  }, [filteredData, pagination]);

  const debouncedSearch = useMemo(
    () => debounce(onSearchHandler, 300),
    []
  );

  // ---------------- DATE FILTER ----------------
  const onFilterByDate = (type) => {
    setQuery(prev => ({
      ...prev,
      filter_date: prev.filter_date === type ? '' : type,
      startDate: null,
      endDate: null,
      page_no: 1
    }));
  };

  const onFilterByRange = (range) => {
    setQuery(prev => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
      filter_date: '',
      page_no: 1
    }));
  };

  // ---------------- INCOME FILTER ----------------
  const handleIncomeFilter = (value) => {
    setActiveIncomeFilter(value);

    if (!value) {
      setQuery(prev => ({
        ...prev,
        minIncome: undefined,
        maxIncome: undefined,
        page_no: 1
      }));
      return;
    }

    const [min, max] = value.split('-');

    setQuery(prev => ({
      ...prev,
      minIncome: Number(min),
      maxIncome: Number(max),
      page_no: 1
    }));
  };

  // ---------------- GENDER FILTER ----------------
  const handleGenderFilter = useCallback((gender) => {
    setQuery(prev => ({
      ...prev,
      gender,
      page_no: 1
    }));
  }, []);

  const genderOptions = useMemo(() => [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ], []);

  // ---------------- DROPDOWNS ----------------
  const incomeRanges = [
    { label: 'All', value: '' },
    { label: 'Less than ₹20,000', value: '0-20000' },
    { label: '₹20,001 - ₹50,000', value: '20001-50000' },
    { label: '₹50,001 - ₹1,00,000', value: '50001-100000' },
    { label: 'Above ₹1,00,000', value: '100001-100000000' }
  ];

  const dynamicFiltersArray = useMemo(() => [
    {
      key: 'gender',
      label: 'Gender',
      activeValue: query.gender,
      options: genderOptions,
      onChange: handleGenderFilter
    }
  ], [query.gender, genderOptions, handleGenderFilter]);

  // ---------------- AUTO FETCH ----------------
  useEffect(() => {
    fetchBlogs();
  }, []);

  // ---------------- UI ----------------
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
      title: "Total Users",
      value: Number(summaryMetrics.totalUsers) || 0,
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
      title: "Total Offers",
      value: Number(summaryMetrics.totalOffers) || 0,
      icon: "XCircle",
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "Users With Offers",
      value: Number(summaryMetrics.usersWithOffers) || 0,
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
        columns={signInColumns({ handleEdit })}
        title="Sign In Users"

        data={data}
        totalDataCount={totalDataCount}

        pagination={pagination}
        onPageChange={onPageChange}
        setPagination={setPagination}

        loading={loading}

        onSearch={debouncedSearch}
        onRefresh={fetchBlogs}

        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}

        onFilterByRange={onFilterByRange}
        activeDateRange={{
          startDate: query.startDate,
          endDate: query.endDate
        }}

        dynamicFilters={dynamicFiltersArray}

        onFilterByIncome={handleIncomeFilter}
        incomeRanges={incomeRanges}
        activeIncomeFilter={activeIncomeFilter}

        onExport={handleExport}
      />
    </>
  );
};

export default SignInUsers;
