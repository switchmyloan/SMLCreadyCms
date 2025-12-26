import React, { useEffect, useRef, useState } from 'react';
import {
  Plus, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight,
  RefreshCcw, Download, Calendar
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

import { Search } from "lucide-react";

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 1000,
  placeholder = "Search...",
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value); // ✅ ONLY ONE SOURCE
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <div className="relative flex items-center">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-gray-300 px-5 py-2.5 pr-12 text-sm text-gray-700 placeholder-gray-400 focus:border-[#6232FF] focus:ring-1 focus:ring-[#6232FF] outline-none transition"
      />
      <span className="absolute right-3 text-gray-500">
        <Search size={20} />
      </span>
    </div>
  );
};



function DataTable({
  columns,
  data,
  onCreate,
  createLabel = 'Create',
  onRefresh,
  totalDataCount,
  onPageChange,
  onSearch,
  title = "Page",
  loading = false,
  onExport,
  onFilterByDate,
  activeFilter,
  onFilterByRange,
  activeDateRange = { startDate: null, endDate: null },
  activeStatusFilter = 'success',
  onFilterChange,
  dynamicFilters,
  activeIncomeFilter,
  incomeRanges,
  onFilterByIncome
}) {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedGoTo, setSelectedGoTo] = useState(1);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalDataCount / pagination.pageSize),
  });

  /* 🔥 Pagination → parent */
  useEffect(() => {
    onPageChange(pagination);
  }, [pagination]);

  /* 🔥 Search → parent (ONLY PLACE) */
  useEffect(() => {
    onSearch && onSearch(globalFilter);
  }, [globalFilter]);

  useEffect(() => {
    setSelectedGoTo(pagination.pageIndex + 1);
  }, [pagination.pageIndex]);

  const pageOptions = Array.from(
    { length: Math.ceil(totalDataCount / pagination.pageSize) },
    (_, i) => ({ value: i + 1, label: `Page ${i + 1}` })
  );

  return (
    <div className="p-3 md:p-4 bg-gray-50 rounded-lg shadow-sm">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-1">
        <h1 className="text-lg font-semibold">{title}</h1>

        <div className="flex flex-wrap gap-2 items-center">

          {incomeRanges && (
            <select
              value={activeIncomeFilter || ''}
              onChange={(e) => onFilterByIncome(e.target.value)}
              className="p-1.5 border rounded text-sm"
            >
              {incomeRanges.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {dynamicFilters?.map(filter => (
            <select
              key={filter.key}
              value={filter.activeValue}
              onChange={(e) => filter.onChange(e.target.value)}
              className="p-1.5 border rounded text-sm"
            >
              <option value="">{filter.label}</option>
              {filter.options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ))}

          <button onClick={onRefresh} className="p-2">
            <RefreshCcw size={16} />
          </button>

          <DebouncedInput
            value={globalFilter}
            onChange={setGlobalFilter}
            placeholder="Search..."
          />

          {onCreate && (
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              {createLabel}
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <table className="min-w-full bg-white border">
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id}>
              {hg.headers.map(h => (
                <th key={h.id} className="px-4 py-2 border">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length}>Loading...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length}>No data</td></tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2 border">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm">
          Page {pagination.pageIndex + 1} of {table.getPageCount()}
        </span>

        <div className="flex gap-1">
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: 0 }))}>
            <ChevronsLeft size={16} />
          </button>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex - 1 }))}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))}>
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: table.getPageCount() - 1 }))}>
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
