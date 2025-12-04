// import React, { useEffect, useRef } from 'react';
// import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
// import {
//   useReactTable,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getSortedRowModel,
//   flexRender,
// } from '@tanstack/react-table';

// const areArraysDeepEqual = (arr1, arr2) => {
//   if (arr1.length !== arr2.length) return false;
//   return JSON.stringify(arr1) === JSON.stringify(arr2);
// };


// function SelectableDataTable({
//   columns,
//   data,
//   onCreate,
//   createLabel = 'Create',
//   totalDataCount,
//   onPageChange,
//   title = "Page",
//   loading = false,
//   onRowSelect,
//   rowSelection,
//   setRowSelection,
// }) {

//   const [sorting, setSorting] = React.useState([]);
//   const [globalFilter, setGlobalFilter] = React.useState('');
//   const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
//   const [selectedGoTo, setSelectedGoTo] = React.useState(pagination.pageIndex + 1);
//   const prevPaginationRef = useRef(pagination);

//   // New Ref to store the previously sent selected users data
//   const prevSelectedRowsDataRef = useRef([]);

//   // --- 1. Define the Select Column ---
//   const selectColumn = {
//     id: 'select',
//     header: ({ table }) => (
//       <input
//         type="checkbox"
//         checked={table.getIsAllPageRowsSelected()}
//         onChange={table.getToggleAllPageRowsSelectedHandler()}
//         className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
//       />
//     ),
//     cell: ({ row }) => (
//       <input
//         type="checkbox"
//         checked={row.getIsSelected()}
//         onChange={row.getToggleSelectedHandler()}
//         className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
//       />
//     ),
//     size: 40,
//     enableSorting: false,
//     enableHiding: false,
//   };

//   // Combine the select column with the provided columns
//   const allColumns = React.useMemo(() => [selectColumn, ...columns], [columns]);


//   const table = useReactTable({
//     data,
//     columns: allColumns,
//     state: {
//       sorting,
//       globalFilter,
//       pagination,
//       rowSelection: rowSelection
//     },
//     onSortingChange: setSorting,
//     onGlobalFilterChange: setGlobalFilter,
//     onPaginationChange: setPagination,
//     onRowSelectionChange: setRowSelection,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     enableRowSelection: true,
//     manualPagination: true,
//     pageCount: Math.ceil(totalDataCount / pagination.pageSize),
//   });

//   useEffect(() => {
//     if (onRowSelect) {
//       const selectedRowsData = table.getSelectedRowModel().flatRows.map(row => row.original);

//       if (!areArraysDeepEqual(selectedRowsData, prevSelectedRowsDataRef.current)) {
//         onRowSelect(selectedRowsData);
//         prevSelectedRowsDataRef.current = selectedRowsData;
//       }
//     }
//   }, [rowSelection, onRowSelect, table]);

//   useEffect(() => {
//     const currentPagination = table.getState().pagination;
//     if (
//       currentPagination.pageIndex !== prevPaginationRef.current.pageIndex ||
//       currentPagination.pageSize !== prevPaginationRef.current.pageSize
//     ) {
//       onPageChange(currentPagination);
//       prevPaginationRef.current = currentPagination;
//     }
//     setSelectedGoTo(currentPagination.pageIndex + 1);
//   }, [table.getState().pagination.pageIndex, table.getState().pagination.pageSize, onPageChange, table]);


//   const handleGoToChange = (e) => {
//     const page = Number(e.target.value);
//     const maxPage = table.getPageCount();

//     if (page >= 1 && page <= maxPage) {
//       setSelectedGoTo(page);
//       table.setPageIndex(page - 1);
//     } else {
//       setSelectedGoTo(table.getState().pagination.pageIndex + 1);
//     }
//   };

//   const pageOptions = Array.from({ length: table.getPageCount() }, (_, index) => ({
//     value: index + 1,
//     label: `Page ${index + 1}`,
//   }));

//   const SkeletonRow = () => (
//     <tr className="animate-pulse">
//       {allColumns.map((_, index) => (
//         <td key={index} className="px-4 py-3 border-b border-gray-200">
//           <div className="h-4 bg-gray-200 rounded w-full"></div>
//         </td>
//       ))}
//     </tr>
//   );

//   // Sync rowSelection with table rows when data changes
//   // useEffect(() => {
//   //   if (!rowSelection) return;

//   //   const updatedSel = {};
//   //   table.getRowModel().rows.forEach(row => {
//   //     const id = row.original.id;
//   //     if (rowSelection[id]) updatedSel[id] = true;
//   //   });

//   //   setRowSelection(updatedSel);
//   // }, [data]);



//   const { pageIndex, pageSize } = table.getState().pagination;

