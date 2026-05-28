import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import { getLeads } from '../../../api-services/Modules/Leads';
import { getLender } from '../../../api-services/Modules/LenderApi';
import { leadsColumn } from '../../../components/TableHeader';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SummaryCards from '../../../components/SummaryCards';
import ExportOtpModal from '../../../components/ExportOtpModal';
import { useUtmFilters } from '../../../custom-hooks/useUtmFilters';
import { useLenderFilter } from '../../../custom-hooks/useLenderFilter';

const getDateParams = (query) => {
  if (query.startDate && query.endDate) {
    return {
      fromDate: query.startDate,
      toDate: query.endDate,
      type: '',
    };
  }

  if (query.filter_date === 'today') {
    return {
      fromDate: '',
      toDate: '',
      type: 'today',
    };
  }

  if (query.filter_date === 'yesterday') {
    return {
      fromDate: '',
      toDate: '',
      type: 'yesterday',
    };
  }

  return {
    fromDate: '',
    toDate: '',
    type: '',
  };
};

const getTotalCount = (payload, rows = []) => {
  return (
    payload?.pagination?.total ??
    payload?.pagination?.totalItems ??
    payload?.count ??
    rows.length
  );
};

const getVisiblePageRows = (payload, rows = [], activeQuery) => {
  const perPage = Number(activeQuery?.limit) || 10;

  if (rows.length <= perPage) {
    return rows;
  }

  const totalRows = getTotalCount(payload, rows);

  // Fallback for APIs that return the full dataset instead of the requested page.
  if (totalRows <= rows.length) {
    const currentPage = Math.max(Number(activeQuery?.page_no) || 1, 1);
    const startIndex = (currentPage - 1) * perPage;

    return rows.slice(startIndex, startIndex + perPage);
  }

  return rows.slice(0, perPage);
};

