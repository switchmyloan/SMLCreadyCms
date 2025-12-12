import React, { useEffect, useState, useCallback, useMemo } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import ToastNotification from '@components/Notification/ToastNotification';
import { getLeads } from '../../../api-services/Modules/Leads';
import { contactUsColumns, leadsColumn } from '../../../components/TableHeader';
import { getContact } from '../../../api-services/Modules/Contact';


const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Contact = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tablePagination, setTablePagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
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

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await getContact(query.page_no, query.limit, query.search);
      
      if (response?.data?.success) {
        let rows = response?.data?.data || [];

        // ⭐ TODAY / YESTERDAY / LAST 7 DAYS
        if (query?.filter_date) {
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);

          rows = rows.filter(item => {
            const created = new Date(item?.createdAt);

            if (query.filter_date === "today") {
              return created.toDateString() === today.toDateString();
            }

            if (query.filter_date === "yesterday") {
              return created.toDateString() === yesterday.toDateString();
            }

            if (query.filter_date === "last_7_days") {
              const last7 = new Date();
              last7.setDate(today.getDate() - 7);
              return created >= last7 && created <= today;
            }

            return true;
          });
        }

        // ⭐ Custom Date Range Filter (frontend only)
        if (query.startDate && query.endDate) {
          rows = rows.filter(item => {
            const created = new Date(item.createdAt);
            return created >= new Date(query.startDate) &&
              created <= new Date(query.endDate);
          });
        }

        // Set filtered data
        setData(rows);
        setTotalDataCount(rows?.length);


        console.log(rows, "rows")

      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error('Error fetching:', error);
      ToastNotification.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (data) => {
    navigate(`/lead-detail/${data?.id}`, {
      state: { lead: data }
    });
  };


  const onPageChange = useCallback((pageInfo) => {
    setTablePagination({
      pageIndex: pageInfo.pageIndex,
      pageSize: pageInfo.pageSize,
    });

    setQuery(prevQuery => ({
      ...prevQuery,
      page_no: pageInfo.pageIndex + 1,
      limit: pageInfo.pageSize,
    }));
  }, []);


  const onSearchHandler = useCallback(term => {
    setQuery(prev => ({ ...prev, search: term, page_no: 1 }));
  }, []);

  const debouncedSearch = useMemo(() => debounce(onSearchHandler, 300), []);


  const onFilterByDate = useCallback(type => {
    setQuery(prev => ({
      ...prev,
      filter_date: prev.filter_date === type ? '' : type,
      startDate: null,
      endDate: null,
      page_no: 1
    }));
  }, []);


  const onFilterByRange = useCallback(range => {
    setQuery(prev => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
      filter_date: '',
      page_no: 1
    }));
  }, []);


  useEffect(() => {
    fetchData();
  }, [query.page_no, query.search, query.filter_date, query.startDate, query.endDate]);


  return (
    <>
      <Toaster />

      <DataTable
        columns={contactUsColumns({ handleEdit })}
        title='Contact US'
        data={data}
        totalDataCount={totalDataCount}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}

        onSearch={debouncedSearch}
        onRefresh={fetchData}

        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}

        onFilterByRange={onFilterByRange}
        activeDateRange={{
          startDate: query.startDate,
          endDate: query.endDate
        }}

        activeStatusFilter={query.status}
      />
    </>
  );
};

export default Contact;