//   return (
//     <div className="p-3 md:p-4 md:pb-2 md:pt-2 bg-gray-50 rounded-lg shadow-sm overflow-x-auto pt-0 pb-0">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-1">
//         <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{title}</h1>
//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
//           <input
//             type="text"
//             placeholder="Search..."
//             value={globalFilter ?? ''}
//             onChange={(e) => setGlobalFilter(e.target.value)}
//             className="w-full sm:w-52 p-2 border border-gray-300 rounded-lg 
//               focus:outline-none focus:ring-2 focus:ring-purple-400 
//               transition-all duration-200 shadow-sm text-sm"
//             disabled={loading}
//           />
//           {onCreate && (
//             <button
//               onClick={onCreate}
//               className="flex items-center gap-2 px-4 py-[6px] bg-gradient-to-r 
//               from-purple-600 to-purple-700 text-white font-medium 
//               rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 
//               hover:shadow-lg transition-all duration-300"
//               disabled={loading}
//             >
//               <Plus size={16} /> {createLabel}
//             </button>
//           )}
//         </div>
//       </div>

//       <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden" >
//         <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide border-b border-gray-200">
//           {table.getHeaderGroups().map((headerGroup) => (
//             <tr key={headerGroup.id}>
//               {headerGroup.headers.map((header) => (
//                 <th
//                   key={header.id}
//                   onClick={header.column.getToggleSortingHandler()}
//                   className={`px-4 py-3 text-left select-none hover:bg-gray-200 transition-colors duration-200 ${header.column.getCanSort() ? 'cursor-pointer' : ''
//                     }`}
//                 >
//                   <div className="flex items-center gap-1">
//                     {flexRender(header.column.columnDef.header, header.getContext())}
//                     <span className="text-gray-500">
//                       {{
//                         asc: '↑',
//                         desc: '↓',
//                       }[header.column.getIsSorted()] ?? null}
//                     </span>
//                   </div>
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>
//         <tbody className="text-gray-700 text-sm">
//           {
//             loading ? (
//               Array.from({ length: pageSize }).map((_, idx) => (
//                 <SkeletonRow key={idx} />
//               ))
//             ) :
//               table.getRowModel().rows.length === 0 ? (
//                 <tr>
//                   <td colSpan={table.getVisibleFlatColumns().length} className="text-center py-6 text-gray-500 italic">
//                     No data available
//                   </td>
//                 </tr>
//               ) : (
//                 table.getRowModel().rows.map((row, idx) => (
//                   <tr
//                     key={row.id}
//                     className={`transition-colors duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
//                       } hover:bg-purple-50 ${row.getIsSelected() ? 'bg-purple-100' : ''}`}
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <td key={cell.id} className="px-4 py-3 border-b border-gray-200 text-sm">
//                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               )
//           }
//         </tbody>
//       </table>

//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1 p-1 bg-white border-gray-200 rounded-lg shadow-sm">
//         <div className="flex flex-col gap-1">
//           <span className="text-gray-600 text-sm">
//             Showing {totalDataCount === 0 ? 0 : pageIndex * pageSize + 1} to{' '}
//             {Math.min((pageIndex + 1) * pageSize, totalDataCount)} of {totalDataCount} entries
//           </span>
//           {table.getIsSomeRowsSelected() || table.getIsAllRowsSelected() ? (
//             <span className="text-sm font-medium text-purple-600">
//               {table.getSelectedRowModel().flatRows.length} row(s) selected.
//             </span>
//           ) : null}
//         </div>


//         <div className="flex flex-wrap items-center gap-3">
//           <div className="flex items-center gap-2">
//             <span className="text-gray-600 text-sm">Rows per page:</span>
//             <select
//               value={pageSize}
//               onChange={(e) => table.setPageSize(Number(e.target.value))}
//               className="p-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
//             >
//               {[10, 20, 50, 100].map(size => (
//                 <option key={size} value={size}>{size}</option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className="text-gray-600 text-sm">Go to:</span>
//             <select
//               value={selectedGoTo}
//               onChange={handleGoToChange}
//               className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
//             >
//               {pageOptions.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-center gap-1">
//             <button
//               onClick={() => table.setPageIndex(0)}
//               disabled={!table.getCanPreviousPage()}
//               className="flex items-center justify-center p-2 border border-gray-300 rounded-lg 
//               bg-white hover:bg-purple-50 hover:text-purple-700 
//               disabled:opacity-50 disabled:cursor-not-allowed 
//               transition-all duration-200"
//             >
//               <ChevronsLeft size={16} />
//             </button>
//             <button
//               onClick={() => table.previousPage()}
//               disabled={!table.getCanPreviousPage()}
//               className="flex items-center justify-center p-2 border border-gray-300 rounded-lg 
//               bg-white hover:bg-purple-50 hover:text-purple-700 
//               disabled:opacity-50 disabled:cursor-not-allowed 
//               transition-all duration-200"
//             >
//               <ChevronLeft size={16} />
//             </button>
//             <span className="text-gray-700 text-sm px-2">{pageIndex + 1} of {table.getPageCount()}</span>
//             <button
//               onClick={() => table.nextPage()}
//               disabled={!table.getCanNextPage()}
//               className="flex items-center justify-center p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//             >
//               <ChevronRight size={16} />
//             </button>
//             <button
//               onClick={() => table.setPageIndex(table.getPageCount() - 1)}
//               disabled={!table.getCanNextPage()}
//               className="flex items-center justify-center p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//             >
//               <ChevronsRight size={16} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SelectableDataTable;



