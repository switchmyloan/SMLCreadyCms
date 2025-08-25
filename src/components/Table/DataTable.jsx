import React from 'react';
import { Plus } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

function DataTable({ columns, data, onCreate, createLabel = "Create", totalDataCount }) {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data, // Pass full dataset
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false, // Let react-table handle pagination
  });

  // Get the total number of filtered rows
  const totalFilteredRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="p-2">
      {/* Header with Search and Entries per Page */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          {/* Create button */}
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
            >
              <Plus size={16} />
              {createLabel}
            </button>
          )}
        </div>
      </div>
      <table className="min-w-full border border-gray-300 shadow-md rounded-lg overflow-hidden bg-white">
        <thead className="bg-gray-100 text-gray-800 text-sm font-semibold uppercase tracking-wide">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 border border-gray-300 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-200"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  <span className="ml-2 text-gray-600">
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted()] ?? null}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="text-gray-700 text-sm">
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              className={`border-t border-gray-300 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-gray-100`}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-0 border border-gray-300">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Footer with Pagination */}

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-3 bg-white border border-gray-300 rounded-b-lg shadow-sm">
        {/* Left: Showing X to Y of Z entries */}
        <span className="text-sm text-gray-600 mb-2 sm:mb-0">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalDataCount)} of {totalDataCount}{' '}
          entries
        </span>

        {/* Right: Pagination Controls */}
        <div className="flex items-center gap-4">
          {/* Entries per page dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => {
                setPagination({
                  ...pagination,
                  pageSize: Number(e.target.value),
                  pageIndex: 0, // Reset to first page
                });
              }}
              className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              {pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;