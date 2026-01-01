import React, { useEffect, useState, useCallback, useMemo } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import ToastNotification from '@components/Notification/ToastNotification';
import { getLeads } from '../../../api-services/Modules/Leads';
import { contactUsColumns, leadsColumn } from '../../../components/TableHeader';
import { getContact } from '../../../api-services/Modules/Contact';
import ExportModal from '../../../components/ExportModal';


const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const exportToExcel = async (rawData) => {
  if (!rawData || rawData.length === 0) {
    ToastNotification.error("No data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Leads Lender Offers");

  const allLenders = Array.from(
    new Set(
      rawData.flatMap(item =>
        item.lender_responses?.map(lr => lr?.lender?.name)
      )
    )
  ).filter(Boolean);

  worksheet.columns = [
    { header: "First Name", key: "firstName", width: 15 },
    { header: "Last Name", key: "lastName", width: 15 },
    { header: "Email", key: "email", width: 25 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Income", key: "income", width: 15 },
    { header: "Created At", key: "createdAt", width: 15 },
     { header: "ipAddress", key: "ipAddress", width: 15 },
    { header: "creditConsentText", key: "creditConsentText", width: 15 },
    { header: "communicationConsentText", key: "communicationConsentText", width: 15 },
    ...allLenders.map(lender => ({
      header: lender,
      key: lender,
      width: 15,
    })),
  ];

  worksheet.getRow(1).font = { bold: true };

  rawData.forEach(item => {
    const lenderStatusMap = {};

    allLenders.forEach(lender => {
      lenderStatusMap[lender] = "No";
    });

    item.lender_responses?.forEach(lr => {
      const lenderName = lr?.lender?.name;
      if (lenderName && lr.isOffer) {
        lenderStatusMap[lenderName] = "Yes";
      }
    });

    worksheet.addRow({
      fullName: item.fullName || "N/A",
      interest: item.interest || "N/A",
      mobile: item.mobile || "N/A",
      email: item.email || "N/A",
       comment: item.comment,
      createdAt: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-IN")
        : "N/A",
      ...lenderStatusMap,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "Contact_Report.xlsx");
};

const Contact = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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


  const handleExport = async ({ startDate, endDate, mode }) => {
    try {
      setIsExporting(true);

      // 🔥 STEP 1: FILTER FRONTEND DATA
      const filteredData = filterDataByDate(rawData, startDate, endDate);

      if (!filteredData.length) {
        ToastNotification.error("No data found for selected date range");
        return;
      }

      // 🔥 STEP 2: EXCEL EXPORT (tumhara existing code)
      await exportToExcel(filteredData);

      ToastNotification.success("Excel exported successfully");
      setIsExportModalOpen(false);
    } catch (error) {
      console.error(error);
      ToastNotification.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const filterDataByDate = (data, startDate, endDate) => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return data.filter(item => {
      if (!item.createdAt) return false;
      const created = new Date(item.createdAt);
      return created >= start && created <= end;
    });
  };

  useEffect(() => {
    fetchData();
  }, [query.page_no, query.search, query.filter_date, query.startDate, query.endDate]);


  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };
  const handleCloseExportModal = () => {
    if (!isExporting) {
      setIsExportModalOpen(false);
    }
  };

  return (
    <>
      <Toaster />
      <ExportModal
        open={isExportModalOpen}
        onClose={handleCloseExportModal}
        onSubmit={handleExport}
        isSubmitting={isExporting}
      />

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

        onExport={handleOpenExportModal}
      />

    </>
  );
};

export default Contact;
