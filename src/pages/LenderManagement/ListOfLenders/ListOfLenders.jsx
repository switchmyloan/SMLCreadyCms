import React, { useEffect, useState, useCallback, useMemo } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import ToastNotification from '@components/Notification/ToastNotification';
import { getLender, UpdateLender } from '../../../api-services/Modules/LenderApi';
import { lenderColumn } from '../../../components/TableHeader';


const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const parseBooleanLike = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'active') return true;
    if (normalizedValue === 'false' || normalizedValue === '0' || normalizedValue === 'inactive') return false;
  }
  return undefined;
};

const buildLenderUpdatePayload = (lender, nextStatus) => {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    created_by: _createdBy,
    modified_by: _modifiedBy,
    totalLeads: _totalLeads,
    successLeads: _successLeads,
    rejectLeads: _rejectLeads,
    dedupeLeads: _dedupeLeads,
    features,
    ...editableFields
  } = lender || {};

  return {
    ...editableFields,
    isActive: nextStatus,
    status: nextStatus,
    lender_features: Array.isArray(features)
      ? features.map(feature => feature?.title).filter(Boolean)
      : [],
  };
};

const normalizeLenderStatus = (lender) => {
  const parsedIsActive = parseBooleanLike(lender?.isActive);
  const parsedStatus = parseBooleanLike(lender?.status);
  const normalizedStatus = parsedIsActive ?? parsedStatus ?? false;

  return {
    ...lender,
    isActive: normalizedStatus,
    status: normalizedStatus,
  };
};

const Blogs = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false); // N
  const [togglingLenderIds, setTogglingLenderIds] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
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

    navigate("/on-borde-lender-from");
  }

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLender(query.page_no, query.limit, query.search);

      console.log('Response:', response.data);
      if (response?.data?.success) {
        setData((response?.data?.data.rows || []).map(normalizeLenderStatus));
        setTotalDataCount(response?.data?.data?.pagination?.total || 0);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  }, [query.limit, query.page_no, query.search]);

  const handleEdit = (data) => {
    navigate(`/on-borde-lender-from/${data?.id}`)
  }

  const handleToggleStatus = useCallback(async (lender) => {
    if (!lender?.id) return;

    const nextStatus = !lender.isActive;
    const payload = buildLenderUpdatePayload(lender, nextStatus);

    setTogglingLenderIds(prev => [...prev, lender.id]);
    setData(prev =>
      prev.map(item =>
        item.id === lender.id ? { ...item, isActive: nextStatus, status: nextStatus } : item
      )
    );

    try {
      const response = await UpdateLender(lender.id, payload);

      if (response?.data?.success) {
        const updatedLender = response?.data?.data;
        if (updatedLender) {
          setData(prev =>
            prev.map(item =>
              item.id === lender.id ? normalizeLenderStatus({ ...item, ...updatedLender }) : item
            )
          );
        }
        await fetchBlogs();
        ToastNotification.success(`Lender ${nextStatus ? 'activated' : 'deactivated'} successfully`);
        return;
      }

      throw new Error(response?.data?.message || 'Failed to update lender status');
    } catch (error) {
      setData(prev =>
        prev.map(item =>
          item.id === lender.id ? { ...item, isActive: lender.isActive, status: lender.status } : item
        )
      );
      ToastNotification.error(error?.response?.data?.message || error.message || 'Failed to update lender status');
    } finally {
      setTogglingLenderIds(prev => prev.filter(id => id !== lender.id));
    }
  }, [fetchBlogs]);


  const onPageChange = useCallback((pageInfo) => {
    setQuery((prevQuery) => {
      return {
        ...prevQuery,
        page_no: pageInfo.pageIndex + 1, // 1-based index for query
        limit: pageInfo.pageSize, // new limit
      };
    });
  }, []);

  const onSearchHandler = useCallback(term => {
    setQuery(prev => ({ ...prev, search: term, page_no: 1 }));
  }, []);

  const debouncedSearch = useMemo(() => debounce(onSearchHandler, 300), [onSearchHandler]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);


  console.log(data, 'blogColumnblogColumnblogColumn')
  return (
    <>
      <Toaster />
      <DataTable
        columns={lenderColumn({
          handleEdit,
          handleToggleStatus,
          togglingLenderIds,
        })}
        title='List Of Lender'
        data={data}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="On Board Lender"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}


        // Filters
        onSearch={debouncedSearch}
        onRefresh={fetchBlogs}
        // onFilterByDate={onFilterByDate}
        // activeFilter={query.filter_date}
        // onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}

        // STATUS FILTER
        // onFilterChange={handleStatusFilter}
        activeStatusFilter={query.status}
      />
    </>
  )
}

export default Blogs
