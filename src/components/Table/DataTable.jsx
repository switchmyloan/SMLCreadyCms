// import React, { useEffect, useRef } from 'react';
// import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
// import {
//   useReactTable,
//   getCoreRowModel,
//   getPaginationRowModel,
//   getFilteredRowModel,
//   getSortedRowModel,
//   flexRender,
// } from '@tanstack/react-table';

// function DataTable({ columns, data, onCreate, createLabel = 'Create', totalDataCount, onPageChange }) {
//   const [sorting, setSorting] = React.useState([]);
//   const [globalFilter, setGlobalFilter] = React.useState('');
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   const [selectedGoTo, setSelectedGoTo] = React.useState(pagination.pageIndex + 1);

//   // Store previous pagination to prevent redundant onPageChange calls
//   const prevPaginationRef = useRef(pagination);

//   const table = useReactTable({
//     data, // Server-fetched data for the current page
//     columns,
//     state: {
//       sorting,
//       globalFilter,
//       pagination,
//     },
//     onSortingChange: setSorting,
//     onGlobalFilterChange: setGlobalFilter,
//     onPaginationChange: setPagination,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     manualPagination: true, // Server-side pagination
//     pageCount: Math.ceil(totalDataCount / pagination.pageSize), // Total pages from server
//   });

//   // Sync table state with pagination and trigger onPageChange
//   useEffect(() => {
//     // Only call onPageChange if pagination has changed
//     if (
//       pagination.pageIndex !== prevPaginationRef.current.pageIndex ||
//       pagination.pageSize !== prevPaginationRef.current.pageSize
//     ) {
//       table.setPageIndex(pagination.pageIndex);
//       onPageChange(pagination);
//       prevPaginationRef.current = pagination; // Update ref after calling onPageChange
//     }
//   }, [pagination, onPageChange, table]);

//   // Update selectedGoTo when pageIndex changes
//   useEffect(() => {
//     setSelectedGoTo(pagination.pageIndex + 1);
//   }, [pagination.pageIndex]);

//   // Handle "Go To" page selection
//   const handleGoToChange = (e) => {
//     const page = Number(e.target.value);
//     setSelectedGoTo(page);
//     setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
//   };

//   // Generate page options for "Go To" dropdown
//   const pageOptions = Array.from(
//     { length: Math.ceil(totalDataCount / pagination.pageSize) },
//     (_, index) => ({
//       value: index + 1,
//       label: `Page ${index + 1}`,
//     })
//   );

