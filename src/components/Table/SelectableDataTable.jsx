import React, { useEffect, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

// Helper function for stable array comparison (shallow comparison of objects won't work, so we compare JSON strings)
const areArraysDeepEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    // Simple deep check for arrays of objects like the selected users.
    // NOTE: This assumes object properties are consistently ordered and simple.
    // For production, consider a proper utility like lodash/isEqual.
    return JSON.stringify(arr1) === JSON.stringify(arr2);
};


function SelectableDataTable({ 
  columns, 
  data, 
  onCreate, 
  createLabel = 'Create', 
  totalDataCount,
  onPageChange, 
  title="Page",
  loading = false, 
  onRowSelect, 
  rowSelection, 
  setRowSelection,
}) {
  
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [selectedGoTo, setSelectedGoTo] = React.useState(pagination.pageIndex + 1);
  const prevPaginationRef = useRef(pagination);
  
  // New Ref to store the previously sent selected users data
  const prevSelectedRowsDataRef = useRef([]);

  // --- 1. Define the Select Column ---
  const selectColumn = {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
      />
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  };

  // Combine the select column with the provided columns
  const allColumns = React.useMemo(() => [selectColumn, ...columns], [columns]);


  const table = useReactTable({
    data,
    columns: allColumns,
    state: { 
      sorting, 
      globalFilter, 
      pagination,
      rowSelection: rowSelection 
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    manualPagination: true,
    pageCount: Math.ceil(totalDataCount / pagination.pageSize),
  });

  // 🟢 THE CRITICAL FIX: Stabilized useEffect for onRowSelect
  useEffect(() => {
    if (onRowSelect) {
      // Get the data objects of the currently selected rows
      const selectedRowsData = table.getSelectedRowModel().flatRows.map(row => row.original);
      
      // Check if the content of the data has actually changed
      if (!areArraysDeepEqual(selectedRowsData, prevSelectedRowsDataRef.current)) {
          // If the content is different, call the parent handler
          onRowSelect(selectedRowsData);
          // Update the ref to the new array for the next comparison
          prevSelectedRowsDataRef.current = selectedRowsData;
      }
    }
  // The dependency array is correct. The fix is ensuring the parent handler (onRowSelect) 
  // is only called when the *content* changes, not just the array reference.
  }, [rowSelection, onRowSelect, table]); 


  // EFFECT: Trigger onPageChange only when pageIndex or pageSize changes (Manual Pagination Logic)
  useEffect(() => {
    const currentPagination = table.getState().pagination;
    
    if (
      currentPagination.pageIndex !== prevPaginationRef.current.pageIndex ||
      currentPagination.pageSize !== prevPaginationRef.current.pageSize
    ) {
      onPageChange(currentPagination);
      prevPaginationRef.current = currentPagination;
    }
    setSelectedGoTo(currentPagination.pageIndex + 1);
  }, [table.getState().pagination.pageIndex, table.getState().pagination.pageSize, onPageChange, table]);

  
  const handleGoToChange = (e) => {
    const page = Number(e.target.value);
    const maxPage = table.getPageCount();

    if (page >= 1 && page <= maxPage) {
      setSelectedGoTo(page);
      table.setPageIndex(page - 1);
    } else {
      setSelectedGoTo(table.getState().pagination.pageIndex + 1);
    }
  };

  // Calculate page options dynamically
  const pageOptions = Array.from({ length: table.getPageCount() }, (_, index) => ({
    value: index + 1,
    label: `Page ${index + 1}`,
  }));

  // Skeleton Loader Component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {allColumns.map((_, index) => (
        <td key={index} className="px-4 py-3 border-b border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );

  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div className="p-3 md:p-4 md:pb-2 md:pt-2 bg-gray-50 rounded-lg shadow-sm overflow-x-auto pt-0 pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-1">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{title}</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-52 p-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-purple-400 
              transition-all duration-200 shadow-sm text-sm"
            disabled={loading}
          />
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-[6px] bg-gradient-to-r 
              from-purple-600 to-purple-700 text-white font-medium 
              rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 
              hover:shadow-lg transition-all duration-300"
              disabled={loading}
            >
              <Plus size={16} /> {createLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden" >
        <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide border-b border-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={`px-4 py-3 text-left select-none hover:bg-gray-200 transition-colors duration-200 ${
                    header.column.getCanSort() ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <span className="text-gray-500">
                      {{
                        asc: '↑',
                        desc: '↓',
                      }[header.column.getIsSorted()] ?? null}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="text-gray-700 text-sm">
          {
            loading ? (
            Array.from({ length: pageSize }).map((_, idx) => (
              <SkeletonRow key={idx} />
            ))
            ) :
            table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className="text-center py-6 text-gray-500 italic">
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`transition-colors duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-purple-50 ${row.getIsSelected() ? 'bg-purple-100' : ''}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 border-b border-gray-200 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )
          }
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1 p-1 bg-white border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-gray-600 text-sm">
            Showing {totalDataCount === 0 ? 0 : pageIndex * pageSize + 1} to{' '}
            {Math.min((pageIndex + 1) * pageSize, totalDataCount)} of {totalDataCount} entries
          </span>
          {table.getIsSomeRowsSelected() || table.getIsAllRowsSelected() ? (
            <span className="text-sm font-medium text-purple-600">
              {table.getSelectedRowModel().flatRows.length} row(s) selected.
            </span>
          ) : null}
        </div>


        <div className="flex flex-wrap items-center gap-3">
          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="p-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Go to page */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Go to:</span>
            <select
              value={selectedGoTo}
              onChange={handleGoToChange}
              className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            >
              {pageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-lg 
              bg-white hover:bg-purple-50 hover:text-purple-700 
              disabled:opacity-50 disabled:cursor-not-allowed 
              transition-all duration-200"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-lg 
              bg-white hover:bg-purple-50 hover:text-purple-700 
              disabled:opacity-50 disabled:cursor-not-allowed 
              transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-gray-700 text-sm px-2">{pageIndex + 1} of {table.getPageCount()}</span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectableDataTable;