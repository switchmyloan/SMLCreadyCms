import React, { useEffect, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';

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
    pagination,
    setPagination,
    title = "Page",
    loading = false,
    onRowSelect,
    rowSelection,
    setRowSelection,
    filtersComponent
}) {

    const [sorting, setSorting] = React.useState([]);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const prevSelectedRowsDataRef = React.useRef([]);

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
                checked={rowSelection[String(row.original.id)] || false}
                onChange={row.getToggleSelectedHandler()}
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
        ),
        size: 40,
        enableSorting: false,
        enableHiding: false,
    };

    const allColumns = useMemo(() => [selectColumn, ...columns], [columns]);

    const table = useReactTable({
        data,
        columns: allColumns,
        state: {
            sorting,
            globalFilter,
            pagination,
            rowSelection
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection: true,
        manualPagination: false, // frontend pagination
        pageCount: Math.ceil(data.length / pagination.pageSize),
        getRowId: row => String(row.id),
    });

    // Row selection callback
    useEffect(() => {
        if (onRowSelect) {
            const selectedRowsData = table.getSelectedRowModel().flatRows.map(r => r.original);
            if (!areArraysDeepEqual(selectedRowsData, prevSelectedRowsDataRef.current)) {
                onRowSelect(selectedRowsData);
                prevSelectedRowsDataRef.current = selectedRowsData;
            }
        }
    }, [rowSelection, onRowSelect, table, data]);

    const { pageIndex, pageSize } = pagination;
    const paginatedRows = table.getRowModel().rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    const pageOptions = Array.from({ length: Math.ceil(data.length / pageSize) }, (_, i) => i + 1);

    const handleGoToChange = (e) => {
        const page = Number(e.target.value);
        if (page >= 1 && page <= pageOptions.length) {
            setPagination({ ...pagination, pageIndex: page - 1 });
        }
    };

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            {allColumns.map((_, i) => (
                <td key={i} className="px-4 py-3 border-b border-gray-200">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
            ))}
        </tr>
    );

    return (
        <div className="p-3 md:p-4 bg-gray-50 rounded-lg shadow-sm overflow-x-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-1">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{title}</h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full sm:w-52 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 shadow-sm text-sm"
                        disabled={loading}
                    />
                    {onCreate && (
                        <button
                            onClick={onCreate}
                            className="flex items-center gap-2 px-4 py-[6px] bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transition-all duration-300"
                            disabled={loading}
                        >
                            <Plus size={16} /> {createLabel}
                        </button>
                    )}
                </div>
            </div>

            {filtersComponent && <div className="mb-2">{filtersComponent}</div>}

            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide border-b border-gray-200">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className={`px-4 py-3 text-left select-none hover:bg-gray-200 ${header.column.getCanSort() ? 'cursor-pointer' : ''}`}
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
                    {loading ? (
                        Array.from({ length: pageSize }).map((_, idx) => <SkeletonRow key={idx} />)
                    ) : paginatedRows.length === 0 ? (
                        <tr>
                            <td colSpan={table.getVisibleFlatColumns().length} className="text-center py-6 text-gray-500 italic">
                                No data available
                            </td>
                        </tr>
                    ) : (
                        paginatedRows.map((row, idx) => (
                            <tr
                                key={row.id}
                                className={`transition-colors duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50 ${row.getIsSelected() ? 'bg-purple-100' : ''}`}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-4 py-3 border-b border-gray-200 text-sm">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-2 p-1 bg-white border-gray-200 rounded-lg shadow-sm">
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
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={e => setPagination({ ...pagination, pageSize: Number(e.target.value), pageIndex: 0 })}
                            className="p-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                        >
                            {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Go to: </span>
                        <select
                            value={pageIndex + 1}
                            onChange={handleGoToChange}
                            className="p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                        >
                            {pageOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-1">
                        <button onClick={() => setPagination({ ...pagination, pageIndex: 0 })} disabled={pageIndex === 0} className="p-2 border rounded">
                            <ChevronsLeft size={16} />
                        </button>
                        <button onClick={() => setPagination({ ...pagination, pageIndex: pageIndex - 1 })} disabled={pageIndex === 0} className="p-2 border rounded">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-gray-700 text-sm px-2">{pageIndex + 1} of {pageOptions.length}</span>
                        <button onClick={() => setPagination({ ...pagination, pageIndex: pageIndex + 1 })} disabled={pageIndex === pageOptions.length - 1} className="p-2 border rounded">
                            <ChevronRight size={16} />
                        </button>
                        <button onClick={() => setPagination({ ...pagination, pageIndex: pageOptions.length - 1 })} disabled={pageIndex === pageOptions.length - 1} className="p-2 border rounded">
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SelectableDataTable;
