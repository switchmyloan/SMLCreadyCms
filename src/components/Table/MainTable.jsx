import React, { useEffect, useRef, useState } from 'react';

import { Search } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCcw,
  Download,
  Calendar,
} from 'lucide-react';


const DebouncedInput = ({ value: initialValue, onChange, onSearch, debounce = 1000, placeholder = "Search...", ...props }) => {
  // States
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);
  const mode = "light"
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, debounce, onChange]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(value);
    }
    // console.log("Current Search Value:", value);
  };

  useEffect(() => {
    // console.log(value, "sdad")
    if (value !== '' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [value]);

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
      <button
        type="button"
        className="absolute right-3 text-gray-500 hover:text-[#6232FF] transition"
      >
        <Search size={20} />
      </button>
    </div>
  );
};

function DataTable({
  columns,
  data,
  totalDataCount,
  onPageChange,
  onSearch,
  loading,
  title,
  onRefresh,
  onFilterByDate,
  activeFilter,
  onFilterByRange,
  activeDateRange,
  dynamicFilters,
  incomeRanges,
  onFilterByIncome,
  activeIncomeFilter,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  /* 🔥 Notify parent ONLY for pagination */
  useEffect(() => {
    onPageChange && onPageChange(pagination);
  }, [pagination]);

  return (
    <div className="p-3 md:p-4 bg-gray-50 rounded-lg shadow-sm">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <h1 className="text-lg font-semibold">{title}</h1>

        <div className="flex gap-2 items-center">
          {incomeRanges && (
            <select
              value={activeIncomeFilter}
              onChange={(e) => onFilterByIncome(e.target.value)}
              className="p-1.5 border rounded text-sm"
            >
              {incomeRanges.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
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
            onChange={(val) => {
              setGlobalFilter(val);
              onSearch && onSearch(val);
            }}
            placeholder="Search..."
          />
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
          Page {pagination.pageIndex + 1} of {Math.ceil(totalDataCount / pagination.pageSize)}
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
          <button onClick={() => setPagination(p => ({ ...p, pageIndex: Math.ceil(totalDataCount / p.pageSize) - 1 }))}>
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
