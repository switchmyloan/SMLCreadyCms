import React, { useEffect, useRef, useState } from "react";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    RefreshCcw,
    Download,
    Calendar,
} from "lucide-react";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import DebouncedInput from "./DebouncedInput";

function FrontendTable({
    columns,
    data,
    onCreate,
    createLabel = "Create",
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
    onFilterChange,
    dynamicFilters,
    activeIncomeFilter,
    incomeRanges,
    onFilterByIncome,
}) {
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [selectedGoTo, setSelectedGoTo] = useState(pagination.pageIndex + 1);
    const [showDateRangeInputs, setShowDateRangeInputs] = useState(false);
    const dropdownRef = useRef(null);
    const [globalFilter, setGlobalFilter] = React.useState('');

    const formatDateForInput = (date) => {
        if (!date) return "";
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().split("T")[0];
    };

    const [dateRangeFilter, setDateRangeFilter] = useState({
        startDate: formatDateForInput(activeDateRange.startDate),
        endDate: formatDateForInput(activeDateRange.endDate),
    });

    useEffect(() => {
        setDateRangeFilter({
            startDate: formatDateForInput(activeDateRange.startDate),
            endDate: formatDateForInput(activeDateRange.endDate),
        });
    }, [activeDateRange.startDate, activeDateRange.endDate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDateRangeInputs(false);
            }
        };
        if (showDateRangeInputs) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDateRangeInputs]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        pageCount: Math.ceil(totalDataCount / pagination.pageSize),
    });

    useEffect(() => {
        onPageChange && onPageChange(pagination);
    }, [pagination, onPageChange]);

    useEffect(() => setSelectedGoTo(pagination.pageIndex + 1), [pagination.pageIndex]);

    const handleGoToChange = (e) => {
        const page = Number(e.target.value);
        setSelectedGoTo(page);
        setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
    };

    const handleDateRangeApply = () => {
        const { startDate, endDate } = dateRangeFilter;
        if (!startDate || !endDate) return alert("Please select both start and end date");
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        if (start > end) return alert("Start date cannot be after end date");
        if (end > today) return alert("End date cannot be in the future");

        onFilterByRange && onFilterByRange({ startDate, endDate });
        setShowDateRangeInputs(false);
    };

    const formatDateDisplay = (date) => (date ? new Date(date).toLocaleDateString() : "N/A");
    const dateRangeDisplay =
        activeDateRange.startDate && activeDateRange.endDate
            ? `${formatDateDisplay(activeDateRange.startDate)} - ${formatDateDisplay(activeDateRange.endDate)}`
            : "Filter";

    const pageOptions = Array.from({ length: Math.ceil(totalDataCount / table.getState().pagination.pageSize) }, (_, index) => ({
        value: index + 1,
        label: `Page ${index + 1}`,
    }));

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            {columns.map((_, index) => (
                <td key={index} className="px-3 py-4 border-b border-gray-200">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
            ))}
        </tr>
    );

   const handleSearch = (value) => {
    setGlobalFilter(value); // This updates the UI input
    // Reset pagination to first page when searching
    setPagination(prev => ({ ...prev, pageIndex: 0 })); 
    // Send the value to the parent
    if (onSearch) {
        onSearch(value);
    }
};
    return (
        <div className="p-3 md:p-4 md:pb-2 md:pt-2 bg-gray-50 rounded-lg shadow-sm pt-0 pb-0">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-1">
                <h1 className="text-lg md:text-lg font-semibold text-gray-800">{title}</h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <span className="text-gray-600 text-sm">{totalDataCount} entries</span>

                    {/* Income Filter */}
                    {incomeRanges?.length > 0 && (
                        <select
                            onChange={(e) => onFilterByIncome(e.target.value)}
                            value={activeIncomeFilter || ""}
                            className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                        >
                            {incomeRanges.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Dynamic Filters */}
                    {dynamicFilters?.map((filter) => (
                        <select
                            key={filter.key}
                            onChange={(e) => filter.onChange(e.target.value)}
                            value={filter.activeValue}
                            className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                        >
                            <option value="">{filter.label || "Select Filter"}</option>
                            {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ))}

                    {/* Status Filter */}
                    {onFilterChange && (
                        <select
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="p-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                        >
                            <option value="">All Status</option>
                            <option value="success">✅ Success</option>
                            <option value="Lead has been rejected.">❌ Rejected</option>
                            <option value="duplicate user (dedupe)">🔁 Duplicate</option>
                            <option value="invalid data to get offer for lead">⚠️ Invalid Data</option>
                        </select>
                    )}

                    {/* Date Range Filter */}
                    {onFilterByRange && (
                        <div className="relative inline-block" ref={dropdownRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDateRangeInputs(!showDateRangeInputs);
                                }}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border transition ${activeDateRange.startDate
                                    ? "bg-purple-600 text-white border-purple-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400"
                                    }`}
                            >
                                <Calendar size={14} />
                                {dateRangeDisplay}
                            </button>

                            {showDateRangeInputs && (
                                <div className="absolute right-0 mt-2 z-20 p-3 flex flex-col gap-2 bg-white border border-gray-300 rounded-lg shadow-lg w-64">
                                    <label className="text-xs font-medium text-gray-600">Start Date</label>
                                    <input
                                        type="date"
                                        value={dateRangeFilter.startDate}
                                        onChange={(e) => setDateRangeFilter((prev) => ({ ...prev, startDate: e.target.value }))}
                                        className="p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                                    />
                                    <label className="text-xs font-medium text-gray-600">End Date</label>
                                    <input
                                        type="date"
                                        value={dateRangeFilter.endDate}
                                        onChange={(e) => setDateRangeFilter((prev) => ({ ...prev, endDate: e.target.value }))}
                                        className="p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                                    />
                                    <button
                                        onClick={handleDateRangeApply}
                                        className="mt-2 w-full px-2 py-1 bg-purple-600 text-white rounded-md text-xs font-medium hover:bg-purple-700 transition"
                                    >
                                        Apply Filter
                                    </button>
                                    {(activeDateRange.startDate || activeDateRange.endDate) && (
                                        <button
                                            onClick={() => {
                                                setDateRangeFilter({ startDate: "", endDate: "" });
                                                onFilterByRange({ startDate: null, endDate: null });
                                                setShowDateRangeInputs(false);
                                            }}
                                            className="w-full text-xs text-red-500 hover:text-red-700 mt-1"
                                        >
                                            Clear Current Range
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Refresh & Export */}
                    <button onClick={onRefresh} className="p-2 rounded-md hover:bg-gray-300 transition">
                        <RefreshCcw size={16} />
                    </button>
                    {onExport && (
                        <button onClick={onExport} className="p-2 rounded-md hover:bg-gray-300 transition">
                            <Download size={16} />
                        </button>
                    )}

                    {/* Search Input */}
                    <DebouncedInput
                        value={globalFilter}
                        onChange={setGlobalFilter}
                        onSearch={handleSearch}
                        placeholder="Search..."
                    />


                    {onCreate && (
                        <button
                            onClick={onCreate}
                            className="flex items-center gap-2 px-4 py-[6px] bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
                        >
                            {createLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    onClick={header.column.getToggleSortingHandler()}
                                    className="px-4 py-3 text-left cursor-pointer select-none hover:bg-gray-200 transition-colors duration-200"
                                >
                                    <div className="flex items-center gap-1 truncate">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        <span className="text-gray-500">
                                            {{
                                                asc: "↑",
                                                desc: "↓",
                                            }[header.column.getIsSorted()] ?? null}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="text-gray-700 text-sm">
                    {loading
                        ? Array.from({ length: pagination.pageSize }).map((_, idx) => <SkeletonRow key={idx} />)
                        : table.getRowModel().rows.length === 0
                            ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-6 text-gray-500 italic">
                                        No data available
                                    </td>
                                </tr>
                            )
                            : table.getRowModel().rows.map((row, idx) => (
                                <tr
                                    key={row.id}
                                    className={`transition-colors duration-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-purple-50`}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3 border-b border-gray-200 text-sm whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1 p-1 bg-white border-gray-200 rounded-lg shadow-sm">
                <span className="text-gray-600 text-sm">
                    Showing {totalDataCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1} to{" "}
                    {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalDataCount)} of {totalDataCount} entries
                </span>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Go to:</span>
                        <select value={selectedGoTo} onChange={handleGoToChange} className="p-2 border border-gray-300 rounded-lg text-sm">
                            {pageOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))} disabled={pagination.pageIndex === 0}>
                            <ChevronsLeft size={16} />
                        </button>
                        <button onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))} disabled={pagination.pageIndex === 0}>
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-gray-700 text-sm px-2">{pagination.pageIndex + 1} of {pageOptions.length}</span>
                        <button onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))} disabled={pagination.pageIndex >= pageOptions.length - 1}>
                            <ChevronRight size={16} />
                        </button>
                        <button onClick={() => setPagination((prev) => ({ ...prev, pageIndex: pageOptions.length - 1 }))} disabled={pagination.pageIndex >= pageOptions.length - 1}>
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FrontendTable;
