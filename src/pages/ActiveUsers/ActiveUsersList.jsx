import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Users,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Wifi,
  WifiOff,
  Clock,
  Download,
  LayoutDashboard,
  SlidersHorizontal,
} from 'lucide-react';
import { getActiveUsers, getLendersForFilter } from '../../api-services/Modules/ActiveUsersApi';
import { Link } from 'react-router-dom';

const ActiveUsersList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [lenders, setLenders] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    lenderId: '',
    minAge: '',
    maxAge: '',
    minIncome: '',
    maxIncome: '',
    minLoanAmount: '',
    maxLoanAmount: '',
    gender: '',
    employmentType: '',
    isOnline: '',
  });

  // Fetch lenders for dropdown
  useEffect(() => {
    const fetchLenders = async () => {
      try {
        const res = await getLendersForFilter();
        const lenderData = res?.data?.data || res?.data || [];
        setLenders(Array.isArray(lenderData) ? lenderData : []);
      } catch (err) {
        console.error('Failed to fetch lenders:', err);
      }
    };
    fetchLenders();
  }, []);

  // Fetch active users
  const fetchData = useCallback(async (page = 1, limit = 20, filterParams = {}) => {
    setLoading(true);
    try {
      const res = await getActiveUsers(page, limit, filterParams);
      const responseData = res?.data?.data || res?.data || {};

      setData(responseData.users || []);
      setPagination({
        page: responseData.page || page,
        limit: responseData.limit || limit,
        total: responseData.total || 0,
        totalPages: responseData.totalPages || 0,
      });
    } catch (err) {
      console.error('Failed to fetch active users:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData(pagination.page, pagination.limit, filters);
  }, []);

  // Handle filter apply
  const handleApplyFilters = () => {
    fetchData(1, pagination.limit, filters);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    const resetFilters = {
      search: '',
      lenderId: '',
      minAge: '',
      maxAge: '',
      minIncome: '',
      maxIncome: '',
      minLoanAmount: '',
      maxLoanAmount: '',
      gender: '',
      employmentType: '',
      isOnline: '',
    };
    setFilters(resetFilters);
    setGlobalFilter('');
    fetchData(1, pagination.limit, resetFilters);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchData(newPage, pagination.limit, filters);
  };

  // Handle search
  const handleSearch = () => {
    const newFilters = { ...filters, search: globalFilter };
    setFilters(newFilters);
    fetchData(1, pagination.limit, newFilters);
  };

  // Export to CSV
  const handleExport = () => {
    if (data.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Activities', 'Last Active', 'Last Login'];
    const csvRows = [headers.join(',')];

    data.forEach(user => {
      const row = [
        user.id,
        `"${user.fullName || `${user.firstName} ${user.lastName}`}"`,
        user.emailAddress,
        user.phoneNumber,
        user.isOnline ? 'Online' : 'Offline',
        user.activityCount || 0,
        user.lastActivityAt ? new Date(user.lastActivityAt).toISOString() : '',
        user.lastLogin ? new Date(user.lastLogin).toISOString() : '',
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `active_users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <span className="text-gray-600 text-sm">{row.original.id}</span>
        ),
        size: 80,
      },
      {
        accessorKey: 'fullName',
        header: 'User',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-indigo-600">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </p>
              </div>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: 'emailAddress',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-gray-600 text-sm">{row.original.emailAddress}</span>
        ),
        size: 220,
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="text-gray-600 text-sm">{row.original.phoneNumber}</span>
        ),
        size: 140,
      },
      {
        accessorKey: 'isOnline',
        header: 'Status',
        cell: ({ row }) => (
          row.original.isOnline ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              <Wifi size={12} />
              Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              <WifiOff size={12} />
              Offline
            </span>
          )
        ),
        size: 100,
      },
      {
        accessorKey: 'activityCount',
        header: 'Activities',
        cell: ({ row }) => (
          <span className="font-medium text-gray-700 text-sm">
            {(row.original.activityCount || 0).toLocaleString('en-IN')}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: 'lastActivityAt',
        header: 'Last Active',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock size={12} />
            {row.original.lastActivityAt ? new Date(row.original.lastActivityAt).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }) : 'N/A'}
          </div>
        ),
        size: 150,
      },
      {
        accessorKey: 'lastLogin',
        header: 'Last Login',
        cell: ({ row }) => (
          <div className="text-gray-500 text-xs">
            {row.original.lastLogin ? new Date(row.original.lastLogin).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }) : 'N/A'}
          </div>
        ),
        size: 120,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  return (
    <div className="space-y-4 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total.toLocaleString('en-IN')} users found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/active-users-dashboard"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
          <button
            onClick={handleExport}
            disabled={data.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
          >
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => fetchData(pagination.page, pagination.limit, filters)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Search
          </button>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm ${
            showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {Object.values(filters).filter(v => v !== '').length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-indigo-600 text-white rounded-full text-xs">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Lender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lender</label>
              <select
                value={filters.lenderId}
                onChange={(e) => setFilters({ ...filters, lenderId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Lenders</option>
                {lenders.map((lender) => (
                  <option key={lender.id} value={lender.id}>
                    {lender.name || lender.lenderName}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Employment Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                value={filters.employmentType}
                onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                <option value="salaried">Salaried</option>
                <option value="self_employed">Self Employed</option>
                <option value="business">Business</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* Online Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Online Status</label>
              <select
                value={filters.isOnline}
                onChange={(e) => setFilters({ ...filters, isOnline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Users</option>
                <option value="true">Online Only</option>
                <option value="false">Offline Only</option>
              </select>
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
              <input
                type="number"
                value={filters.minAge}
                onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
                placeholder="18"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
              <input
                type="number"
                value={filters.maxAge}
                onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
                placeholder="65"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Income Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Income</label>
              <input
                type="number"
                value={filters.minIncome}
                onChange={(e) => setFilters({ ...filters, minIncome: e.target.value })}
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Income</label>
              <input
                type="number"
                value={filters.maxIncome}
                onChange={(e) => setFilters({ ...filters, maxIncome: e.target.value })}
                placeholder="500000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Loan Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Loan Amount</label>
              <input
                type="number"
                value={filters.minLoanAmount}
                onChange={(e) => setFilters({ ...filters, minLoanAmount: e.target.value })}
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Loan Amount</label>
              <input
                type="number"
                value={filters.maxLoanAmount}
                onChange={(e) => setFilters({ ...filters, maxLoanAmount: e.target.value })}
                placeholder="1000000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Reset All
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left py-3 px-4 font-semibold text-gray-600 text-sm cursor-pointer hover:bg-gray-100"
                      style={{ width: header.getSize() }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && ' ▲'}
                        {header.column.getIsSorted() === 'desc' && ' ▼'}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index} className="border-b border-gray-50">
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No active users found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total.toLocaleString('en-IN')} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveUsersList;
