import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import { getInAppLeads } from '../../../api-services/Modules/Leads';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SummaryCards from '../../../components/SummaryCards';
import ExportModal from '../../../components/ExportModal';
import { leadsColumn } from '../../../components/TableHeader';

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
      type
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
    }
  ], [
    dobRanges,
    genderOptions,
    handleDobFilter,
    handleGenderFilter,
    handleJobTypeFilter,
    jobTypeOptions,
    query.gender,
    query.jobType,
    query.maxAge,
    query.minAge,
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

  const fetchAllLeadsForExport = useCallback(async (startDate, endDate) => {
    const exportQuery = {
      ...query,
      page_no: 1,
      limit: 500,
      filter_date: '',
      startDate,
      endDate,
    };

    const collectedRows = [];
    let currentPage = 1;

    while (true) {
      const response = await fetchInAppLeadPage({
        ...exportQuery,
        page_no: currentPage,
      });

      if (!response?.data?.success) {
        throw new Error('Failed to fetch export data');
      }

      const payload = response?.data?.data || {};
      const rows = payload?.rows || [];

      collectedRows.push(...rows);

      const totalRows = getTotalCount(payload, collectedRows);

      if (!rows.length || collectedRows.length >= totalRows || rows.length < exportQuery.limit) {
        break;
      }

      currentPage += 1;
    }

    return collectedRows;
  }, [fetchInAppLeadPage, query]);

  const handleExport = async ({ startDate, endDate }) => {
    try {
      setIsExporting(true);

      const exportRows = await fetchAllLeadsForExport(startDate, endDate);

      if (!exportRows.length) {
        ToastNotification.error("No data found for selected date range");
        return;
      }

      await exportToExcel(exportRows);

      ToastNotification.success("Excel exported successfully");
      setIsExportModalOpen(false);
    } catch (error) {
      ToastNotification.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const summaryMetrics = useMemo(() => {
    if (serverSummary) {
      return {
        totalUsers: Number(serverSummary?.totalUsers ?? totalDataCount) || 0,
        totalLoanAmount: Number(serverSummary?.totalLoanAmount) || 0,
        totalOffers: Number(serverSummary?.totalOffers) || 0,
        usersWithOffers: Number(serverSummary?.usersWithOffers) || 0,
      };
    }

    const totalUsers = totalDataCount || rawData.length;

    const totalLoanAmount = rawData.reduce(
      (sum, item) =>
        sum + Number(item.requiredLoanAmount || item.loanAmount || 0),
      0
    );

    const totalOffers = rawData.reduce((count, item) => {
      const offers = item.lender_responses?.filter(lr => lr.isOffer)?.length || 0;
      return count + offers;
    }, 0);

    const usersWithOffers = rawData.filter(item =>
      item.lender_responses?.some(lr => lr.isOffer)
    ).length;

    return {
      totalUsers,
      totalLoanAmount,
      totalOffers,
      usersWithOffers
    };
  }, [rawData, serverSummary, totalDataCount]);

  const dynamicMetrics = useMemo(() => [
    {
      title: "Total Users",
      value: Number(summaryMetrics.totalUsers) || 0,
      icon: "Users",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Loan Amount",
      value: Number(summaryMetrics.totalLoanAmount) || 0,
      icon: "Wallet",
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Total Offers",
      value: Number(summaryMetrics.totalOffers) || 0,
      icon: "BadgePercent",
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Users With Offers",
      value: Number(summaryMetrics.usersWithOffers) || 0,
      icon: "UserCheck",
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
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
