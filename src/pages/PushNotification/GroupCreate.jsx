// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import SelectableDataTable from "../../components/Table/SelectableDataTable";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { addGroupUsers, getInAppLeads } from "../../api-services/Modules/Leads";

// export default function GroupCreate() {
//   const { register, handleSubmit, reset, setValue } = useForm();
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [tableData, setTableData] = useState([]);
//   const [rowSelection, setRowSelection] = useState({});
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [searchParams] = useSearchParams();
//   const groupId = searchParams.get("id");
//   const [groupName, setGroupName] = useState(null)
//   const [data, setData] = useState([]);
//   const [totalDataCount, setTotalDataCount] = useState(0);
//   const [loading, setLoading] = useState(false)
//   const navigate = useNavigate()
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 10
//   })
//   const [query, setQuery] = useState({
//     limit: 10,
//     page_no: 1,
//     search: ''
//   })

//   const columns = [
//     { accessorKey: 'id', header: 'User ID' },
//     { accessorKey: 'firstName', header: 'Name' },
//     { accessorKey: 'emailAddress', header: 'Email' },
//     { accessorKey: 'isBioMetricEnabled', header: 'Bio Metric' },
//   ];

//   const handleSelect = (e) => {
//     const value = e.target.value;
//     if (value && !selectedItems.includes(value)) {
//       setSelectedItems((prev) => [...prev, value]);
//     }
//     e.target.value = "";
//   };

//   const removeItem = (item) => {
//     setSelectedItems(selectedItems.filter((i) => i !== item));
//   };

//   // Handler for form submission (Sending the Notification)
//   const onSubmit = async (data) => {

//     if (!data.title) {
//       alert("Title is required.");
//       return;
//     }

//     if (selectedItems.length === 0 && selectedUsers.length === 0) {
//       alert("Please select a chip audience OR select individual users before sending.");
//       return;
//     }

//     const payload = {
//       ...data,
//       groupId: parseInt(groupId),
//       userIds: selectedUsers,
//       // userIds: selectedUsers.map(u => u.id),
//     };

//     console.log("Notification Payload Sent:", payload);

//     const response = await addGroupUsers(payload);
//     console.log(response)
//     if (response?.data?.success) {
//       navigate('/group');
//     } else {
//       ToastNotification.error(`Failed to add lender || 'Unknown error'}`);
//     }

//     // Add the notification to the local history table
//     setTableData((prev) => [payload, ...prev]);

//     // Reset the form and selections
//     reset();
//     setSelectedItems([]);
//     setRowSelection({}); // Deselect rows in the table
//     setSelectedUsers([]);
//   };

//   // const handleRowSelection = (rows) => {
//   //   setSelectedUsers(rows);
//   // };
//   const handleRowSelection = (selectedRows) => {
//     setSelectedUsers(selectedRows.map(r => r.id));  // IDs only
//   };



