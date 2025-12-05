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



import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import ToastNotification from '@components/Notification/ToastNotification';
import { signInColumns } from '@components/TableHeader';
import { getInAppLeads } from '../../../api-services/Modules/Leads';

// Debounce helper
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const SignInUsers = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);

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
    status: 'success'
  });

  // -------------------------------------------------
  // Fetch from API (NO DATE FILTERS SENT)
  // -------------------------------------------------
  const fetchBlogs = async () => {
    try {
      setLoading(true);

      // ❗ DATE FILTER NOT SENT TO API
      const response = await getInAppLeads(
        query.page_no,
        query.limit,
        query.search,
        query.status
      );

      if (response?.data?.success) {
        let rows = response?.data?.data?.rows || [];

        // -------------------------------------------------
        // FRONTEND DATE FILTERS
        // -------------------------------------------------

        // QUICK DATE FILTER (today/yesterday/7 days)
        if (query.filter_date) {
          const today = new Date();

          rows = rows.filter(item => {
            const d = new Date(item.createdAt);

            if (query.filter_date === "today") {
              return d.toDateString() === today.toDateString();
            }

            if (query.filter_date === "yesterday") {
              const y = new Date();
              y.setDate(y.getDate() - 1);
              return d.toDateString() === y.toDateString();
            }

            if (query.filter_date === "last_7_days") {
              const last7 = new Date();
              last7.setDate(last7.getDate() - 7);
              return d >= last7 && d <= today;
            }

            return true;
          });
        }

        // DATE RANGE FILTER
        if (query.startDate && query.endDate) {
          const s = new Date(query.startDate);
          const e = new Date(query.endDate);

          rows = rows.filter(item => {
            const d = new Date(item.createdAt);
            return d >= s && d <= e;
          });
        }

        // SET DATA
        setTotalDataCount(rows.length);
        setData(rows);

      } else {
        ToastNotification.error("Error fetching data");
      }

    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // Edit handler
  // -------------------------------------------------
  const handleEdit = (row) => {
    navigate(`/lead-detail/${row?.id}`, {
      state: { lead: row }
    });
  };

  // -------------------------------------------------
  // Pagination handler
  // -------------------------------------------------
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

  // -------------------------------------------------
  // Search (debounced)
  // -------------------------------------------------
  const onSearchHandler = useCallback((term) => {
    setQuery(prev => ({
      ...prev,
      search: term,
      page_no: 1
    }));
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const debouncedSearch = useMemo(() => debounce(onSearchHandler, 300), []);

  // -------------------------------------------------
  // Status filter
  // -------------------------------------------------
  const handleStatusFilter = (newStatus) => {
    setQuery(prev => ({
      ...prev,
      status: newStatus,
      page_no: 1
    }));
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  // -------------------------------------------------
  // Quick date filter (today/yesterday/7days)
  // -------------------------------------------------
  const onFilterByDate = (type) => {
    setQuery(prev => ({
      ...prev,
      filter_date: prev.filter_date === type ? '' : type,
      startDate: null,
      endDate: null,
      page_no: 1
    }));
  };

  // -------------------------------------------------
  // Date range filter
  // -------------------------------------------------
  const onFilterByRange = (range) => {
    setQuery(prev => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
      filter_date: '',
      page_no: 1
    }));
  };

  // -------------------------------------------------
  // Auto refetch when query changes
  // -------------------------------------------------
  useEffect(() => {
    fetchBlogs();
  }, [
    query.page_no,
    query.limit,
    query.search,
    query.status,
    query.filter_date,
    query.startDate,
    query.endDate
  ]);

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

        // Quick date filters
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}

        // Date range
        onFilterByRange={onFilterByRange}
        activeDateRange={{
          startDate: query.startDate,
          endDate: query.endDate
        }}

        // activeStatusFilter={query.status}
        // onFilterChange={handleStatusFilter}
      />
    </>
  );
};

export default SignInUsers;
