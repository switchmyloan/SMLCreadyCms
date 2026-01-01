import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import SelectableDataTable from "../../components/Table/SelectableDataTable";
import { addGroupUsers, getInAppLeads } from "../../api-services/Modules/Leads";
import { Calendar, ChevronDown, DollarSign, Filter, RotateCcw, Search, CheckSquare, Users } from "lucide-react";

// --- Helpers ---
const normalizeGender = (gender) => {
    if (!gender) return '';
    const g = gender.toString().trim().toLowerCase();
    if (g === 'm' || g === 'male') return 'male';
    if (g === 'f' || g === 'female') return 'female';
    return 'other';
};

const normalizeDOB = (dob) => {
    if (!dob) return '';
    const date = new Date(dob);
    if (isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy}`;
};

const calculateAge = (dob) => {
    if (!dob) return null;
    const parts = dob.split('-'); // Expecting dd-mm-yyyy
    const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
};

export default function GroupCreate() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const groupTitle = searchParams.get("name");
    const groupId = searchParams.get("groupId");

    // Table & Selection states
    const [data, setData] = useState([]);
    const [totalDataCount, setTotalDataCount] = useState(0);
    const [rowSelection, setRowSelection] = useState({}); // Control check-boxes
    const [selectedUsers, setSelectedUsers] = useState([]); // Array of IDs
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Filter & UI States
    const [searchTerm, setSearchTerm] = useState('');
    const [showSelectedOnly, setShowSelectedOnly] = useState(false);
    const [filters, setFilters] = useState({ gender: '', minAge: '', maxAge: '', minIncome: '', maxIncome: '', fromDate: '', toDate: '' });

    // Dropdown States
    const [openDropdown, setOpenDropdown] = useState(null);
    const [tempRange, setTempRange] = useState({ start: '', end: '' });

    const { register, handleSubmit, setValue, reset } = useForm({
        defaultValues: { title: groupTitle || '' }
    });

    const columns = [
        { accessorKey: 'phoneNumber', header: 'Number' },
        { accessorKey: 'firstName', header: 'Name' },
        { accessorKey: 'emailAddress', header: 'Email' },
        { accessorKey: 'gender', header: 'Gender' },
        { accessorKey: 'dateOfBirth', header: 'DOB' },
        { accessorKey: 'monthlyIncome', header: 'Income' },
        { accessorKey: 'createdAt', header: 'Created' },
    ];

    // --- Logic 1: Fetch Group Members and PRE-SELECT rows ---
    const fetchSingleGroup = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/push-notification/admin/group/${groupId}`);
            const json = await res.json();
            if (json?.success) {
                const memberIds = (json?.data?.members || []).map(m => m.id);
                setSelectedUsers(memberIds);

                // Ye logic rows ko "Selected" state mein rakhta hai
                const selectionObj = {};
                memberIds.forEach(id => { selectionObj[id] = true; });
                setRowSelection(selectionObj);

                setValue("title", json?.data?.name);
            }
        } catch (err) { console.error(err); }
    };

    // --- Logic 2: Fetch Leads ---
    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await getInAppLeads(pagination.pageIndex + 1, pagination.pageSize, '');
            if (response?.data?.success) {
                const rows = response?.data?.data?.rows || [];
                const formattedRows = rows.map((u) => {
                    const dob = normalizeDOB(u.dateOfBirth);
                    return {
                        ...u,
                        id: u.id || u.principal_xid,
                        gender: normalizeGender(u.gender).toUpperCase(),
                        dateOfBirth: dob || 'N/A',
                        age: calculateAge(dob),
                        cleanIncome: u.monthlyIncome ? Number(u.monthlyIncome.toString().replace(/[^0-9.-]+/g, "")) : 0
                    };
                });
                setData(formattedRows);
                setTotalDataCount(formattedRows.length);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchSingleGroup();
        fetchLeads();
    }, [groupId]);

    // --- Logic 3: Handle Selection ---
    const handleRowSelection = (selectedRows) => {
        const ids = selectedRows.map(r => r.id);
        setSelectedUsers(ids);
    };

    // --- Logic 4: Filtered Data ---
    const filteredData = useMemo(() => {
        return data.filter(user => {
            if (showSelectedOnly && !selectedUsers.includes(user.id)) return false;
            const s = `${user.firstName} ${user.emailAddress} ${user.phoneNumber}`.toLowerCase();
            if (searchTerm && !s.includes(searchTerm.toLowerCase())) return false;
            if (filters.gender && normalizeGender(user.gender) !== filters.gender) return false;
            if (filters.minAge && user.age < Number(filters.minAge)) return false;
            if (filters.maxAge && user.age > Number(filters.maxAge)) return false;
            if (filters.minIncome && user.cleanIncome < Number(filters.minIncome)) return false;
            if (filters.maxIncome && user.cleanIncome > Number(filters.maxIncome)) return false;
            // Date Filter logic
            if (filters.fromDate || filters.toDate) {
                const userDate = new Date(user.createdAt);
                if (filters.fromDate && userDate < new Date(filters.fromDate)) return false;
                if (filters.toDate && userDate > new Date(filters.toDate)) return false;
            }
            return true;
        });
    }, [data, filters, searchTerm, showSelectedOnly, selectedUsers]);

    const onSubmit = async (formData) => {
        const payload = { ...formData, groupId: parseInt(groupId), userIds: selectedUsers };
        const response = await addGroupUsers(payload);
        if (response?.data?.success) navigate('/group');
        else alert("Failed to add users.");
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 flex justify-between items-center">
                <div className="w-1/2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Group Title</label>
                    <input {...register("title")} className="w-full border-b py-1 text-lg font-bold outline-none bg-transparent" readOnly />
                    <p className="text-blue-600 text-sm mt-1 font-bold">{selectedUsers.length} Users Selected</p>
                </div>
                <button onClick={handleSubmit(onSubmit)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all active:scale-95 disabled:bg-gray-300" disabled={!selectedUsers.length}>
                    Update Group Members
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
                <div className="flex gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input type="text" placeholder="Search by name, email, phone..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={() => setShowSelectedOnly(!showSelectedOnly)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold transition-all ${showSelectedOnly ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        <CheckSquare size={18} /> {showSelectedOnly ? "Viewing Selected" : "Show Selected Only"}
                    </button>
                </div>

                <div className="flex flex-wrap gap-3 items-center pt-4 border-t">
                    {/* Gender Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['all', 'male', 'female'].map((g) => (
                            <button key={g} onClick={() => setFilters({ ...filters, gender: g === 'all' ? '' : g })} className={`px-5 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${((g === 'all' && !filters.gender) || filters.gender === g) ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>{g}</button>
                        ))}
                    </div>
                    {/* Registration Date Filter */}
                    <div className="relative">
                        <button onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')} className="border px-3 py-2 rounded-lg bg-white text-xs font-bold flex items-center gap-2">
                            <Calendar size={14} className="text-blue-500" /> Date Range <ChevronDown size={14} />
                        </button>
                        {openDropdown === 'date' && (
                            <div className="absolute top-full left-0 z-50 bg-white border p-4 shadow-xl rounded-xl mt-2 w-64">
                                <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Created Between</p>
                                <input type="date" className="w-full border p-2 rounded mb-2 text-sm" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
                                <input type="date" className="w-full border p-2 rounded text-sm" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
                                <button onClick={() => setOpenDropdown(null)} className="w-full bg-blue-600 text-white py-2 mt-3 rounded font-bold text-xs">Done</button>
                            </div>
                        )}
                    </div>

                    {/* Age Filter Dropdown */}
                    <div className="relative">
                        <button onClick={() => setOpenDropdown(openDropdown === 'age' ? null : 'age')} className="border px-4 py-2 rounded-lg bg-white text-xs font-bold flex items-center gap-2 border-gray-200">
                            <Filter size={14} className="text-green-500" /> Age Range <ChevronDown size={14} />
                        </button>
                        {openDropdown === 'age' && (
                            <div className="absolute top-full left-0 z-50 bg-white border p-4 shadow-xl rounded-xl mt-2 w-48">
                                <input type="number" placeholder="Min" className="w-full border p-2 rounded mb-2" onChange={(e) => setFilters({ ...filters, minAge: e.target.value })} />
                                <input type="number" placeholder="Max" className="w-full border p-2 rounded mb-2" onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })} />
                                <button onClick={() => setOpenDropdown(null)} className="w-full bg-blue-600 text-white py-2 rounded font-bold text-xs">Apply</button>
                            </div>
                        )}
                    </div>
                    {/* Income Filter */}
                    <div className="relative">
                        <button onClick={() => setOpenDropdown(openDropdown === 'income' ? null : 'income')} className="border px-3 py-2 rounded-lg bg-white text-xs font-bold flex items-center gap-2">
                            <DollarSign size={14} className="text-yellow-600" /> Income <ChevronDown size={14} />
                        </button>
                        {openDropdown === 'income' && (
                            <div className="absolute top-full left-0 z-50 bg-white border p-4 shadow-xl rounded-xl mt-2 w-52">
                                <input type="number" placeholder="Min Income" className="w-full border p-2 rounded mb-2" value={filters.minIncome} onChange={(e) => setFilters({ ...filters, minIncome: e.target.value })} />
                                <input type="number" placeholder="Max Income" className="w-full border p-2 rounded text-sm" value={filters.maxIncome} onChange={(e) => setFilters({ ...filters, maxIncome: e.target.value })} />
                                <button onClick={() => setOpenDropdown(null)} className="w-full bg-blue-600 text-white py-2 mt-3 rounded font-bold text-xs">Done</button>
                            </div>
                        )}
                    </div>

                    <button onClick={() => { setFilters({ gender: '', minAge: '', maxAge: '', minIncome: '', maxIncome: '', fromDate: '', toDate: '' }); setSearchTerm(''); setShowSelectedOnly(false); }} className="text-xs font-bold text-red-500 ml-auto flex items-center gap-1 hover:bg-red-50 p-2 rounded-lg transition-all">
                        <RotateCcw size={14} /> RESET
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <SelectableDataTable
                    columns={columns}
                    data={filteredData}
                    totalDataCount={totalDataCount}
                    pagination={pagination}
                    setPagination={setPagination}
                    rowSelection={rowSelection} // PRE-SELECTED ROWS YAHAN SE CONTROL HOTI HAIN
                    setRowSelection={setRowSelection}
                    onRowSelect={handleRowSelection}
                    title="Leads Database"
                    loading={loading}
                />
            </div>
        </div>
    );
}