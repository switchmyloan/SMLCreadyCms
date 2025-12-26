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
import MainTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import { getLeads } from '../../../api-services/Modules/Leads';
import { leadsColumn } from '../../../components/TableHeader';

const PAGE_SIZE = 10;

const Leads = () => {
  const navigate = useNavigate();

  const [allRows, setAllRows] = useState([]);
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeIncomeFilter, setActiveIncomeFilter] = useState('');

  const [query, setQuery] = useState({
    pageIndex: 0,
    search: '',
    gender: '',
    filter_date: '',
    startDate: null,
    endDate: null,
    minIncome: undefined,
    maxIncome: undefined,
  });

  /* ================= FETCH ALL DATA ================= */
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getLeads();

      if (res?.data?.success) {
        setAllRows(res.data.data.rows || []);
      } else {
        ToastNotification.error('Failed to fetch leads');
      }
    } catch (err) {
      console.error(err);
      ToastNotification.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  /* ================= FILTERING ================= */
  const filteredRows = useMemo(() => {
    let rows = [...allRows];

    // 🔍 Search
    if (query.search) {
      const s = query.search.toLowerCase();
      rows = rows.filter(r =>
        r.firstName?.toLowerCase().includes(s) ||
        r.lastName?.toLowerCase().includes(s) ||
        r.emailAddress?.toLowerCase().includes(s) ||
        r.phoneNumber?.includes(s) ||
        r.panNumber?.toLowerCase().includes(s)
      );
    }

    // 👤 Gender
    if (query.gender) {
      rows = rows.filter(r => r.gender?.toLowerCase() === query.gender);
    }

    // 💰 Income
    if (query.minIncome !== undefined && query.maxIncome !== undefined) {
      rows = rows.filter(r => {
        const income = Number(r.income);
        return income >= query.minIncome && income <= query.maxIncome;
      });
    }

    // 📅 Today / Yesterday
    if (query.filter_date) {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      rows = rows.filter(r => {
        const d = new Date(r.createdAt);
        if (query.filter_date === 'today')
          return d.toDateString() === today.toDateString();
        if (query.filter_date === 'yesterday')
          return d.toDateString() === yesterday.toDateString();
        return true;
      });
    }

    // 📅 Custom range
    if (query.startDate && query.endDate) {
      rows = rows.filter(r => {
        const d = new Date(r.createdAt);
        return d >= new Date(query.startDate) &&
               d <= new Date(query.endDate);
      });
    }

    return rows;
  }, [allRows, query]);

  /* ================= FRONTEND PAGINATION ================= */
  useEffect(() => {
    const start = query.pageIndex * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    setData(filteredRows.slice(start, end));
    setTotalDataCount(filteredRows.length);
  }, [filteredRows, query.pageIndex]);

  /* ================= HANDLERS ================= */
  const onSearchHandler = useCallback((term) => {
    setQuery(prev => ({ ...prev, search: term, pageIndex: 0 }));
  }, []);

  const handleGenderFilter = (gender) => {
    setQuery(prev => ({ ...prev, gender, pageIndex: 0 }));
  };

  const handleIncomeFilter = (value) => {
    setActiveIncomeFilter(value);

    if (!value) {
      setQuery(prev => ({
        ...prev,
        minIncome: undefined,
        maxIncome: undefined,
        pageIndex: 0,
      }));
      return;
    }

    const [min, max] = value.split('-').map(Number);
    setQuery(prev => ({
      ...prev,
      minIncome: min,
      maxIncome: max,
      pageIndex: 0,
    }));
  };

  const onPageChange = ({ pageIndex }) => {
    setQuery(prev => ({ ...prev, pageIndex }));
  };

  const onFilterByDate = (type) => {
    setQuery(prev => ({
      ...prev,
      filter_date: prev.filter_date === type ? '' : type,
      startDate: null,
      endDate: null,
      pageIndex: 0,
    }));
  };

  const onFilterByRange = ({ startDate, endDate }) => {
    setQuery(prev => ({
      ...prev,
      startDate,
      endDate,
      filter_date: '',
      pageIndex: 0,
    }));
  };

  const handleEdit = (row) => {
    navigate(`/lead-detail/${row.id}`, { state: { lead: row } });
  };

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const incomeRanges = [
    { label: 'All', value: '' },
    { label: 'Less than ₹20,000', value: '0-20000' },
    { label: '₹20,001 - ₹50,000', value: '20001-50000' },
    { label: '₹50,001 - ₹1,00,000', value: '50001-100000' },
    { label: 'Above ₹1,00,000', value: '100001-100000000' },
  ];

  const dynamicFiltersArray = [
    {
      key: 'gender_filter',
      label: 'Gender',
      activeValue: query.gender,
      options: genderOptions,
      onChange: handleGenderFilter,
    },
  ];

  return (
    <>
      <Toaster />
      <MainTable
        title="Leads"
        columns={leadsColumn({ handleEdit })}
        data={data}
        totalDataCount={totalDataCount}
        loading={loading}
        onPageChange={onPageChange}
        onSearch={onSearchHandler}
        onRefresh={fetchBlogs}
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}
        dynamicFilters={dynamicFiltersArray}
        onFilterByIncome={handleIncomeFilter}
        incomeRanges={incomeRanges}
        activeIncomeFilter={activeIncomeFilter}
      />
    </>
  );
};

export default Leads;
