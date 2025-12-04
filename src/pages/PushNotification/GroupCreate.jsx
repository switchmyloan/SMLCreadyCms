import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import SelectableDataTable from "../../components/Table/SelectableDataTable";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addGroupUsers, getInAppLeads } from "../../api-services/Modules/Leads";

export default function GroupCreate() {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [selectedItems, setSelectedItems] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("id");
  const [groupName, setGroupName] = useState(null)
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: ''
  })

  const columns = [
    { accessorKey: 'id', header: 'User ID' },
    { accessorKey: 'firstName', header: 'Name' },
    { accessorKey: 'emailAddress', header: 'Email' },
    { accessorKey: 'isBioMetricEnabled', header: 'Bio Metric' },
  ];

  const handleSelect = (e) => {
    const value = e.target.value;
    if (value && !selectedItems.includes(value)) {
      setSelectedItems((prev) => [...prev, value]);
    }
    e.target.value = "";
  };

  const removeItem = (item) => {
    setSelectedItems(selectedItems.filter((i) => i !== item));
  };

  // Handler for form submission (Sending the Notification)
  const onSubmit = async (data) => {

    if (!data.title) {
      alert("Title is required.");
      return;
    }

    if (selectedItems.length === 0 && selectedUsers.length === 0) {
      alert("Please select a chip audience OR select individual users before sending.");
      return;
    }

    const payload = {
      ...data,
      groupId: parseInt(groupId),
      userIds: selectedUsers,
      // userIds: selectedUsers.map(u => u.id),
    };

    console.log("Notification Payload Sent:", payload);

    const response = await addGroupUsers(payload);
    console.log(response)
    if (response?.data?.success) {
      navigate('/group');
    } else {
      ToastNotification.error(`Failed to add lender || 'Unknown error'}`);
    }

    // Add the notification to the local history table
    setTableData((prev) => [payload, ...prev]);

    // Reset the form and selections
    reset();
    setSelectedItems([]);
    setRowSelection({}); // Deselect rows in the table
    setSelectedUsers([]);
  };

  // const handleRowSelection = (rows) => {
  //   setSelectedUsers(rows);
  // };
  const handleRowSelection = (selectedRows) => {
    setSelectedUsers(selectedRows.map(r => r.id));  // IDs only
  };



  const fetchSingleGroup = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/push-notification/admin/group/${groupId}`
      );
      const json = await res.json();

      if (json?.success) {
        const members = json?.data?.members || [];
        const memberIds = members.map(m => m.id);

        setSelectedUsers(memberIds);

       const selectionObj = {};
            memberIds.forEach(id => { // <-- memberIds का उपयोग
                selectionObj[id] = true;
            });
        setRowSelection(selectionObj);
        setGroupName(json?.data?.groupName);
        setValue("title", json?.data?.groupName);
      }
    } catch (err) {
      console.error("Error fetching group:", err);
    }
  };
  console.log(rowSelection, "rowww")

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await getInAppLeads(query.page_no, query.limit, '');
      if (response?.data?.success) {
        setData(response?.data?.data?.rows || []);
        setTotalDataCount(response?.data?.data?.pagination?.total || 0);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error('Error fetching:', error);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSingleGroup();
    fetchLeads()
  }, [groupId])
  

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-800">Add User in Group</h2>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={!selectedItems.length && !selectedUsers.length}
            >
              Add Users
            </button>
          </div>
          <hr />

          {/* Title + Subtitle */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
              <input
                {...register("title", { required: true })}
                className="w-5xl border px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter notification title"
              />
            </div>
          </div>



          {/* Selected Chips Display */}
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <span
                key={item}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-2 text-sm font-medium"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="text-blue-500 font-bold ml-1 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </form>
      </div>

      {/* <h2 className="text-2xl font-bold text-gray-800 mb-3">Select Users 👇</h2> */}

      {selectedUsers.length > 0 && (
        <div className="p-3 mb-4 bg-purple-50 border-l-4 border-purple-500 text-purple-800 rounded">
          **{selectedUsers.length}** user(s) selected from the table. They will receive the notification.
        </div>
      )}


      <SelectableDataTable
        columns={columns}
        data={data}
        totalDataCount={data.length}
        onPageChange={() => { }}
        title="Users"
        loading={false}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        onRowSelect={handleRowSelection}
        createLabel="Add New User"
      />
      <hr className="my-10" />
    </>
  );
}