import React, { useEffect, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';

// Helper function to compare arrays
const areArraysDeepEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return JSON.stringify(arr1) === JSON.stringify(arr2);
};


function SelectableDataTable({
    columns,
    data,
    onCreate,
    createLabel = 'Create',
    totalDataCount,
    onPageChange,
    title = "Page",
    loading = false,
    onRowSelect,
    rowSelection,
    setRowSelection,
}) {

    // States are initialized here (simplified from the original component)
    const [sorting, setSorting] = React.useState([]);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
    const prevPaginationRef = useRef(pagination);
    const prevSelectedRowsDataRef = useRef([]);
    const pageCount = Math.ceil(totalDataCount / pagination.pageSize);

    // --- 1. Define the Select Column ---
    const selectColumn = {
        id: 'select',
        header: ({ table }) => (
            <input
                type="checkbox"
                checked={table.getIsAllPageRowsSelected()}
                onChange={table.getToggleAllPageRowsSelectedHandler()}
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                aria-label="Select all current page rows"
            />
        ),
        cell: ({ row }) => (
            <input
                type="checkbox"
                checked={rowSelection[String(row.original.id)] || false} // Use rowSelection prop directly
                onChange={row.getToggleSelectedHandler()}
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                aria-label={`Select row ${row.original.id}`}
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
            rowSelection: rowSelection // React-Table uses this prop for selection state
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onRowSelectionChange: setRowSelection, // This handles user interaction with checkboxes
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection: true,
        manualPagination: true,
        pageCount: pageCount,
        getRowId: row => String(row.id), // IMPORTANT: Ensure row IDs are strings for consistency with rowSelection object keys
    });

    // Effect to notify parent component about selection changes
    useEffect(() => {
        if (onRowSelect) {
            // Get data for all selected rows across all pages (from the rowSelection state keys)
            // Note: In a manual pagination setup, getSelectedRowModel().flatRows only gives current page selected data.
            // We use the full rowSelection object keys to filter the original data (if all data was available) 
            // but since 'data' is only the current page, we rely on the parent component (GroupCreate) 
            // to manage the full list in `selectedUsers`. We pass the current page's selected rows back.
            const selectedRowsData = table.getSelectedRowModel().flatRows.map(row => row.original);

            // Trigger parent selection handler
            if (!areArraysDeepEqual(selectedRowsData, prevSelectedRowsDataRef.current)) {
                onRowSelect(selectedRowsData);
                prevSelectedRowsDataRef.current = selectedRowsData;
            }
        }
    }, [rowSelection, onRowSelect, table, data]); // Added 'data' to re-evaluate selection when new page loads


    // Effect to notify parent component about pagination changes
    useEffect(() => {
        const currentPagination = table.getState().pagination;
        if (
            currentPagination.pageIndex !== prevPaginationRef.current.pageIndex ||
            currentPagination.pageSize !== prevPaginationRef.current.pageSize
        ) {
            onPageChange(currentPagination);
            prevPaginationRef.current = currentPagination;
        }
    }, [table.getState().pagination.pageIndex, table.getState().pagination.pageSize, onPageChange, table]);


    const handleGoToChange = (e) => {
        const page = Number(e.target.value);
        const maxPage = table.getPageCount();

        if (page >= 1 && page <= maxPage) {
            table.setPageIndex(page - 1);
        }
    };

    const pageOptions = Array.from({ length: table.getPageCount() }, (_, index) => ({
        value: index + 1,
        label: `Page ${index + 1}`,
    }));

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-1">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{title}</h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search... (Khojien...)"
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

            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden" >
                <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className={`px-4 py-3 text-left select-none hover:bg-gray-200 transition-colors duration-200 ${header.column.getCanSort() ? 'cursor-pointer' : ''
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
                                        No data available (Koi data uplabdh nahi)
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

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1 p-1 bg-white border-gray-200 rounded-lg shadow-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-gray-600 text-sm">
                        Showing {totalDataCount === 0 ? 0 : pageIndex * pageSize + 1} to{' '}
                        {Math.min((pageIndex + 1) * pageSize, totalDataCount)} of {totalDataCount} entries
                    </span>
                    {table.getIsSomeRowsSelected() || table.getIsAllRowsSelected() ? (
                        <span className="text-sm font-medium text-purple-600">
                            {table.getSelectedRowModel().flatRows.length} row(s) selected. (Rows chayanit)
                        </span>
                    ) : null}
                </div>


                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Rows per page: (Prati page panktiyan)</span>
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

                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Go to: (Yahan jaaen)</span>
                        <select
                            value={pageIndex + 1}
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

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="flex items-center justify-center p-2 border border-gray-300 rounded-lg 
              bg-white hover:bg-purple-50 hover:text-purple-700 
              disabled:opacity-50 disabled:cursor-not-allowed 
              transition-all duration-200"
                            aria-label="First Page"
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
                            aria-label="Previous Page"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-gray-700 text-sm px-2">{pageIndex + 1} of {table.getPageCount()}</span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="flex items-center justify-center p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            aria-label="Next Page"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="flex items-center justify-center p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            aria-label="Last Page"
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