import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import { getLeads, getPartnerLeads } from '../../../api-services/Modules/Leads';
import { partnerLeadsColumn } from '../../../components/TableHeader';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SummaryCards from '../../../components/SummaryCards';
import ExportModal from '../../../components/ExportModal';


const parseLenderResponses = (responses) => {
  if (!responses) return [];
  if (Array.isArray(responses)) return responses;
  if (typeof responses === 'string') {
    try {
      const parsed = JSON.parse(responses);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse lender_responses:", e);
      return [];
    }
  }
  return [];
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
        parseLenderResponses(item.lender_responses).map(lr => lr?.lender?.name)
      )
    )
  ).filter(Boolean);

  worksheet.columns = [
    { header: "Name", key: "name", width: 15 },
    { header: "Phone Number", key: "phoneNumber", width: 25 },
    { header: "UTM Source", key: "utm_source", width: 15 },
    { header: "UTM Medium", key: "utm_medium", width: 15 },
    { header: "UTM Campaign", key: "utm_campaign", width: 15 },
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

    item.lender_responses = parseLenderResponses(item.lender_responses);
    item.lender_responses?.forEach(lr => {
      const lenderName = lr?.lender?.name;
      if (lenderName && lr.isOffer) {
        lenderStatusMap[lenderName] = "Yes";
      }
    });

    worksheet.addRow({
      Name: item.name || "N/A",
      phoneNumber: item.phoneNumber || "N/A",
      utm_source: item.utm_source || "N/A",
      utm_medium: item.utm_medium || "N/A",
      utm_campaign: item.utm_campaign || "N/A",
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

  saveAs(blob, "Leads_Report.xlsx");
};

const Leads = () => {
  const navigate = useNavigate();

  const [rawData, setRawData] = useState([]);
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeIncomeFilter, setActiveIncomeFilter] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const resetToFirstPage = useCallback(() => {
    setPagination(prev =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    );
  }, []);

  const [query, setQuery] = useState({
    search: '',
    filter_date: '',
    startDate: null,
    endDate: null,
    gender: '',
    minIncome: undefined,
    maxIncome: undefined,
    jobType: '',
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

  const jobTypeOptions = useMemo(() => [
    { label: 'Salaried', value: 'salaried' },
    { label: 'Self Employed', value: 'self-employed' },
    { label: 'Business', value: 'business' },
    { label: 'Freelancer', value: 'freelancer' }
  ], []);

  const dobRanges = [
    { label: 'All', value: '' },
    { label: '18 - 25', value: '18-25' },
    { label: '26 - 35', value: '26-35' },
    { label: '36 - 45', value: '36-45' },
    { label: '45+', value: '45-200' },
  ];

  const handleDobFilter = useCallback((value) => {
    resetToFirstPage();
    if (!value) {
      setQuery(prev => ({ ...prev, minAge: undefined, maxAge: undefined, page_no: 1 }));
      return;
    }
    const [min, max] = value.split('-');
    setQuery(prev => ({ ...prev, minAge: Number(min), maxAge: Number(max), page_no: 1 }));
  }, [resetToFirstPage]);

  const handleJobTypeFilter = useCallback((jobType) => {
    resetToFirstPage();
    setQuery(prev => ({ ...prev, jobType, page_no: 1 }));
  }, [resetToFirstPage]);

  /* ========================= FETCH ========================= */

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await getPartnerLeads();
      if (response?.data?.success) {
        setRawData(response.data.data.rows || []);
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

    if (query.search) {
      const term = query.search.toLowerCase();
      rows = rows.filter(item =>
        item.firstName?.toLowerCase().includes(term) ||
        item.lastName?.toLowerCase().includes(term) ||
        item.emailAddress?.toLowerCase().includes(term) ||
        item.phoneNumber?.includes(term)
      );
    }

    if (query.gender) {
      rows = rows.filter(r => r.gender?.toLowerCase() === query.gender);
    }

    if (query.minIncome !== undefined && query.maxIncome !== undefined) {
      rows = rows.filter(item => {
        const income = Number(String(item.income || item.monthlyIncome || 0).replace(/,/g, ''));
        return income >= query.minIncome && income <= query.maxIncome;
      });
    }

    if (query.filter_date) {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      rows = rows.filter(item => {
        const created = new Date(item.createdAt);
        if (query.filter_date === 'today') return created.toDateString() === today.toDateString();
        if (query.filter_date === 'yesterday') return created.toDateString() === yesterday.toDateString();
        return true;
      });
    }

    if (query.startDate && query.endDate) {
      rows = rows.filter(item => {
        const created = new Date(item.createdAt);
        return created >= new Date(query.startDate) && created <= new Date(query.endDate);
      });
    }

    if (query.minAge !== undefined && query.maxAge !== undefined) {
      rows = rows.filter(item => {
        if (!item.dateOfBirth) return false;
        const dob = new Date(item.dateOfBirth);
        const age = Math.abs(new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970);
        return age >= query.minAge && age <= query.maxAge;
      });
    }

    if (query.jobType) {
      rows = rows.filter(item => item.jobType?.toLowerCase() === query.jobType);
    }

    return rows;
  }, [rawData, query]);

  const summaryMetrics = useMemo(() => {
    const totalLeads = filteredData.length;
    const totalLoanAmount = filteredData.reduce(
      (sum, item) => sum + Number(item.requiredLoanAmount || item.loanAmount || 0), 0
    );
    const today = new Date().toDateString();
    const todayLeads = filteredData.filter(item => new Date(item.createdAt).toDateString() === today).length;
    const dedupe = filteredData.filter(item => item.isDuplicate === true).length;
    return { totalLeads, totalLoanAmount, todayLeads, dedupe };
  }, [filteredData]);

  /* ========================= PAGINATION ========================= */

  useEffect(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    setData(filteredData.slice(start, end));
    setTotalDataCount(filteredData.length);
  }, [filteredData, pagination]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredData.length / pagination.pageSize));
    if (pagination.pageIndex > totalPages - 1) {
      setPagination(prev => ({ ...prev, pageIndex: Math.max(totalPages - 1, 0) }));
    }
  }, [filteredData.length, pagination.pageIndex, pagination.pageSize]);

  /* ========================= HANDLERS ========================= */

  const handleEdit = (row) => {
    navigate(`/partner-detail/${row.leadId}`, { state: { lead: row } });
  };

  const onPageChange = useCallback((pageInfo) => {
    setPagination(prev =>
      prev.pageIndex === pageInfo.pageIndex && prev.pageSize === pageInfo.pageSize ? prev : pageInfo
    );
  }, []);

  const onSearchHandler = useCallback((term) => {
    resetToFirstPage();
    setQuery(prev => ({ ...prev, search: term }));
  }, [resetToFirstPage]);

  const handleGenderFilter = useCallback((value) => {
    resetToFirstPage();
    setQuery(prev => ({ ...prev, gender: value }));
  }, [resetToFirstPage]);

  const onFilterByDate = useCallback((type) => {
    resetToFirstPage();
    setQuery(prev => ({
      ...prev,
      filter_date: prev.filter_date === type ? '' : type,
      startDate: null,
      endDate: null,
    }));
  }, [resetToFirstPage]);

  const onFilterByRange = useCallback((range) => {
    resetToFirstPage();
    setQuery(prev => ({ ...prev, startDate: range.startDate, endDate: range.endDate, filter_date: '' }));
  }, [resetToFirstPage]);

  const handleIncomeFilter = (value) => {
    setActiveIncomeFilter(value);
    resetToFirstPage();
    if (!value) {
      setQuery(prev => ({ ...prev, minIncome: undefined, maxIncome: undefined }));
      return;
    }
    const [min, max] = value.split('-').map(Number);
    setQuery(prev => ({ ...prev, minIncome: min, maxIncome: max }));
  };

  const dynamicFiltersArray = useMemo(() => [
    { key: 'gender', label: 'Gender', activeValue: query.gender, options: genderOptions, onChange: handleGenderFilter },
    { key: 'jobType', label: 'Job Type', activeValue: query.jobType, options: jobTypeOptions, onChange: handleJobTypeFilter },
    { key: 'dob', label: 'Age', activeValue: query.minAge ? `${query.minAge}-${query.maxAge}` : '', options: dobRanges, onChange: handleDobFilter }
  ], [query.gender, query.minAge, query.maxAge, query.jobType, handleJobTypeFilter, handleDobFilter]);

  /* ========================= EXPORT ========================= */

  const handleExport = async ({ startDate, endDate, mode }) => {
    try {
      setIsExporting(true);

      // 🔍 DEBUG — check browser console to see exactly what ExportModal is sending
      console.log("📦 Export triggered with:", { mode, startDate, endDate });
      console.log("📊 rawData length at export time:", rawData.length);

      // 🔧 Normalize mode to lowercase to handle any casing from ExportModal
      // e.g. "Today", "TODAY", "today", "yesterday", "dateRange", "date_range", "custom" all handled
      const normalizedMode = String(mode || '').toLowerCase().trim();

      const isToday     = normalizedMode.includes('today');
      const isYesterday = normalizedMode.includes('yesterday');
      const isRange     = normalizedMode.includes('range') ||
                          normalizedMode.includes('custom') ||
                          normalizedMode.includes('date');

      const now = new Date();
      let start, end;

      if (isToday) {
        start = new Date(now); start.setHours(0, 0, 0, 0);
        end   = new Date(now); end.setHours(23, 59, 59, 999);

      } else if (isYesterday) {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        start = new Date(y); start.setHours(0, 0, 0, 0);
        end   = new Date(y); end.setHours(23, 59, 59, 999);

      } else if (isRange && startDate && endDate) {
        start = new Date(startDate); start.setHours(0, 0, 0, 0);
        end   = new Date(endDate);   end.setHours(23, 59, 59, 999);

      } else if (startDate && endDate) {
        // 🔧 Fallback: unrecognized mode but dates exist — still export
        console.warn("⚠️ Unrecognized mode, falling back to dates. mode was:", normalizedMode);
        start = new Date(startDate); start.setHours(0, 0, 0, 0);
        end   = new Date(endDate);   end.setHours(23, 59, 59, 999);

      } else {
        console.error("❌ Cannot resolve range. mode:", normalizedMode, "| startDate:", startDate, "| endDate:", endDate);
        ToastNotification.error("Please select a valid date range");
        return;
      }

      console.log("📅 Resolved range:", { start: start.toISOString(), end: end.toISOString() });

      const exportData = rawData.filter(item => {
        if (!item.createdAt) return false;
        const created = new Date(item.createdAt);
        return created >= start && created <= end;
      });

      console.log("✅ Rows matched for export:", exportData.length);

      if (!exportData.length) {
        ToastNotification.error("No data found for selected date range");
        return;
      }

      await exportToExcel(exportData);
      ToastNotification.success("Excel exported successfully");
      setIsExportModalOpen(false);

    } catch (error) {
      console.error("❌ Export error:", error);
      ToastNotification.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenExportModal = () => setIsExportModalOpen(true);

  const handleCloseExportModal = () => {
    if (!isExporting) setIsExportModalOpen(false);
  };

  const dynamicMetrics = useMemo(() => [
    { title: "Total Leads", value: Number(summaryMetrics.totalLeads) || 0, icon: "Users", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Loan Amount", value: Number(summaryMetrics.totalLoanAmount) || 0, icon: "CheckCircle", color: "text-green-600", bg: "bg-green-50" },
    { title: "Today Leads", value: Number(summaryMetrics.todayLeads) || 0, icon: "XCircle", color: "text-red-600", bg: "bg-red-50" },
    { title: "Duplicate", value: Number(summaryMetrics.dedupe) || 0, icon: "TriangleAlert", color: "text-yellow-600", bg: "bg-yellow-50" }
  ], [summaryMetrics]);

  return (
    <>
      <Toaster />
      <ExportModal
        open={isExportModalOpen}
        onClose={handleCloseExportModal}
        onSubmit={handleExport}
        isSubmitting={isExporting}
      />

      <SummaryCards metrics={dynamicMetrics} loading={loading} />

      <DataTable
        title="Leads"
        columns={partnerLeadsColumn({ handleEdit })}
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
        onExport={handleOpenExportModal}
      />
    </>
  );
};

export default Leads;