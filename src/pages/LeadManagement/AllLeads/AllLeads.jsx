

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import { getAllLeads, getLeads } from '../../../api-services/Modules/Leads';
import { leadsColumn } from '../../../components/TableHeader';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SummaryCards from '../../../components/SummaryCards';
import ExportModal from '../../../components/ExportModal';



const exportToExcel = async (rawData) => {
  if (!rawData || rawData.length === 0) {
    ToastNotification.error("No data to export");
    return;
  }

  const filteredData = rawData.filter(item => item.firstName !== 'NA');

  if (filteredData.length === 0) {
    ToastNotification.error("No valid data to export after filtering");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Leads Lender Offers");

  const allLenders = Array.from(
    new Set(
      filteredData.flatMap(item =>
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

  filteredData.forEach(item => {
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
      //  ipAddress: item.ipAddress,
      // creditConsentText: item.creditConsentText,
      // communicationConsentText: item.communicationConsentText,
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

  saveAs(blob, "All_Leads_Report.xlsx");
};
const AllLeads = () => {
  const navigate = useNavigate();

  const [rawData, setRawData] = useState([]);      // 🔥 full data
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeIncomeFilter, setActiveIncomeFilter] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [summaryMetrics, setSummaryMetrics] = useState({
    totalLeads: 0,
    profileCompleted: 0,
    todayLeads: 0,
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
    gender: '',
    minIncome: undefined,
    maxIncome: undefined,
    minAge: undefined,
    maxAge: undefined,
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

      const handleJobTypeFilter = useCallback((jobType) => {
        setQuery(prev => ({
          ...prev,
          jobType,
          page_no: 1
        }));
      }, []);

  const handleDobFilter = useCallback((value) => {
    if (!value) {
      setQuery(prev => ({
        ...prev,
        minAge: undefined,
        maxAge: undefined,
        page_no: 1
      }));
      return;
    }

    const [min, max] = value.split('-');

    setQuery(prev => ({
      ...prev,
      minAge: Number(min),
      maxAge: Number(max),
      page_no: 1
    }));
  }, []);

  /* ========================= FETCH ========================= */

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);

      const filters = {};
      if (query.filter_date) filters.type = query.filter_date;
      if (query.search) filters.search = query.search;
      if (query.gender) filters.gender = query.gender;
      if (query.minIncome !== undefined) filters.minIncome = query.minIncome;
      if (query.maxIncome !== undefined) filters.maxIncome = query.maxIncome;
      if (query.startDate) filters.fromDate = query.startDate;
      if (query.endDate) filters.toDate = query.endDate;

      const response = await getAllLeads(query.page_no, query.limit, filters);

      if (response?.data?.success) {
        const responseData = response.data.data;
        setRawData(responseData.rows || []);

        // Set total from pagination response
        setTotalDataCount(responseData.pagination?.total || 0);

        setSummaryMetrics({
          totalLeads: responseData.summary?.totalLeads || responseData.pagination?.total || 0,
          profileCompleted: responseData.summary?.profileCompleted || 0,
          todayLeads: responseData.summary?.todayLeads || 0,
        });
      } else {
        setRawData([]);
        setTotalDataCount(0);
        ToastNotification.error("Failed to fetch leads");
      }
    } catch (err) {
      console.error(err);
      ToastNotification.error("API Error");
    } finally {
      setLoading(false);
    }
  }, [query.page_no, query.limit, query.filter_date, query.search, query.gender, query.minIncome, query.maxIncome, query.startDate, query.endDate]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  /* ========================= FILTERING ========================= */

  const filteredData = useMemo(() => {
    let rows = [...rawData];

    // 🎂 DOB / AGE FILTER (client-side only)
    if (
      query.minAge !== undefined &&
      query.maxAge !== undefined
    ) {
      rows = rows.filter(item => {
        if (!item.dateOfBirth) return false;

        const dob = new Date(item.dateOfBirth);
        const ageDifMs = Date.now() - dob.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);

        return age >= query.minAge && age <= query.maxAge;
      });
    }

    // Job Type (client-side only)
    if (query.jobType) {
      rows = rows.filter(item =>
        item.jobType?.toLowerCase() === query.jobType
      );
    }

    return rows;
  }, [rawData, query.minAge, query.maxAge, query.jobType]);

  /* ========================= HANDLERS ========================= */

  const resetToFirstPage = useCallback(() => {
    setPagination(prev => (
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    ));
  }, []);

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

  const dynamicFiltersArray = useMemo(() => [
    {
      key: 'gender',
      label: 'Gender',
      activeValue: query.gender,
      options: genderOptions,
      onChange: handleGenderFilter,
    },
      {
      key: 'jobType',                  // ✅ NEW
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
  ], [query.gender, query.minAge, query.maxAge, query.jobType, handleJobTypeFilter]);

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

  const dynamicMetrics = useMemo(() => [
    {
      title: "Total Leads",
      value: Number(summaryMetrics.totalLeads) || 0,
      icon: "Users",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Profile Completed",
      value: Number(summaryMetrics.profileCompleted) || 0,
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
  ], [summaryMetrics]);

  const handleOpenExportModal = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const handleCloseExportModal = useCallback(() => {
    if (!isExporting) {
      setIsExportModalOpen(false);
    }
  }, [isExporting]);

  const handleRefresh = useCallback(() => {
    fetchLeads();
  }, [fetchLeads]);


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
        title="All Leads"
        columns={leadsColumn({ handleEdit })}
        data={filteredData}
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

export default AllLeads;
