import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  Users,
  Send,
  BadgeCheck,
  XCircle,
  MousePointerClick,
  Clock,
} from 'lucide-react';
import DataTable from '@components/Table/MainTable';
import ToastNotification from '@components/Notification/ToastNotification';
import { getGoldLoanLeads } from '../../../api-services/Modules/Leads';
import { goldLoanLeadsColumn } from './goldLoanColumns';

/* ============== Funnel Stages ============== */
const FUNNEL_STAGES = [
  {
    key: 'submitted',
    label: 'Submitted',
    field: 'submitted',
    icon: Send,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-300',
  },
  {
    key: 'offer',
    label: 'Offer Received',
    field: 'offer',
    icon: BadgeCheck,
    color: 'text-green-600',
    bg: 'bg-green-50',
    ring: 'ring-green-300',
  },
  {
    key: 'no_offer',
    label: 'No Offer',
    field: 'noOffer',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    ring: 'ring-red-300',
  },
  {
    key: 'clicked',
    label: 'Offer Clicked',
    field: 'clicked',
    icon: MousePointerClick,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    ring: 'ring-indigo-300',
  },
  {
    key: 'expired',
    label: 'Expired',
    field: 'expired',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    ring: 'ring-amber-300',
  },
];

const FunnelCards = ({ funnel, activeStage, onStageClick, loading }) => {
  const submitted = funnel?.submitted || 0;

  const pct = (val) => {
    if (!submitted) return 0;
    return Math.round((val / submitted) * 100);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse h-[92px]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {/* Total Leads (view all) */}
      <button
        type="button"
        onClick={() => onStageClick('')}
        className={`text-left p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition hover:shadow-md ${
          activeStage === '' ? 'ring-2 ring-gray-400' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Leads</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {submitted.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Today: {(funnel?.todaySubmitted || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-2 rounded-full bg-gray-50">
            <Users className="text-gray-600" size={20} />
          </div>
        </div>
      </button>

      {FUNNEL_STAGES.map((s) => {
        const Icon = s.icon;
        const val = funnel?.[s.field] || 0;
        const isActive = activeStage === s.key;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onStageClick(isActive ? '' : s.key)}
            className={`text-left p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition hover:shadow-md ${
              isActive ? `ring-2 ${s.ring}` : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {val.toLocaleString()}
                </p>
                <p className={`text-[11px] mt-0.5 ${s.color}`}>
                  {pct(val)}% of submitted
                </p>
              </div>
              <div className={`p-2 rounded-full ${s.bg}`}>
                <Icon className={s.color} size={20} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const GoldLoanLeads = () => {
  const [rawData, setRawData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeIncomeFilter, setActiveIncomeFilter] = useState('');
  const [funnel, setFunnel] = useState({
    submitted: 0,
    offer: 0,
    noOffer: 0,
    clicked: 0,
    expired: 0,
    todaySubmitted: 0,
  });

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

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
    stage: '',
  });

  const genderOptions = useMemo(
    () => [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
    ],
    []
  );

  const incomeRanges = [
    { label: 'All', value: '' },
    { label: 'Less than ₹20,000', value: '0-20000' },
    { label: '₹20,001 - ₹50,000', value: '20001-50000' },
    { label: '₹50,001 - ₹1,00,000', value: '50001-100000' },
    { label: 'Above ₹1,00,000', value: '100001-100000000' },
  ];

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
      if (query.stage) filters.stage = query.stage;

      const response = await getGoldLoanLeads(
        query.page_no,
        query.limit,
        filters
      );

      if (response?.data?.success) {
        const data = response.data.data;
        setRawData(data.rows || []);
        setTotalDataCount(data.pagination?.total || 0);
        if (data.funnel) setFunnel(data.funnel);
      } else {
        setRawData([]);
        setTotalDataCount(0);
        ToastNotification.error('Failed to fetch gold loan leads');
      }
    } catch (err) {
      console.error(err);
      ToastNotification.error('API Error');
    } finally {
      setLoading(false);
    }
  }, [
    query.page_no,
    query.limit,
    query.filter_date,
    query.search,
    query.gender,
    query.minIncome,
    query.maxIncome,
    query.startDate,
    query.endDate,
    query.stage,
  ]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const resetToFirstPage = useCallback(() => {
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    );
  }, []);

  const onPageChange = useCallback((pageInfo) => {
    setPagination((prev) =>
      prev.pageIndex === pageInfo.pageIndex && prev.pageSize === pageInfo.pageSize
        ? prev
        : { pageIndex: pageInfo.pageIndex, pageSize: pageInfo.pageSize }
    );
    setQuery((prev) =>
      prev.page_no === pageInfo.pageIndex + 1 && prev.limit === pageInfo.pageSize
        ? prev
        : {
            ...prev,
            page_no: pageInfo.pageIndex + 1,
            limit: pageInfo.pageSize,
          }
    );
  }, []);

  const onSearchHandler = useCallback(
    (term) => {
      resetToFirstPage();
      setQuery((prev) =>
        prev.search === term && prev.page_no === 1
          ? prev
          : { ...prev, search: term, page_no: 1 }
      );
    },
    [resetToFirstPage]
  );

  const handleGenderFilter = useCallback(
    (value) => {
      resetToFirstPage();
      setQuery((prev) => ({ ...prev, gender: value, page_no: 1 }));
    },
    [resetToFirstPage]
  );

  const onFilterByDate = useCallback(
    (type) => {
      resetToFirstPage();
      setQuery((prev) => ({
        ...prev,
        filter_date: prev.filter_date === type ? '' : type,
        startDate: null,
        endDate: null,
        page_no: 1,
      }));
    },
    [resetToFirstPage]
  );

  const onFilterByRange = useCallback(
    (range) => {
      resetToFirstPage();
      setQuery((prev) => ({
        ...prev,
        startDate: range.startDate,
        endDate: range.endDate,
        filter_date: '',
        page_no: 1,
      }));
    },
    [resetToFirstPage]
  );

  const handleIncomeFilter = useCallback(
    (value) => {
      setActiveIncomeFilter(value);
      resetToFirstPage();
      if (!value) {
        setQuery((prev) => ({
          ...prev,
          minIncome: undefined,
          maxIncome: undefined,
          page_no: 1,
        }));
        return;
      }
      const [min, max] = value.split('-').map(Number);
      setQuery((prev) => ({ ...prev, minIncome: min, maxIncome: max, page_no: 1 }));
    },
    [resetToFirstPage]
  );

  const handleStageClick = useCallback(
    (stage) => {
      resetToFirstPage();
      setQuery((prev) => ({ ...prev, stage, page_no: 1 }));
    },
    [resetToFirstPage]
  );

  const dynamicFiltersArray = useMemo(
    () => [
      {
        key: 'gender',
        label: 'Gender',
        activeValue: query.gender,
        options: genderOptions,
        onChange: handleGenderFilter,
      },
      {
        key: 'stage',
        label: 'Funnel Stage',
        activeValue: query.stage,
        options: [
          { label: 'All', value: '' },
          { label: 'Submitted', value: 'submitted' },
          { label: 'Offer Received', value: 'offer' },
          { label: 'No Offer', value: 'no_offer' },
          { label: 'Clicked', value: 'clicked' },
          { label: 'Expired', value: 'expired' },
        ],
        onChange: handleStageClick,
      },
    ],
    [query.gender, query.stage, genderOptions, handleGenderFilter, handleStageClick]
  );

  const handleRefresh = useCallback(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <>
      <Toaster />
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Gold Loan Leads · Muthoot Finance
        </h2>
        <p className="text-sm text-gray-500">
          Full funnel view of gold loan leads submitted to Muthoot Finance.
        </p>
      </div>

      <FunnelCards
        funnel={funnel}
        activeStage={query.stage}
        onStageClick={handleStageClick}
        loading={loading}
      />

      <DataTable
        title="Gold Loan Leads"
        columns={goldLoanLeadsColumn()}
        data={rawData}
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
      />
    </>
  );
};

export default GoldLoanLeads;
