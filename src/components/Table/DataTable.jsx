// import React from "react";
// import {
//   useReactTable,
//   getCoreRowModel,
//   getPaginationRowModel,
//   getFilteredRowModel,
//   getSortedRowModel,
//   flexRender,
// } from "@tanstack/react-table";

// function DataTable({ columns, data }) {
//   const [sorting, setSorting] = React.useState([]);
//   const [globalFilter, setGlobalFilter] = React.useState("");
//   const [pagination, setPagination] = React.useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });

//   // Apply sorting to the full data and then slice for the current page
//   const sortedData = React.useMemo(() => {
//     let result = [...data];
//     if (sorting.length > 0) {
//       result.sort((a, b) => {
//         for (let i = 0; i < sorting.length; i++) {
//           const { id, desc } = sorting[i];
//           const valueA = a[id];
//           const valueB = b[id];
//           if (valueA < valueB) return desc ? 1 : -1;
//           if (valueA > valueB) return desc ? -1 : 1;
//         }
//         return 0;
//       });
//     }
//     const startIndex = pagination.pageIndex * pagination.pageSize;
//     const endIndex = startIndex + pagination.pageSize;
//     return result.slice(startIndex, endIndex);
//   }, [data, sorting, pagination.pageIndex, pagination.pageSize]);

//   const table = useReactTable({
//     data: sortedData, // Use sorted and paginated data
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
//     getPaginationRowModel: getPaginationRowModel(),
//     manualPagination: true, // Disable internal pagination to handle it manually
//   });

//   return (
//     <div className="p-4">
//       {/* Header with Search and Entries per Page */}
//       <div className="flex justify-between mb-4 items-center">
//         <input
//           type="text"
//           placeholder="Search..."
//           value={globalFilter ?? ""}
//           onChange={(e) => setGlobalFilter(e.target.value)}
//           className="p-2 border rounded w-1/3"
//         />
//         <select
//           value={pagination.pageSize}
//           onChange={(e) => {
//             setPagination({
//               ...pagination,
//               pageSize: Number(e.target.value),
//               pageIndex: 0, // Reset to first page when changing page size
//             });
//           }}
//           className="p-2 border rounded"
//         >
//           <option value={10}>10</option>
//           <option value={20}>20</option>
//           <option value={50}>50</option>
//         </select>
//         <span>entries per page</span>
//       </div>

//       <table className="min-w-full border border-gray-200">
//         <thead className="bg-gray-100">
//           {table.getHeaderGroups().map((headerGroup) => (
//             <tr key={headerGroup.id}>
//               {headerGroup.headers.map((header) => (
//                 <th
//                   key={header.id}
//                   className="px-4 py-2 border cursor-pointer"
//                   onClick={header.column.getToggleSortingHandler()}
//                 >
//                   {flexRender(header.column.columnDef.header, header.getContext())}
//                   {{
//                     asc: " 🔼",
//                     desc: " 🔽",
//                   }[header.column.getIsSorted()] ?? null}
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>
//         <tbody>
//           {table.getRowModel().rows.map((row) => (
//             <tr key={row.id} className="hover:bg-gray-50">
//               {row.getVisibleCells().map((cell) => (
//                 <td key={cell.id} className="px-4 py-2 border">
//                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Footer with Pagination */}
//       <div className="flex justify-between mt-4 items-center">
//         <span>
//           Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
//           {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} of {data.length} entries
//         </span>
//         <div className="flex items-center space-x-2">
//           <button
//             onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
//             disabled={pagination.pageIndex === 0}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <span className="flex space-x-1">
//             {Array.from({ length: Math.ceil(data.length / pagination.pageSize) }, (_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setPagination((prev) => ({ ...prev, pageIndex: i }))}
//                 className={`px-3 py-1 border rounded ${pagination.pageIndex === i ? 'bg-gray-300' : ''}`}
//               >
//                 {i + 1}
//               </button>
//             ))}
//           </span>
//           <button
//             onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
//             disabled={pagination.pageIndex >= Math.ceil(data.length / pagination.pageSize) - 1}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DataTable;


import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

function DataTable({ columns, data, onCreate, createLabel = "Create" }) {
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
    <div className="p-4">
      {/* Header with Search and Entries per Page */}
      <div className="flex justify-between mb-4 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="p-2 border rounded w-1/3"
        />
        
     
        {/* ✅ Create button */}
        {onCreate && (
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {createLabel}
          </button>
        )}
         </div>

      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 border cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted()] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 border">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer with Pagination */}
      <div className="flex justify-between mt-4 items-center">
        <span>
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            totalFilteredRows // Use filtered row count
          )}{' '}
          of {totalFilteredRows} entries
        </span>
        <div>
        <select
          value={pagination.pageSize}
          onChange={(e) => {
            setPagination({
              ...pagination,
              pageSize: Number(e.target.value),
              pageIndex: 0, // Reset to first page
            });
          }}
          className="p-2 border rounded"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span>entries per page</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="flex space-x-1">
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <button
                key={i}
                onClick={() => setPagination((prev) => ({ ...prev, pageIndex: i }))}
                className={`px-3 py-1 border rounded ${
                  pagination.pageIndex === i ? 'bg-gray-300' : ''
                }`}
              >
                {i + 1}
              </button>
            ))}
          </span>
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;