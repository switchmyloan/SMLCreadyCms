import React, { useEffect, useState, useCallback, useMemo } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { getBlogs } from '@api/Modules/BlogsApi';
import ToastNotification from '@components/Notification/ToastNotification';
import { blogColumn } from '@components/TableHeader';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Offers = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false); // N
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [tablePagination, setTablePagination] = useState({
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

  const handleCreate = () => {

    navigate("/blogs/create");
  }

  const fetchBlogs = async () => {
    try {
     setLoading(true); 
      const response = await getBlogs(query.page_no, query.limit, '');

      console.log('Response:', response.data.data);
      if (response?.data?.success) {
        setData(response?.data?.data?.data || []);
        setTotalDataCount(response?.data?.data?.pagination?.totalItems || 0);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error('Error fetching:', error);
    //   ToastNotification.error('Failed to fetch data');
      // router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (data) => {
    navigate(`/blogs/${data?.id}`)
  }

  const onPageChange = useCallback((pageInfo) => {
        setTablePagination({
          pageIndex: pageInfo.pageIndex,
          pageSize: pageInfo.pageSize,
        });
        setQuery((prevQuery) => {
          return {
            ...prevQuery,
            page_no: pageInfo.pageIndex + 1, // 1-based index for query
            limit: pageInfo.pageSize, // new limit
          };
        });
      }, []);
    
      const handleStatusFilter = useCallback(newStatus => {
        setQuery(prev => ({ ...prev, status: newStatus, page_no: 1 }));
      }, []);
    
      const onSearchHandler = useCallback(term => {
        setQuery(prev => ({ ...prev, search: term, page_no: 1 }));
      }, []);
    
      const debouncedSearch = useMemo(() => debounce(onSearchHandler, 300), [onSearchHandler]);
    
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
    fetchBlogs();
  }, [query.page_no]);
  
  return (
    <>
      <Toaster />
      <DataTable
        columns={blogColumn({
          handleEdit
        })}
        title='Offers'
        data={[]}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}

             // Filters
        onSearch={debouncedSearch}
        onRefresh={fetchBlogs}
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}

        // STATUS FILTER
        // onFilterChange={handleStatusFilter}
        activeStatusFilter={query.status}
      />
    </>
  )
}

export default Offers
