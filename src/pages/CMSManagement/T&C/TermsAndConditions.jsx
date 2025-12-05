import React, { useEffect, useState, useCallback, useMemo } from "react";
import DataTable from "@components/Table/DataTable";
import { Toaster } from "react-hot-toast";
import ToastNotification from "@components/Notification/ToastNotification";
import { blogColumn } from "@components/TableHeader";
import TermsAndConditionsModal from "../../Modals/TernsAndConditionsModal";


const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const TermsAndConditions = () => {
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fake API (replace later)
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = {
        success: true,
        data: [
          {
            id: 1,
            title: "Default Terms",
            lastUpdated: "2025-09-04",
            sections: [
              {
                title: "Introduction",
                content: JSON.stringify({
                  blocks: [
                    {
                      key: "6mgfh",
                      text: "These are the sample terms & conditions...",
                      type: "unstyled",
                      depth: 0,
                      inlineStyleRanges: [],
                      entityRanges: [],
                      data: {},
                    },
                  ],
                  entityMap: {},
                }),
              },
            ],
          },
        ],
        pagination: { totalItems: 1 },
      };

      if (response.success) {
        setData(response.data);
        setTotalDataCount(response.pagination.totalItems);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditData(row);
    setIsModalOpen(true);
  };

  const handleSave = (form) => {
    if (editData) {
      console.log("Update:", form); // 🔹 Replace with update API
      ToastNotification.success("Terms & Conditions Updated!");
    } else {
      console.log("Create:", form); // 🔹 Replace with create API
      ToastNotification.success("Terms & Conditions Created!");
    }
    fetchData();
  };

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
    fetchData();
  }, [query.page_no]);

  return (
    <>
      <Toaster />
      <DataTable
        columns={blogColumn({ handleEdit })}
        title="Terms & Conditions"
        data={data}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}

        // Filters
        onSearch={debouncedSearch}
        onRefresh={fetchData}
        onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}

        // STATUS FILTER
        // onFilterChange={handleStatusFilter}
        activeStatusFilter={query.status}
      />

      <TermsAndConditionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editData}
      />
    </>
  );
};

export default TermsAndConditions;
