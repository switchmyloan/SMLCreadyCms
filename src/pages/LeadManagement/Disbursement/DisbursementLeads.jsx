import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '@components/Table/MainTable';
import { Toaster } from 'react-hot-toast';
import ToastNotification from '@components/Notification/ToastNotification';
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { Building2, TrendingUp } from 'lucide-react';
import SummaryCards from '../../../components/SummaryCards';
import { getDisbursements } from '../../../api-services/Modules/Leads';
import { maskPhone } from '../../../utils/maskPhone';

const LENDER_COLORS = [
  '#047857',
  '#0d9488',
  '#0891b2',
  '#2563eb',
  '#7c3aed',
  '#c026d3',
  '#db2777',
  '#dc2626',
  '#ea580c',
  '#b45309',
  '#65a30d',
  '#16a34a',
  '#0f766e',
  '#0369a1',
  '#4338ca',
];

const formatINRCompact = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const formatINRFull = (n) =>
  `₹${(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const getDateParams = (query) => {
  if (query.startDate && query.endDate) {
    return { fromDate: query.startDate, toDate: query.endDate, type: '' };
  }
  if (query.filter_date === 'today') return { fromDate: '', toDate: '', type: 'today' };
  if (query.filter_date === 'yesterday') return { fromDate: '', toDate: '', type: 'yesterday' };
  return { fromDate: '', toDate: '', type: '' };
};

const disbursementColumns = () => [
  {
    header: 'SN',
    id: 'sn',
    enableSorting: false,
    maxSize: 50,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  {
    header: 'Lead ID',
    accessorKey: 'leadId',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-gray-700">{getValue() || 'N/A'}</span>
    ),
  },
  {
    header: 'MRN',
    accessorKey: 'mrn',
    cell: ({ getValue }) => (
      <span className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
        {getValue() || 'N/A'}
      </span>
    ),
  },
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ row }) => {
      const fn = row.original.firstName || '';
      const ln = row.original.lastName || '';
      const full = `${fn} ${ln}`.trim() || 'N/A';
      return (
        <div className="truncate max-w-[140px]" title={full}>
          {full}
        </div>
      );
    },
  },
  {
    header: 'Phone',
    accessorKey: 'phone',
    cell: ({ getValue }) => getValue()|| 'N/A',
  },
  {
    header: 'Lender',
    accessorKey: 'lender',
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-gray-800">{getValue() || 'N/A'}</span>
    ),
  },
  {
    header: 'Entity',
    accessorKey: 'entity',
    cell: ({ getValue }) => (
      <span className="text-xs text-gray-600">{getValue() || 'N/A'}</span>
    ),
  },
  {
    header: 'Amount',
    accessorKey: 'disbursementAmount',
    cell: ({ getValue }) => {
      const v = getValue();
      if (!v) return <span className="text-gray-400 text-xs">N/A</span>;
      return (
        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700">
          {formatINRFull(v)}
        </span>
      );
    },
  },
  {
    header: 'Disb. Date',
    accessorKey: 'disbursementDate',
    cell: ({ getValue }) => (
      <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
        {formatDate(getValue())}
      </span>
    ),
  },
  {
    header: 'Status',
    accessorKey: 'misStatus',
    cell: ({ getValue }) => {
      const status = (getValue() || '').toString().toLowerCase();
      const isDisbursed = status.includes('disburs');
      const cls = isDisbursed
        ? 'bg-green-100 text-green-800'
        : 'bg-gray-100 text-gray-700';
      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${cls}`}>
          {getValue() || 'N/A'}
        </span>
      );
    },
  },
];

