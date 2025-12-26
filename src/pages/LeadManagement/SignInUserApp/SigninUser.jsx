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
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import { signInColumns } from '@components/TableHeader';
import { getInAppLeads } from '../../../api-services/Modules/Leads';

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

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
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

      const response = await getInAppLeads(
        query.page_no,
        query.limit,
        query.search,
        query.gender,
        query.minIncome,
        query.maxIncome,
        query.filter_date
      );

      if (response?.data?.success) {
        let rows = response?.data?.data?.rows || [];

        // ✅ FRONTEND INCOME FILTER (SAFE)
        if (
          query.minIncome !== undefined &&
          query.maxIncome !== undefined
        ) {
          rows = rows.filter(item => {
            const income = Number(
              String(
                item.income ||
                item.monthlyIncome ||
                item.salary ||
                0
              ).replace(/,/g, '')
            );

            return income >= query.minIncome && income <= query.maxIncome;
          });
        }

        setData(rows);
        setTotalDataCount(response?.data?.data?.pagination?.total || rows.length);
      } else {
        ToastNotification.error('Error fetching data');
      }
    } catch (error) {
      console.error(error);
      ToastNotification.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

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
    setQuery(prev => ({
      ...prev,
      search: term,
      page_no: 1
    }));
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

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
  }, [
    query.page_no,
    query.search,
    query.filter_date,
    query.startDate,
    query.endDate,
    query.gender,
    query.minIncome,
    query.maxIncome
  ]);

  // ---------------- UI ----------------
  return (
    <>
      <Toaster />

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
      />
    </>
  );
};

export default SignInUsers;