// ----------------------------------------------------------------------
// Per-lender leadId extractor.
// Different lender APIs return their lead/application id at different
// paths inside lender_responses. Add a new entry here when a lender's
// path differs from the default `lr.leadId`.
//
// Key is the lender's display name lowercased + whitespace stripped
// (e.g. "Lending Plate" -> "lendingplate").
// ----------------------------------------------------------------------
// Extract a query-param value from any URL string. Returns null if the
// URL is missing/invalid or the param isn't present.
const queryParamFromUrl = (url, param) => {
  if (!url || typeof url !== 'string') return null;
  try {
    return new URL(url).searchParams.get(param);
  } catch {
    const match = url.match(new RegExp(`[?&]${param}=([^&#]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  }
};

// NOTE: Backend already extracts the right leadId per lender (see
// LenderResponseDTO) and puts it on `lr.leadId`. These overrides only
// run as a safety net if the backend hasn't populated it.
const LENDER_LEAD_ID_PATHS = {
  smartcoin: (lr) => lr?.metadata?.data?.response?.leadId,
  lendingplate: (lr) => lr?.metadata?.data?.ref_id,
  vivifi: (lr) =>
    queryParamFromUrl(lr?.metadata?.data?.redirectUrl, 'leadReferenceId'),
};

const extractLenderLeadId = (lr) => {
  // Prefer backend-populated leadId
  if (lr?.leadId !== undefined && lr?.leadId !== null && lr?.leadId !== '') {
    return lr.leadId;
  }
  // Fallback: derive from metadata using lender-specific path
  const name = (lr?.lender?.name || '').toLowerCase().replace(/\s+/g, '');
  const customPath = LENDER_LEAD_ID_PATHS[name];
  if (!customPath) return null;
  const value = customPath(lr);
  return value !== undefined && value !== null && value !== '' ? value : null;
};

const exportToExcel = async (rawData, lenderNames = []) => {
  if (!rawData || rawData.length === 0) {
    ToastNotification.error("No data to export");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Leads Lender Offers");

  const lendersFromRows = rawData.flatMap(item =>
    item.lender_responses?.map(lr => lr?.lender?.name) || []
  );

  const allLenders = Array.from(
    new Set([...lenderNames, ...lendersFromRows])
  ).filter(Boolean);

  worksheet.columns = [
    { header: "Lead ID", key: "leadId", width: 10 },
    { header: "MRN", key: "mrn", width: 20 },
    { header: "First Name", key: "firstName", width: 15 },
    { header: "Last Name", key: "lastName", width: 15 },
    { header: "Email", key: "email", width: 25 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Income", key: "income", width: 15 },
    { header: "Created At", key: "createdAt", width: 15 },
    ...allLenders.map(lender => ({
      header: lender,
      key: lender,
      width: 20,
    })),
  ];

  worksheet.getRow(1).font = { bold: true };

  rawData.forEach(item => {
    const lenderStatusMap = {};

    allLenders.forEach(lender => {
      lenderStatusMap[lender] = "N";
    });

    item.lender_responses?.forEach(lr => {
      const lenderName = lr?.lender?.name;
      if (!lenderName) return;
      if (lr.isOffer) {
        lenderStatusMap[lenderName] = extractLenderLeadId(lr) ?? "Y";
      }
    });

    worksheet.addRow({
      leadId: item.id || "N/A",
      mrn: item.mrn || "N/A",
      firstName: item.firstName || "N/A",
      lastName: item.lastName || "N/A",
      email: item.emailAddress || "N/A",
      phone: item.phoneNumber || "N/A",
      income: item.income || item.monthlyIncome || 0,
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

  const [data, setData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [serverSummary, setServerSummary] = useState(null);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeIncomeFilter, setActiveIncomeFilter] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
    gender: '',
    minIncome: undefined,
    maxIncome: undefined,
    minAge: undefined,
    maxAge: undefined,
    jobType: '',
    disbursement: '',
    utmSource: '',
    utmMedium: '',
    lender: '',
  });

  const resetToFirstPage = useCallback(() => {
    setPagination(prev =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    );
  }, []);

  const fetchWebLeadPage = useCallback((activeQuery) => {
    const { fromDate, toDate, type } = getDateParams(activeQuery);

    return getLeads(
      activeQuery.page_no,
      activeQuery.limit,
      activeQuery.search,
      activeQuery.gender,
      activeQuery.minIncome,
      activeQuery.maxIncome,
      fromDate,
      toDate,
      activeQuery.minAge,
      activeQuery.maxAge,
      activeQuery.jobType,
      type,
      activeQuery.exportToken,
      activeQuery.disbursement,
      activeQuery.utmSource,
      activeQuery.utmMedium,
      activeQuery.lender,
    );
  }, []);

  const fetchLeads = useCallback(async (activeQuery) => {
    try {
      setLoading(true);

      const response = await fetchWebLeadPage(activeQuery);

      if (response?.data?.success) {
        const payload = response?.data?.data || {};
        const rows = payload?.rows || [];
        const visibleRows = getVisiblePageRows(payload, rows, activeQuery);

        setData(visibleRows);
        setRawData(visibleRows);
        setServerSummary(payload?.summary || null);
        setTotalDataCount(getTotalCount(payload, rows));
      } else {
        setData([]);
        setRawData([]);
        setServerSummary(null);
        setTotalDataCount(0);
        ToastNotification.error("Failed to fetch leads");
      }
    } catch (error) {
      ToastNotification.error("API Error");
    } finally {
      setLoading(false);
    }
  }, [fetchWebLeadPage]);

  useEffect(() => {
    fetchLeads(query);
  }, [fetchLeads, query]);

  const handleEdit = useCallback((row) => {
    navigate(`/lead-detail/${row.id}`, { state: { lead: row } });
  }, [navigate]);

  const onPageChange = useCallback((pageInfo) => {
    setPagination(prev => (
      prev.pageIndex === pageInfo.pageIndex && prev.pageSize === pageInfo.pageSize
        ? prev
        : {
            pageIndex: pageInfo.pageIndex,
            pageSize: pageInfo.pageSize,
          }
    ));

    setQuery(prev => (
      prev.page_no === pageInfo.pageIndex + 1 && prev.limit === pageInfo.pageSize
        ? prev
        : {
            ...prev,
            page_no: pageInfo.pageIndex + 1,
            limit: pageInfo.pageSize,
          }
    ));
  }, []);

  const onSearchHandler = useCallback((term) => {
    resetToFirstPage();

    setQuery(prev => (
      prev.search === term && prev.page_no === 1
        ? prev
        : {
            ...prev,
            search: term,
            page_no: 1,
          }
    ));
  }, [resetToFirstPage]);

  const handleGenderFilter = useCallback((value) => {
    resetToFirstPage();

    setQuery(prev => ({
      ...prev,
      gender: value,
      page_no: 1,
    }));
  }, [resetToFirstPage]);

  const onFilterByDate = useCallback((type) => {
    resetToFirstPage();

    setQuery(prev => ({
      ...prev,
      filter_date: prev.filter_date === type ? '' : type,
      startDate: null,
      endDate: null,
      page_no: 1,
    }));
  }, [resetToFirstPage]);

  const onFilterByRange = useCallback((range) => {
    resetToFirstPage();

    setQuery(prev => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
      filter_date: '',
      page_no: 1,
    }));
  }, [resetToFirstPage]);

  const handleIncomeFilter = useCallback((value) => {
    setActiveIncomeFilter(value);
    resetToFirstPage();

    if (!value) {
      setQuery(prev => ({
        ...prev,
        minIncome: undefined,
        maxIncome: undefined,
        page_no: 1,
      }));
      return;
    }

    const [min, max] = value.split('-').map(Number);

    setQuery(prev => ({
      ...prev,
      minIncome: min,
      maxIncome: max,
      page_no: 1,
    }));
  }, [resetToFirstPage]);

  const handleDobFilter = useCallback((value) => {
    resetToFirstPage();

    if (!value) {
      setQuery(prev => ({
        ...prev,
        minAge: undefined,
        maxAge: undefined,
        page_no: 1,
      }));
      return;
    }

    const [min, max] = value.split('-');

    setQuery(prev => ({
      ...prev,
      minAge: Number(min),
      maxAge: Number(max),
      page_no: 1,
    }));
  }, [resetToFirstPage]);

  const handleJobTypeFilter = useCallback((jobType) => {
    resetToFirstPage();

    setQuery(prev => ({
      ...prev,
      jobType,
      page_no: 1,
    }));
  }, [resetToFirstPage]);

  const handleDisbursementFilter = useCallback((value) => {
    resetToFirstPage();

    setQuery(prev => ({
      ...prev,
      disbursement: value,
      page_no: 1,
    }));
  }, [resetToFirstPage]);

  const genderOptions = useMemo(() => [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ], []);

  const incomeRanges = [
    { label: 'All', value: '' },
    { label: 'Less than Rs 20,000', value: '0-20000' },
    { label: 'Rs 20,001 - Rs 50,000', value: '20001-50000' },
    { label: 'Rs 50,001 - Rs 1,00,000', value: '50001-100000' },
    { label: 'Above Rs 1,00,000', value: '100001-100000000' },
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

  const disbursementOptions = useMemo(() => [
    { label: 'All', value: '' },
    { label: 'Disbursed', value: 'yes' },
    { label: 'Not Disbursed', value: 'no' },
  ], []);

  const handleUtmChange = useCallback(({ utmSource, utmMedium }) => {
    resetToFirstPage();
    setQuery((prev) => ({
      ...prev,
      utmSource,
      utmMedium,
      page_no: 1,
    }));
  }, [resetToFirstPage]);

  const { filterEntries: utmFilterEntries } = useUtmFilters({
    onChange: handleUtmChange,
  });

  const handleLenderChange = useCallback((value) => {
    resetToFirstPage();
    setQuery((prev) => ({ ...prev, lender: value, page_no: 1 }));
  }, [resetToFirstPage]);

  const { filterEntry: lenderFilterEntry } = useLenderFilter({
    onChange: handleLenderChange,
  });

  const dynamicFiltersArray = useMemo(() => [
    {
      key: 'gender',
      label: 'Gender',
      activeValue: query.gender,
      options: genderOptions,
      onChange: handleGenderFilter,
    },
    {
      key: 'jobType',
      label: 'Job Type',
      activeValue: query.jobType,
      options: jobTypeOptions,
      onChange: handleJobTypeFilter
    },
    {
      key: 'dob',
      label: 'Age',
      activeValue: query.minAge
        ? `${query.minAge}-${query.maxAge}`
        : '',
      options: dobRanges,
      onChange: handleDobFilter
    },
    {
      key: 'disbursement',
      label: 'Disbursement',
      activeValue: query.disbursement,
      options: disbursementOptions,
      onChange: handleDisbursementFilter,
    },
    ...utmFilterEntries,
    lenderFilterEntry,
  ], [
    dobRanges,
    genderOptions,
    handleDobFilter,
    handleGenderFilter,
    handleJobTypeFilter,
    handleDisbursementFilter,
    jobTypeOptions,
    disbursementOptions,
    utmFilterEntries,
    lenderFilterEntry,
    query.gender,
    query.jobType,
    query.maxAge,
    query.minAge,
    query.disbursement,
  ]);

  const handleOpenExportModal = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const handleCloseExportModal = useCallback(() => {
    if (!isExporting) {
      setIsExportModalOpen(false);
    }
  }, [isExporting]);

  const handleRefresh = useCallback(() => {
    fetchLeads(query);
  }, [fetchLeads, query]);

  // mode: 'today' | 'yesterday' | 'range' | 'custom' (any string)
  // For today/yesterday we send `filter_date` (which the backend resolves
  // via CURRENT_DATE — timezone-safe). For an explicit range we send
  // startDate / endDate. The OTP token from ExportOtpModal is forwarded
  // as `X-Export-Token` so the backend can audit-log this download.
  const fetchAllLeadsForExport = useCallback(async (startDate, endDate, mode, exportToken) => {
    const normalizedMode = String(mode || '').toLowerCase().trim();
    const isToday = normalizedMode.includes('today');
    const isYesterday = normalizedMode.includes('yesterday');

    const baseQuery = {
      ...query,
      page_no: 1,
      limit: 10000,
      filter_date: '',
      startDate: null,
      endDate: null,
      exportToken,
    };

    const exportQuery = isToday
      ? { ...baseQuery, filter_date: 'today' }
      : isYesterday
      ? { ...baseQuery, filter_date: 'yesterday' }
      : { ...baseQuery, startDate, endDate };

    const response = await fetchWebLeadPage(exportQuery);

    if (!response?.data?.success) {
      throw new Error('Failed to fetch export data');
    }

    return response?.data?.data?.rows || [];
  }, [fetchWebLeadPage, query]);

  const fetchAllLenderNames = useCallback(async () => {
    try {
      const response = await getLender(1, 10000, '');

      if (!response?.data?.success) {
        return [];
      }

      const rows = response?.data?.data?.rows || [];
      return rows.map(row => row?.name).filter(Boolean);
    } catch (err) {
      console.error('fetchAllLenderNames failed', err);
      return [];
    }
  }, []);

  const handleExport = async ({ startDate, endDate, mode, token }) => {
    try {
      setIsExporting(true);

      const exportRows = await fetchAllLeadsForExport(startDate, endDate, mode, token);

      if (!exportRows.length) {
        ToastNotification.error("No data found for selected date range");
        return;
      }

      const lenderNames = await fetchAllLenderNames();

      await exportToExcel(exportRows, lenderNames);

      ToastNotification.success("Excel exported successfully");
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Export failed', error);
      ToastNotification.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const summaryMetrics = useMemo(() => {
    if (serverSummary) {
      return {
        totalLeads: Number(serverSummary?.totalLeads ?? totalDataCount) || 0,
        totalLoanAmount: Number(serverSummary?.totalLoanAmount) || 0,
        todayLeads: Number(serverSummary?.todayLeads) || 0,
        dedupe: Number(serverSummary?.dedupe) || 0,
      };
    }

    const totalLeads = totalDataCount || rawData.length;
    const totalLoanAmount = rawData.reduce(
      (sum, item) =>
        sum + Number(item.requiredLoanAmount || item.loanAmount || 0),
      0
    );

    const today = new Date().toDateString();
    const todayLeads = rawData.filter(
      item => new Date(item.createdAt).toDateString() === today
    ).length;

    const dedupe = rawData.filter(
      item => item.isDuplicate === true
    ).length;

    return {
      totalLeads,
      totalLoanAmount,
      todayLeads,
      dedupe
    };
  }, [rawData, serverSummary, totalDataCount]);

  const dynamicMetrics = useMemo(() => [
    {
      title: "Total Leads",
      value: Number(summaryMetrics.totalLeads) || 0,
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
      title: "Today Leads",
      value: Number(summaryMetrics.todayLeads) || 0,
      icon: "XCircle",
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      title: "Duplicate",
      value: Number(summaryMetrics.dedupe) || 0,
      icon: "TriangleAlert",
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    }
  ], [summaryMetrics]);

  return (
    <>
      <Toaster />
      <ExportOtpModal
        open={isExportModalOpen}
        onClose={handleCloseExportModal}
        onSubmit={handleExport}
        isSubmitting={isExporting}
      />

      <SummaryCards
        metrics={dynamicMetrics}
        loading={loading}
      />

      <DataTable
        title="Leads"
        columns={leadsColumn({ handleEdit })}
        data={data}
        totalDataCount={totalDataCount}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        setPagination={setPagination}
        onSearch={onSearchHandler}
        onRefresh={handleRefresh}
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