const LenderBreakdownChart = ({ data }) => {
  const top = useMemo(
    () => [...(data || [])].sort((a, b) => b.amount - a.amount).slice(0, 10),
    [data]
  );

  if (!top.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-full flex flex-col">
        <div className="flex items-center gap-2">
          <Building2 className="text-emerald-600" size={18} />
          <h3 className="text-sm font-semibold text-gray-800">Top lenders by disbursal amount</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No disbursement data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="text-emerald-600" size={18} />
          <h3 className="text-sm font-semibold text-gray-800">
            Top lenders by disbursal amount
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
          <TrendingUp size={11} /> {top.length} lenders
        </span>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={top}
            margin={{ top: 8, right: 16, left: -8, bottom: 8 }}
            layout="vertical"
          >
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatINRCompact(v)}
            />
            <YAxis
              type="category"
              dataKey="lender"
              tick={{ fill: '#334155', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <Tooltip
              cursor={{ fill: 'rgba(4, 120, 87, 0.05)' }}
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => {
                if (name === 'amount') return [formatINRFull(value), 'Amount'];
                return [value, name];
              }}
            />
            <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={22}>
              {top.map((_, i) => (
                <Cell key={i} fill={LENDER_COLORS[i % LENDER_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DisbursementLeads = () => {
  const [rows, setRows] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalCount: 0,
    avgTicket: 0,
    todayCount: 0,
    todayAmount: 0,
  });
  const [lenderBreakdown, setLenderBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
    filter_date: '',
    startDate: null,
    endDate: null,
    lender: '',
    attribution: 'loose',
  });

  const resetToFirstPage = useCallback(() => {
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, []);

  const fetchDisbursementPage = useCallback(async (activeQuery) => {
    try {
      setLoading(true);
      const { fromDate, toDate, type } = getDateParams(activeQuery);

      const response = await getDisbursements(activeQuery.page_no, activeQuery.limit, {
        search: activeQuery.search,
        lender: activeQuery.lender,
        attribution: activeQuery.attribution,
        fromDate,
        toDate,
        type,
      });

      if (response?.data?.success) {
        const payload = response?.data?.data || {};
        setRows(payload?.rows || []);
        setTotalDataCount(payload?.pagination?.total || 0);
        setSummary(
          payload?.summary || {
            totalAmount: 0,
            totalCount: 0,
            avgTicket: 0,
            todayCount: 0,
            todayAmount: 0,
          }
        );
        setLenderBreakdown(payload?.lenderBreakdown || []);
      } else {
        setRows([]);
        setTotalDataCount(0);
        setSummary({
          totalAmount: 0,
          totalCount: 0,
          avgTicket: 0,
          todayCount: 0,
          todayAmount: 0,
        });
        setLenderBreakdown([]);
        ToastNotification.error('Failed to fetch disbursements');
      }
    } catch (err) {
      console.error('fetchDisbursementPage failed', err);
      ToastNotification.error('API Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisbursementPage(query);
  }, [fetchDisbursementPage, query]);

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

  const handleLenderFilter = useCallback(
    (lender) => {
      resetToFirstPage();
      setQuery((prev) => ({ ...prev, lender, page_no: 1 }));
    },
    [resetToFirstPage]
  );

  const handleAttributionFilter = useCallback(
    (value) => {
      resetToFirstPage();
      setQuery((prev) => ({
        ...prev,
        attribution: value || 'loose',
        page_no: 1,
      }));
    },
    [resetToFirstPage]
  );

  const handleRefresh = useCallback(() => {
    fetchDisbursementPage(query);
  }, [fetchDisbursementPage, query]);

  const lenderOptions = useMemo(() => {
    const options = [{ label: 'All', value: '' }];
    (lenderBreakdown || []).forEach((l) => {
      if (l.lender && l.lender !== 'Unknown') {
        options.push({ label: l.lender, value: l.lender });
      }
    });
    return options;
  }, [lenderBreakdown]);

  const attributionOptions = useMemo(
    () => [
      { label: 'Matched leads', value: 'loose' },
      { label: 'Strict (date check)', value: 'strict' },
      { label: 'All (no match)', value: 'off' },
    ],
    []
  );

  const dynamicFiltersArray = useMemo(
    () => [
      {
        key: 'lender',
        label: 'Lender',
        activeValue: query.lender,
        options: lenderOptions,
        onChange: handleLenderFilter,
      },
      {
        key: 'attribution',
        label: 'Show',
        activeValue: query.attribution,
        options: attributionOptions,
        onChange: handleAttributionFilter,
      },
    ],
    [
      query.lender,
      query.attribution,
      lenderOptions,
      attributionOptions,
      handleLenderFilter,
      handleAttributionFilter,
    ]
  );

  const dynamicMetrics = useMemo(() => {
    const totalAmtCr = (summary.totalAmount || 0) / 1e7;
    const avgTicketLakh = (summary.avgTicket || 0) / 1e5;
    const todayAmtLakh = (summary.todayAmount || 0) / 1e5;

    return [
      {
        title: 'Total Disbursed',
        value: Number(totalAmtCr.toFixed(2)) || 0,
        suffix: 'Cr',
        icon: 'Wallet',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        subtitle: formatINRFull(summary.totalAmount),
      },
      {
        title: 'Total Disbursals',
        value: Number(summary.totalCount) || 0,
        icon: 'BadgePercent',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        subtitle: `${(summary.totalCount || 0).toLocaleString('en-IN')} disbursals`,
      },
      {
        title: 'Avg Ticket Size',
        value: Number(avgTicketLakh.toFixed(2)) || 0,
        suffix: 'L',
        icon: 'IndianRupee',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        subtitle: formatINRFull(summary.avgTicket),
      },
      {
        title: 'Today',
        value: Number(summary.todayCount) || 0,
        icon: 'TrendingUp',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        subtitle: `${todayAmtLakh.toFixed(2)} L disbursed today`,
      },
    ];
  }, [summary]);

  return (
    <>
      <Toaster />
      <SummaryCards metrics={dynamicMetrics} loading={loading} />

      <div className="mb-4">
        <LenderBreakdownChart data={lenderBreakdown} />
      </div>

      <DataTable
        columns={disbursementColumns()}
        title="Disbursements"
        data={rows}
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
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}
        dynamicFilters={dynamicFiltersArray}
      />
    </>
  );
};

export default DisbursementLeads;