//   return (
//     <div className="p-2">
//       {/* Header with Search and Entries per Page */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
//         </div>
//         <div className="flex items-center gap-4">
//           <input
//             type="text"
//             placeholder="Search..."
//             value={globalFilter ?? ''}
//             onChange={(e) => setGlobalFilter(e.target.value)}
//             className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
//           />
//           {onCreate && (
//             <button
//               onClick={onCreate}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
//             >
//               <Plus size={16} />
//               {createLabel}
//             </button>
//           )}
//         </div>
//       </div>
//       <table className="min-w-full border border-gray-300 shadow-md rounded-lg overflow-hidden bg-white">
//         <thead className="bg-gray-100 text-gray-800 text-sm font-semibold uppercase tracking-wide">
//           {table.getHeaderGroups().map((headerGroup) => (
//             <tr key={headerGroup.id}>
//               {headerGroup.headers.map((header) => (
//                 <th
//                   key={header.id}
//                   className="px-4 py-3 border border-gray-300 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-200"
//                   onClick={header.column.getToggleSortingHandler()}
//                 >
//                   {flexRender(header.column.columnDef.header, header.getContext())}
//                   <span className="ml-2 text-gray-600">
//                     {{
//                       asc: ' ↑',
//                       desc: ' ↓',
//                     }[header.column.getIsSorted()] ?? null}
//                   </span>
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>
//         <tbody className="text-gray-700 text-sm">
//           {table.getRowModel().rows.length === 0 ? (
//             <tr>
//               <td
//                 colSpan={table.getVisibleFlatColumns().length}
//                 className="text-center py-6 text-gray-600"
//               >
//                 No data available
//               </td>
//             </tr>
//           ) : (
//             table.getRowModel().rows.map((row, index) => (
//               <tr
//                 key={row.id}
//                 className={`border-t border-gray-300 transition-colors duration-200 ${
//                   index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
//                 } hover:bg-gray-100`}
//               >
//                 {row.getVisibleCells().map((cell) => (
//                   <td key={cell.id} className="px-3 py-0 border border-gray-300">
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </td>
//                 ))}
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//       {/* Footer with Pagination */}
//       <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-4 py-3 bg-white border border-gray-300 rounded-b-lg shadow-sm">
//         <span className="text-sm text-gray-600 mb-2 sm:mb-0">
//           Showing {totalDataCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1} to{' '}
//           {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalDataCount)} of{' '}
//           {totalDataCount} entries
//         </span>
//         <div className="flex items-center gap-4">
//           {/* Rows per page dropdown */}
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600">Rows per page:</span>
//             <select
//               value={pagination.pageSize}
//               onChange={(e) => {
//                 setPagination({
//                   ...pagination,
//                   pageSize: Number(e.target.value),
//                   pageIndex: 0, // Reset to first page
//                 });
//               }}
//               className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
//               aria-label="Select rows per page"
//             >
//               <option value={10}>10</option>
//               <option value={20}>20</option>
//               <option value={50}>50</option>
//             </select>
//           </div>
//           {/* Go To page dropdown */}
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600">Go to:</span>
//             <select
//               value={selectedGoTo}
//               onChange={handleGoToChange}
//               className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-32"
//               aria-label="Go to page"
//             >
//               {pageOptions.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//           {/* Pagination buttons */}
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
//               disabled={!table.getCanPreviousPage()}
//               className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//               aria-label="First page"
//             >
//               <ChevronsLeft size={16} />
//             </button>
//             <button
//               onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
//               disabled={!table.getCanPreviousPage()}
//               className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//               aria-label="Previous page"
//             >
//               <ChevronLeft size={16} />
//             </button>
//             <span className="text-sm text-gray-700">
//               {pagination.pageIndex + 1} of {table.getPageCount()}
//             </span>
//             <button
//               onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
//               disabled={!table.getCanNextPage()}
//               className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//               aria-label="Next page"
//             >
//               <ChevronRight size={16} />
//             </button>
//             <button
//               onClick={() =>
//                 setPagination((prev) => ({ ...prev, pageIndex: table.getPageCount() - 1 }))
//               }
//               disabled={!table.getCanNextPage()}
//               className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//               aria-label="Last page"
//             >
//               <ChevronsRight size={16} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DataTable;


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

function DataTable({ columns, data, onCreate, createLabel = 'Create', totalDataCount, onPageChange }) {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [selectedGoTo, setSelectedGoTo] = React.useState(pagination.pageIndex + 1);
  const prevPaginationRef = useRef(pagination);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalDataCount / pagination.pageSize),
  });

  useEffect(() => {
    if (
      pagination.pageIndex !== prevPaginationRef.current.pageIndex ||
      pagination.pageSize !== prevPaginationRef.current.pageSize
    ) {
      table.setPageIndex(pagination.pageIndex);
      onPageChange(pagination);
      prevPaginationRef.current = pagination;
    }
  }, [pagination, onPageChange, table]);

  useEffect(() => setSelectedGoTo(pagination.pageIndex + 1), [pagination.pageIndex]);

  const handleGoToChange = (e) => {
    const page = Number(e.target.value);
    setSelectedGoTo(page);
    setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
  };

  const pageOptions = Array.from(
    { length: Math.ceil(totalDataCount / pagination.pageSize) },
    (_, index) => ({ value: index + 1, label: `Page ${index + 1}` })
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 rounded-lg shadow-sm overflow-x-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Blogs</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-64 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
          />
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
            >
              <Plus size={16} />
              {createLabel}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <thead className="bg-gray-100 text-gray-700 text-sm font-medium uppercase tracking-wide">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="px-4 py-2 text-left cursor-pointer select-none hover:bg-gray-200 transition-colors duration-200"
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
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={table.getVisibleFlatColumns().length} className="text-center py-6 text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                className={`transition-colors duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-0 border-b border-gray-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
        <span className="text-gray-600 text-sm">
          Showing {totalDataCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalDataCount)} of {totalDataCount} entries
        </span>

        <div className="flex flex-wrap items-center gap-3">
          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">Rows per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => setPagination({ ...pagination, pageSize: Number(e.target.value), pageIndex: 0 })}
              className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
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
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-gray-700 text-sm px-2">{pagination.pageIndex + 1} of {table.getPageCount()}</span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={!table.getCanNextPage()}
              className="flex items-center justify-center p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: table.getPageCount() - 1 }))}
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

export default DataTable;
