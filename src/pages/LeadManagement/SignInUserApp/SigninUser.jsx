import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import { getInAppLeads } from '../../../api-services/Modules/Leads';
import { getLender } from '../../../api-services/Modules/LenderApi';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SummaryCards from '../../../components/SummaryCards';
import ExportOtpModal from '../../../components/ExportOtpModal';
import { leadsColumn } from '../../../components/TableHeader';
import { useUtmFilters } from '../../../custom-hooks/useUtmFilters';

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



// ----------------------------------------------------------------------
// Per-lender leadId extractor.
// Different lender APIs return their lead/application id at different
// paths inside lender_responses. Add a new entry here when a lender's
// path differs from the default `lr.leadId`.
//
// `lr` is one entry of item.lender_responses[].
// ----------------------------------------------------------------------
// Extract a query-param value from any URL string. Returns null if the
// URL is missing/invalid or the param isn't present.
const queryParamFromUrl = (url, param) => {
  if (!url || typeof url !== 'string') return null;
  try {
    return new URL(url).searchParams.get(param);
  } catch {
    // Fallback for non-absolute URLs or weird strings
    const match = url.match(new RegExp(`[?&]${param}=([^&#]+)`));
    return match ? decodeURIComponent(match[1]) : null;
  }
};

// NOTE: Backend already extracts the right leadId per lender (see
// LenderResponseDTO.LENDER_LEAD_ID_EXTRACTORS / LENDER_LEAD_ID_PATHS) and
// puts it on `lr.leadId`. These overrides only run if the backend hasn't
// populated it for some reason — keep them as a safety net.
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
    { header: "Gender", key: "gender", width: 15 },           // ✅ key: "gender"
    { header: "Date Of Birth", key: "dateOfBirth", width: 20 }, // ✅ key: "dateOfBirth"
    { header: "Phone", key: "phone", width: 15 },
    { header: "Income", key: "income", width: 15 },
    { header: "Job Type", key: "jobType", width: 15 },         // ✅ key: "jobType"
    { header: "Pan Number", key: "panNumber", width: 15 },     // ✅ key: "panNumber"
    { header: "Required Loan Amount", key: "requiredLoanAmount", width: 20 }, // ✅ key: "requiredLoanAmount"
    { header: "Postal Code", key: "postalCode", width: 15 },   // ✅ key: "postalCode"
    { header: "Created At", key: "createdAt", width: 15 },
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
      gender: item.gender || "N/A",                           // ✅ key matches column
      dateOfBirth: item.dateOfBirth
        ? new Date(item.dateOfBirth).toLocaleDateString("en-IN")
        : "N/A",                                              // ✅ key matches column
      phone: item.phoneNumber || "N/A",
      income: item.income || item.monthlyIncome || 0,
      jobType: item.jobType || "N/A",                         // ✅ key matches column
      panNumber: item.panNumber || "N/A",                     // ✅ key matches column
      requiredLoanAmount: item.requiredLoanAmount || "N/A",   // ✅ key matches column
      postalCode: item.postalCode || "N/A",                   // ✅ key matches column
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

  saveAs(blob, "App_Leads_Report.xlsx");
};

