import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import DataTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '@components/Notification/ToastNotification';
import { getPartnerLeads, getAllPartnerLeads } from '../../../api-services/Modules/Leads';
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
    { header: "Lead ID", key: "leadId", width: 10 },
    { header: "MRN", key: "mrn", width: 20 },
    { header: "First Name", key: "firstName", width: 15 },
    { header: "Last Name", key: "lastName", width: 15 },
    { header: "Email", key: "email", width: 25 },
    { header: "Phone Number", key: "phoneNumber", width: 15 },
    { header: "Gender", key: "gender", width: 10 },
    { header: "Date of Birth", key: "dateOfBirth", width: 15 },
    { header: "Pincode", key: "pincode", width: 10 },
    { header: "PAN Card", key: "panCard", width: 15 },
    { header: "IP Address", key: "ipAddress", width: 18 },
    { header: "Job Type", key: "jobType", width: 15 },
    { header: "Postal Code", key: "postalCode", width: 12 },
    { header: "Monthly Income", key: "monthlyIncome", width: 15 },
    { header: "Looking For", key: "lookingFor", width: 15 },
    { header: "Consent Communication", key: "consentCommunication", width: 60 },
    { header: "Consent Credit Access", key: "consentCreditAccess", width: 60 },
    { header: "UTM Source", key: "utm_source", width: 15 },
    { header: "UTM Medium", key: "utm_medium", width: 15 },
    { header: "UTM Campaign", key: "utm_campaign", width: 15 },
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
      lenderStatusMap[lender] = "No";
    });

    item.lender_responses = parseLenderResponses(item.lender_responses);
    item.lender_responses?.forEach(lr => {
      const lenderName = lr?.lender?.name;
      if (!lenderName) return;
      if (lr.isOffer) {
        lenderStatusMap[lenderName] = lr?.leadId || "Yes";
      }
    });

    worksheet.addRow({
      leadId: item.id || "N/A",
      mrn: item.mrn || "N/A",
      firstName: item.firstName || "N/A",
      lastName: item.lastName || "N/A",
      email: item.email || "N/A",
      phoneNumber: item.phoneNumber || "N/A",
      gender: item.gender || "N/A",
      dateOfBirth: item.dateOfBirth
        ? new Date(item.dateOfBirth).toLocaleDateString("en-IN")
        : "N/A",
      pincode: item.pincode || "N/A",
      panCard: item.panCard || "N/A",
      ipAddress: item.ipAddress || "N/A",
      jobType: item.jobType || "N/A",
      postalCode: item.postalCode || "N/A",
      monthlyIncome: item.monthlyIncome || "N/A",
      lookingFor: item.lookingFor || "N/A",
      consentCommunication: item.consentCommunication || "N/A",
      consentCreditAccess: item.consentCreditAccess || "N/A",
      utm_source: item.utm_header?.utm_source || "N/A",
      utm_medium: item.utm_header?.utm_medium || "N/A",
      utm_campaign: item.utm_header?.utm_campaign || "N/A",
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

  // StrictMode double-fire guard
  const fetchSeqRef = useRef(0);

  const buildApiFilters = useCallback(() => {
    const f = {};
    if (query.filter_date) f.type = query.filter_date;
    if (query.search) f.search = query.search;
    if (query.gender) f.gender = query.gender;
    if (query.jobType) f.jobType = query.jobType;
    if (query.minIncome !== undefined) f.minIncome = query.minIncome;
    if (query.maxIncome !== undefined) f.maxIncome = query.maxIncome;
    if (query.minAge !== undefined) f.minAge = query.minAge;
    if (query.maxAge !== undefined) f.maxAge = query.maxAge;
    if (query.startDate) f.fromDate = query.startDate;
    if (query.endDate) f.toDate = query.endDate;
    return f;
  }, [
    query.filter_date, query.search, query.gender, query.jobType,
    query.minIncome, query.maxIncome, query.minAge, query.maxAge,
    query.startDate, query.endDate,
  ]);

  const fetchLeads = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    try {
      setLoading(true);
      const response = await getPartnerLeads(
        pagination.pageIndex + 1,
        pagination.pageSize,
        buildApiFilters()
      );
      if (seq !== fetchSeqRef.current) return; // stale

      if (response?.data?.success) {
        const rows = response.data.data.rows || [];
        const total = response.data.data.pagination?.total || 0;
        setRawData(rows);
        setData(rows);
        setTotalDataCount(total);
      } else {
        setRawData([]);
        setData([]);
        setTotalDataCount(0);
        ToastNotification.error("Failed to fetch leads");
      }
    } catch (err) {
      console.error(err);
      if (seq === fetchSeqRef.current) ToastNotification.error("API Error");
    } finally {
      if (seq === fetchSeqRef.current) setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, buildApiFilters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  /* ========================= SUMMARY ========================= */
  // Page-level summary built off the current page's rows. Total comes from server.
  const summaryMetrics = useMemo(() => {
    const totalLoanAmount = rawData.reduce(
      (sum, item) => sum + Number(item.requiredLoanAmount || item.loanAmount || 0), 0
    );
    const today = new Date().toDateString();
    const todayLeads = rawData.filter(
      item => new Date(item.createdAt).toDateString() === today
    ).length;
    const dedupe = rawData.filter(item => item.isDuplicate === true).length;
    return { totalLeads: totalDataCount, totalLoanAmount, todayLeads, dedupe };
  }, [rawData, totalDataCount]);

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

      const normalizedMode = String(mode || '').toLowerCase().trim();
      const isToday     = normalizedMode.includes('today');
      const isYesterday = normalizedMode.includes('yesterday');
      const isRange     = normalizedMode.includes('range') ||
                          normalizedMode.includes('custom') ||
                          normalizedMode.includes('date');

      // Build server filters: include current UI filters + override date based on export mode
      const exportFilters = { ...buildApiFilters() };
      delete exportFilters.type;
      delete exportFilters.fromDate;
      delete exportFilters.toDate;

      if (isToday) {
        exportFilters.type = 'today';
      } else if (isYesterday) {
        exportFilters.type = 'yesterday';
      } else if ((isRange || (startDate && endDate)) && startDate && endDate) {
        exportFilters.fromDate = startDate;
        exportFilters.toDate = endDate;
      } else {
        ToastNotification.error("Please select a valid date range");
        return;
      }

      const response = await getAllPartnerLeads(exportFilters);
      if (!response?.data?.success) {
        ToastNotification.error("Failed to fetch data for export");
        return;
      }
      const exportData = response.data.data.rows || [];

      if (!exportData.length) {
        ToastNotification.error("No data found for selected date range");
        return;
      }

      await exportToExcel(exportData);
      ToastNotification.success("Excel exported successfully");
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Export error:", error);
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