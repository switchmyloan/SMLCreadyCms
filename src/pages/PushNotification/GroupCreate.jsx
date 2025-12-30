import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import SelectableDataTable from "../../components/Table/SelectableDataTable";
import { addGroupUsers, getInAppLeads } from "../../api-services/Modules/Leads";


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

  return `${dd}-${mm}-${yyyy}`; // 1998-04-21
};


const calculateAge = (dob) => {
  if (!dob) return null;

  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

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
  const [rowSelection, setRowSelection] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // dropdown open state
  const [ageDropdownOpen, setAgeDropdownOpen] = useState(false);

  // temp values (dropdown ke andar)
  const [tempAgeRange, setTempAgeRange] = useState({
    minAge: '',
    maxAge: '',
  });

  // Date dropdown ke andar age dropdown
  const [ageInsideDateOpen, setAgeInsideDateOpen] = useState(false);




  const { register, handleSubmit, reset, setValue }
    = useForm({
      defaultValues: {
        title: groupTitle || '', // URL param se default title
      }
    });

  // Filters
  const [filters, setFilters] = useState({
    gender: '',
    minAge: '',
    maxAge: '',
    minIncome: '',
    maxIncome: '',
    fromDate: '',
    toDate: ''
  });

  // Dropdown temp states
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [incomeDropdownOpen, setIncomeDropdownOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({ startDate: '', endDate: '' });
  const [tempIncomeRange, setTempIncomeRange] = useState({ minIncome: '', maxIncome: '' });

  // Add User in Group Title
  const [groupName, setGroupName] = useState(null);

  const columns = [
    { accessorKey: 'phoneNumber', header: 'Number' },
    // { accessorKey: 'id', header: 'User ID' },
    { accessorKey: 'firstName', header: 'Name' },
    { accessorKey: 'emailAddress', header: 'Email' },
    { accessorKey: 'gender', header: 'Gender' },
    { accessorKey: 'dateOfBirth', header: 'Date Of Birth' },
    { accessorKey: 'monthlyIncome', header: 'Income' },
    { accessorKey: 'createdAt', header: 'Created At' },
  ];

  // Row selection handler
  const handleRowSelection = (selectedRows) => {
    setSelectedUsers(selectedRows.map(r => r.id));
  };

  // Submit handler
  const onSubmit = async (formData) => {
    if (!formData.title) {
      alert("Title is required.");
      return;
    }

    if (!selectedUsers.length) {
      alert("Please select users before adding.");
      return;
    }

    const payload = {
      ...formData,
      groupId: parseInt(groupId),
      userIds: selectedUsers,
    };

    const response = await addGroupUsers(payload);
    if (response?.data?.success) {
      navigate('/group');
    } else {
      alert("Failed to add users.");
    }

    reset();
    setRowSelection({});
    setSelectedUsers([]);
  };

  // Fetch group info
  const fetchSingleGroup = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/push-notification/admin/group/${groupId}`);
      const json = await res.json();
      if (json?.success) {
        const memberIds = (json?.data?.members || []).map(m => m.id);

        setSelectedUsers(memberIds);

        const selectionObj = {};
        memberIds.forEach(id => {
          selectionObj[id] = true;
        });

        setRowSelection(selectionObj);

        setGroupName(json?.data?.name);
        setValue("title", json?.data?.name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await getInAppLeads(pagination.pageIndex + 1, pagination.pageSize, '');
      if (response?.data?.success) {

        const rows = response?.data?.data?.rows || [];

        const formattedRows = rows.map((u) => {
          const normalizedDOB = normalizeDOB(u.dateOfBirth);

          return {
            ...u,
            id: u.id || u.principal_xid,
            gender: normalizeGender(u.gender).toUpperCase(),
            dateOfBirth: normalizedDOB || 'N/A',   // ✅ normalized DOB
            age: calculateAge(normalizedDOB), // ✅ derived age
          };
        });


        setData(formattedRows);
        setTotalDataCount(formattedRows.length);

      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSingleGroup();
    fetchLeads();
  }, [groupId]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter(user => {
      // if (filters.gender && user.gender !== filters.gender) return false;
      if (
        filters.gender &&
        normalizeGender(user.gender) !== normalizeGender(filters.gender)
      ) {
        return false;
      }
      if (filters.minAge && user.age < Number(filters.minAge)) return false;
      if (filters.maxAge && user.age > Number(filters.maxAge)) return false;
      if (filters.minIncome && user.income < Number(filters.minIncome)) return false;
      if (filters.maxIncome && user.income > Number(filters.maxIncome)) return false;
      if (filters.fromDate && new Date(user.createdAt) < new Date(filters.fromDate)) return false;
      if (filters.toDate && new Date(user.createdAt) > new Date(filters.toDate)) return false;
      return true;
    });
  }, [data, filters]);

  // Filters UI
  const FiltersUI = (
    <div className="flex flex-wrap gap-2 items-center relative">

      {/* Date + Age Range Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
          className="border p-2 rounded text-sm bg-white hover:bg-gray-100"
        >
          {(filters.fromDate && filters.toDate) || (filters.minAge && filters.maxAge)
            ? `${filters.fromDate || '—'} → ${filters.toDate || '—'} | Age ${filters.minAge || '—'}-${filters.maxAge || '—'}`
            : "Select Date & Age"}
        </button>

        {dateDropdownOpen && (
          <div className="absolute top-full left-0 z-50 bg-white border p-3 shadow-lg rounded mt-1 w-72">
            <div className="flex flex-col gap-3">

              {/* Date Range */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Date Range
                </label>
                <input
                  type="date"
                  value={tempDateRange.startDate}
                  onChange={(e) =>
                    setTempDateRange({ ...tempDateRange, startDate: e.target.value })
                  }
                  className="border p-2 rounded text-sm w-full mb-2"
                />
                <input
                  type="date"
                  value={tempDateRange.endDate}
                  onChange={(e) =>
                    setTempDateRange({ ...tempDateRange, endDate: e.target.value })
                  }
                  className="border p-2 rounded text-sm w-full"
                />
              </div>

              {/* Age dropdown inside Date dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAgeInsideDateOpen(!ageInsideDateOpen)}
                  className="w-full border p-2 rounded text-sm bg-gray-50 hover:bg-gray-100"
                >
                  {tempAgeRange.minAge && tempAgeRange.maxAge
                    ? `Age: ${tempAgeRange.minAge} - ${tempAgeRange.maxAge}`
                    : "Select Age Range"}
                </button>

                {ageInsideDateOpen && (
                  <div className="absolute left-0 top-full z-50 bg-white border p-3 rounded shadow w-full mt-1">
                    <input
                      type="number"
                      placeholder="Min Age"
                      value={tempAgeRange.minAge}
                      onChange={(e) =>
                        setTempAgeRange({ ...tempAgeRange, minAge: e.target.value })
                      }
                      className="border p-2 rounded text-sm w-full mb-2"
                    />
                    <input
                      type="number"
                      placeholder="Max Age"
                      value={tempAgeRange.maxAge}
                      onChange={(e) =>
                        setTempAgeRange({ ...tempAgeRange, maxAge: e.target.value })
                      }
                      className="border p-2 rounded text-sm w-full mb-2"
                    />
                  </div>
                )}
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    ...filters,
                    fromDate: tempDateRange.startDate,
                    toDate: tempDateRange.endDate,
                    minAge: tempAgeRange.minAge,
                    maxAge: tempAgeRange.maxAge,
                  });
                  setDateDropdownOpen(false);
                  setAgeInsideDateOpen(false);
                }}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Age */}
     

      {/* Income Range Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIncomeDropdownOpen(!incomeDropdownOpen)}
          className="border p-2 rounded text-sm bg-white hover:bg-gray-100"
        >
          {filters.minIncome && filters.maxIncome
            ? `${filters.minIncome} - ${filters.maxIncome}`
            : "Select Income Range"}
        </button>

        {incomeDropdownOpen && (
          <div className="absolute top-full left-0 z-50 bg-white border p-3 shadow-lg rounded mt-1 w-64">
            <div className="flex flex-col gap-2">
              <input
                type="number"
                placeholder="Min Income"
                value={tempIncomeRange.minIncome}
                onChange={e => setTempIncomeRange({ ...tempIncomeRange, minIncome: e.target.value })}
                className="border p-2 rounded text-sm"
              />
              <input
                type="number"
                placeholder="Max Income"
                value={tempIncomeRange.maxIncome}
                onChange={e => setTempIncomeRange({ ...tempIncomeRange, maxIncome: e.target.value })}
                className="border p-2 rounded text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setFilters({ ...filters, minIncome: tempIncomeRange.minIncome, maxIncome: tempIncomeRange.maxIncome });
                  setIncomeDropdownOpen(false);
                }}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <button
        type="button"
        onClick={() =>
          setFilters({
            gender: '',
            minAge: '',
            maxAge: '',
            minIncome: '',
            maxIncome: '',
            fromDate: '',
            toDate: '',
          })
        }
        className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
      >
        Clear
      </button>
    </div>
  );

  useEffect(() => {
    if (groupTitle) {
      setValue("title", groupTitle); // agar URL me title hai to update form
    }
  }, [groupTitle, setValue]);

  return (
    <>
      {/* Add User Section */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-800">Add User in Group</h2>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={!selectedUsers.length}
            >
              Add Users
            </button>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
            <input
              {...register("title", { required: true })}
              className="w-full border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter group title"
              readOnly
              disabled
            />
          </div>
        </form>
      </div>

      {/* Filters Section */}
      <div className="mb-4">
        {FiltersUI}
      </div>

      {/* Selected Users Info */}
      {selectedUsers.length > 0 && (
        <div className="p-3 mb-4 bg-purple-50 border-l-4 border-purple-500 text-purple-800 rounded">
          <strong>{selectedUsers.length}</strong> user(s) selected. They will be added to the group.
        </div>
      )}

      {/* Data Table */}
      <SelectableDataTable
        columns={columns}
        data={filteredData}
        totalDataCount={totalDataCount}
        pagination={pagination}
        setPagination={setPagination}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        onRowSelect={handleRowSelection}
        title="Users"
        loading={loading}
      />
    </>
  );
}