//   const fetchSingleGroup = async () => {
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_API_URL}/push-notification/admin/group/${groupId}`
//       );
//       const json = await res.json();

//       if (json?.success) {
//         const members = json?.data?.members || [];
//         const memberIds = members.map(m => m.id);

//         setSelectedUsers(memberIds);

//        const selectionObj = {};
//             memberIds.forEach(id => { // <-- memberIds का उपयोग
//                 selectionObj[id] = true;
//             });
//         setRowSelection(selectionObj);
//         setGroupName(json?.data?.groupName);
//         setValue("title", json?.data?.groupName);
//       }
//     } catch (err) {
//       console.error("Error fetching group:", err);
//     }
//   };
//   console.log(rowSelection, "rowww")

//   const fetchLeads = async () => {
//     try {
//       setLoading(true);
//       const response = await getInAppLeads(query.page_no, query.limit, '');
//       if (response?.data?.success) {
//         setData(response?.data?.data?.rows || []);
//         setTotalDataCount(response?.data?.data?.pagination?.total || 0);
//       } else {
//         ToastNotification.error("Error fetching data");
//       }
//     } catch (error) {
//       console.error('Error fetching:', error);

//     } finally {
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//     fetchSingleGroup();
//     fetchLeads()
//   }, [groupId])


//   return (
//     <>
//       <div className="bg-white p-6 rounded-xl shadow mb-10">
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

//           <div className="flex justify-between items-center">
//             <h2 className="text-2xl font-bold text-blue-800">Add User in Group</h2>

//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
//               disabled={!selectedItems.length && !selectedUsers.length}
//             >
//               Add Users
//             </button>
//           </div>
//           <hr />

//           {/* Title + Subtitle */}
//           <div className="flex gap-4">
//             <div className="flex-1">
//               <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
//               <input
//                 {...register("title", { required: true })}
//                 className="w-5xl border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter notification title"
//               />
//             </div>
//           </div>



//           {/* Selected Chips Display */}
//           <div className="flex flex-wrap gap-2">
//             {selectedItems.map((item) => (
//               <span
//                 key={item}
//                 className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-2 text-sm font-medium"
//               >
//                 {item}
//                 <button
//                   type="button"
//                   onClick={() => removeItem(item)}
//                   className="text-blue-500 font-bold ml-1 hover:text-red-500 transition-colors"
//                 >
//                   ✕
//                 </button>
//               </span>
//             ))}
//           </div>
//         </form>
//       </div>

//       {/* <h2 className="text-2xl font-bold text-gray-800 mb-3">Select Users 👇</h2> */}

//       {selectedUsers.length > 0 && (
//         <div className="p-3 mb-4 bg-purple-50 border-l-4 border-purple-500 text-purple-800 rounded">
//           **{selectedUsers.length}** user(s) selected from the table. They will receive the notification.
//         </div>
//       )}


//       <SelectableDataTable
//         columns={columns}
//         data={data}
//         totalDataCount={data.length}
//         onPageChange={() => { }}
//         title="Users"
//         loading={false}
//         rowSelection={rowSelection}
//         setRowSelection={setRowSelection}
//         onRowSelect={handleRowSelection}
//         createLabel="Add New User"
//       />
//       <hr className="my-10" />
//     </>
//   );
// }


import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import SelectableDataTable from "../../components/Table/SelectableDataTable";
import { addGroupUsers, getInAppLeads } from "../../api-services/Modules/Leads";

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
    { accessorKey: 'age', header: 'Age' },
    { accessorKey: 'income', header: 'Income' },
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
      // if (json?.success) {
      //   const members = json?.data?.members || [];
      //   const memberIds = members.map(m => m.id);
      //   setSelectedUsers(memberIds);
      //   const selectionObj = {};
      //   memberIds.forEach(id => selectionObj[id] = true);
      //   setRowSelection(selectionObj);
      //   setGroupName(json?.data?.groupName);
      //   setValue("title", json?.data?.groupName);
      // }
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
        // setData(response?.data?.data?.rows || []);
        // setTotalDataCount(response?.data?.data?.rows.length || 0);
        const rows = response?.data?.data?.rows || [];

        const formattedRows = rows.map((u) => ({
          ...u,
          id: u.id || u.principal_xid, // 👈 VERY IMPORTANT
        }));

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
      if (filters.gender && user.gender !== filters.gender) return false;
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

      {/* Gender */}
      <select
        value={filters.gender}
        onChange={e => setFilters({ ...filters, gender: e.target.value })}
        className="border p-2 rounded text-sm"
      >
        <option value="">All Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      {/* Age */}
      <input
        type="number"
        placeholder="Min Age"
        value={filters.minAge}
        onChange={e => setFilters({ ...filters, minAge: e.target.value })}
        className="border p-2 rounded w-24 text-sm"
      />
      <input
        type="number"
        placeholder="Max Age"
        value={filters.maxAge}
        onChange={e => setFilters({ ...filters, maxAge: e.target.value })}
        className="border p-2 rounded w-24 text-sm"
      />

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

      {/* Date Range Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
          className="border p-2 rounded text-sm bg-white hover:bg-gray-100"
        >
          {filters.fromDate && filters.toDate
            ? `${filters.fromDate} - ${filters.toDate}`
            : "Select Date Range"}
        </button>

        {dateDropdownOpen && (
          <div className="absolute top-full left-0 z-50 bg-white border p-3 shadow-lg rounded mt-1 w-64">
            <div className="flex flex-col gap-2">
              <input
                type="date"
                value={tempDateRange.startDate}
                onChange={e => setTempDateRange({ ...tempDateRange, startDate: e.target.value })}
                className="border p-2 rounded text-sm"
              />
              <input
                type="date"
                value={tempDateRange.endDate}
                onChange={e => setTempDateRange({ ...tempDateRange, endDate: e.target.value })}
                className="border p-2 rounded text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setFilters({ ...filters, fromDate: tempDateRange.startDate, toDate: tempDateRange.endDate });
                  setDateDropdownOpen(false);
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