const SignInUsers = () => {
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
    status: 'success',
    gender: '',
    minIncome: undefined,
    maxIncome: undefined,
    minAge: undefined,
    maxAge: undefined,
    jobType: '',
    disbursement: '',
    utmSource: '',
    utmMedium: '',
  });

  const resetToFirstPage = useCallback(() => {
    setPagination(prev =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    );
  }, []);

  const fetchInAppLeadPage = useCallback((activeQuery) => {
    const { fromDate, toDate, type } = getDateParams(activeQuery);

    return getInAppLeads(
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
    );
  }, []);

  const fetchBlogs = useCallback(async (activeQuery) => {
    try {
      setLoading(true);

      const response = await fetchInAppLeadPage(activeQuery);

      if (response?.data?.success) {
        const payload = response?.data?.data || {};
        const rows = payload?.rows || [];

        setData(rows);
        setRawData(rows);
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
  }, [fetchInAppLeadPage]);

  useEffect(() => {
    fetchBlogs(query);
  }, [fetchBlogs, query]);

  const handleEdit = useCallback((row) => {
    navigate(`/lead-detail/${row?.id}`, {
      state: { lead: row }
    });
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

    const [min, max] = value.split('-');

    setQuery(prev => ({
      ...prev,
      minIncome: Number(min),
      maxIncome: Number(max),
      page_no: 1,
    }));
  }, [resetToFirstPage]);

  const handleGenderFilter = useCallback((gender) => {
    resetToFirstPage();

    setQuery(prev => ({
      ...prev,
      gender,
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
    { label: 'Other', value: 'other' }
  ], []);

  const incomeRanges = [
    { label: 'All', value: '' },
    { label: 'Less than Rs 20,000', value: '0-20000' },
    { label: 'Rs 20,001 - Rs 50,000', value: '20001-50000' },
    { label: 'Rs 50,001 - Rs 1,00,000', value: '50001-100000' },
    { label: 'Above Rs 1,00,000', value: '100001-100000000' }
  ];

  const dobRanges = [
    { label: 'All', value: '' },
    { label: '18 - 25', value: '18-25' },
    { label: '26 - 35', value: '26-35' },
    { label: '36 - 45', value: '36-45' },
    { label: '45+', value: '45-200' },
  ];

  const jobTypeOptions = useMemo(() => [
    { label: 'Salaried', value: 'salaried' },
    { label: 'Self Employed', value: 'self-employed' },
    { label: 'Business', value: 'business' },
    { label: 'Freelancer', value: 'freelancer' }
  ], []);

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

  const dynamicFiltersArray = useMemo(() => [
    {
      key: 'gender',
      label: 'Gender',
      activeValue: query.gender,
      options: genderOptions,
      onChange: handleGenderFilter
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
    fetchBlogs(query);
  }, [fetchBlogs, query]);

  // mode: 'today' | 'yesterday' | 'range' | etc.
  // For today/yesterday we send filter_date so the backend resolves via
  // CURRENT_DATE (timezone-safe). YYYY-MM-DD strings get parsed as
  // midnight UTC otherwise, which silently drops IST early-morning rows.
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

    const response = await fetchInAppLeadPage(exportQuery);

    if (!response?.data?.success) {
      throw new Error('Failed to fetch export data');
    }

    return response?.data?.data?.rows || [];
  }, [fetchInAppLeadPage, query]);

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
      console.log(exportRows, "exportRows");
      const sampleWithOffer = exportRows.find(r =>
        r.lender_responses?.some(lr => lr.isOffer)
      );
      if (sampleWithOffer) {
        console.log(
          "SAMPLE lender_responses (one user with offer):",
          sampleWithOffer.lender_responses
        );
      }
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
        totalUsers: Number(serverSummary?.totalUsers ?? totalDataCount) || 0,
        totalOffers: Number(serverSummary?.totalOffers) || 0,
        usersWithOffers: Number(serverSummary?.usersWithOffers) || 0,
        todayUsers: Number(serverSummary?.todayUsers) || 0,
      };
    }

    const totalUsers = totalDataCount || rawData.length;

    const totalOffers = rawData.reduce((count, item) => {
      const offers = item.lender_responses?.filter(lr => lr.isOffer)?.length || 0;
      return count + offers;
    }, 0);

    const usersWithOffers = rawData.filter(item =>
      item.lender_responses?.some(lr => lr.isOffer)
    ).length;

    // Today's leads from current page (visible-rows fallback when server
    // summary isn't available — refresh + filter to "Today" for real number).
    const todayStr = new Date().toDateString();
    const todayUsers = rawData.filter(
      (item) => item.createdAt && new Date(item.createdAt).toDateString() === todayStr
    ).length;

    return {
      totalUsers,
      totalOffers,
      usersWithOffers,
      todayUsers,
    };
  }, [rawData, serverSummary, totalDataCount]);

  // Conversion rate = users who got at least one offer / total users.
  // Useful health metric — tracks how well the funnel is performing.
  const offerConversionPct = summaryMetrics.totalUsers > 0
    ? Math.round((summaryMetrics.usersWithOffers / summaryMetrics.totalUsers) * 1000) / 10
    : 0;

  // Average offers per user (only counting users who got at least one).
  // Tells you whether the offer-engine spreads load across many lenders
  // or just one or two per user. Higher = richer choice for the user.
  const avgOffersPerUser = summaryMetrics.usersWithOffers > 0
    ? Math.round((summaryMetrics.totalOffers / summaryMetrics.usersWithOffers) * 10) / 10
    : 0;

  // Layout tells a clean funnel story:
  //   Volume  -> Total Users
  //   Output  -> Total Offers (count of offers given)
  //   Reach   -> Users With Offers (distinct users who got at least one)
  //   Quality -> Conversion Rate (Users With Offers / Total Users)
  const dynamicMetrics = useMemo(() => [
    {
      title: "Total Users",
      value: Number(summaryMetrics.totalUsers) || 0,
      icon: "Users",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Offers",
      value: Number(summaryMetrics.totalOffers) || 0,
      icon: "BadgePercent",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Users With Offers",
      value: Number(summaryMetrics.usersWithOffers) || 0,
      icon: "UserCheck",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Avg Offers / User",
      value: Number(avgOffersPerUser) || 0,
      icon: "TrendingUp",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      subtitle: `${offerConversionPct}% conversion rate`,
    },
  ], [summaryMetrics, avgOffersPerUser, offerConversionPct]);

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
        columns={leadsColumn({ handleEdit })}
        title="Sign In Users"
        data={data}
        totalDataCount={totalDataCount}
        pagination={pagination}
        onPageChange={onPageChange}
        setPagination={setPagination}
        loading={loading}
        onSearch={onSearchHandler}
        onRefresh={handleRefresh}
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
        onExport={handleOpenExportModal}
        onFilterByDob={handleDobFilter}
        dobRanges={dobRanges}
      />
    </>
  );
};

export default SignInUsers;