import React, { useState } from "react";
import { useForm } from "react-hook-form";
// Assuming you have a standard DataTable component
import DataTable from "../../components/Table/DataTable"; 
// Import the fixed SelectableDataTable component
import SelectableDataTable from "../../components/Table/SelectableDataTable";

export default function GroupCreate() {
  const { register, handleSubmit, reset } = useForm();

  // State for the audience chips (e.g., "Android Users")
  const [selectedItems, setSelectedItems] = useState([]);

  // State for the history table (notifications sent in current session)
  const [tableData, setTableData] = useState([]);
  
  // State for row selection (used by SelectableDataTable)
  const [rowSelection, setRowSelection] = useState({});
  // Array of selected user objects
  const [selectedUsers, setSelectedUsers] = useState([]); 

  // Available audience options for the push notification form (chips)
  const options = [
    "All Users",
    "Android Users",
    "iOS Users",
    "Prime Users",
    "Inactive Users (30 days)"
  ];

  // Hardcoded dummy data for the SelectableDataTable
  const data = [
    { id: 101, name: 'Alice Smith', email: 'alice@example.com', platform: 'iOS' },
    { id: 102, name: 'Bob Johnson', email: 'bob@example.com', platform: 'Android' },
    { id: 103, name: 'Charlie Brown', email: 'charlie@example.com', platform: 'Web' },
    { id: 104, name: 'Diana Prince', email: 'diana@example.com', platform: 'Android' },
    { id: 105, name: 'Ethan Hunt', email: 'ethan@example.com', platform: 'iOS' },
    { id: 106, name: 'Fiona Glenn', email: 'fiona@example.com', platform: 'Android' },
    { id: 107, name: 'George Lucas', email: 'george@example.com', platform: 'iOS' },
    { id: 108, name: 'Hannah Montana', email: 'hannah@example.com', platform: 'Android' },
    { id: 109, name: 'Ian Fleming', email: 'ian@example.com', platform: 'Web' },
    { id: 110, name: 'Jasmine Chen', email: 'jasmine@example.com', platform: 'iOS' },
    { id: 111, name: 'Kyle Reese', email: 'kyle@example.com', platform: 'Android' },
    { id: 112, name: 'Laura Croft', email: 'laura@example.com', platform: 'iOS' },
  ];
  
  // Columns for the SelectableDataTable (User Selection)
  const columns = [
    { accessorKey: 'id', header: 'User ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'platform', header: 'Platform' },
  ];



  // Handler to add an item to the selectedItems (audience chips)
  const handleSelect = (e) => {
    const value = e.target.value;
    if (value && !selectedItems.includes(value)) {
      setSelectedItems((prev) => [...prev, value]);
    }
    e.target.value = "";
  };

  // Handler to remove an item from the selectedItems (audience chips)
  const removeItem = (item) => {
    setSelectedItems(selectedItems.filter((i) => i !== item));
  };

  // Handler for form submission (Sending the Notification)
  const onSubmit = (data) => {
    
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
      audience: selectedItems, 
      selectedUserIds: selectedUsers.map(u => u.id),
    };
    
    console.log("Notification Payload Sent:", payload);
    
    // Add the notification to the local history table
    setTableData((prev) => [payload, ...prev]);

    // Reset the form and selections
    reset();
    setSelectedItems([]);
    setRowSelection({}); // Deselect rows in the table
    setSelectedUsers([]);
  };

  // Handler to receive the selected row data from SelectableDataTable
  // This is the function that was triggering the loop due to array reference change.
  // The fix is in the child component (SelectableDataTable).
  const handleRowSelection = (rows) => {
    setSelectedUsers(rows);
  };


  // ❌ REMOVED the unnecessary useEffect from the original code
  /*
  useEffect(() => {
    if (onRowSelect) {
      const selectedRowsData = table.getSelectedRowModel().flatRows.map(row => row.original);
      
      // NOTE: Call the parent handler. The parent must handle the deep comparison 
      // or the dependency array must be stable. Since the dependency array is correct,
      // the issue might be in how the parent uses the data.
      onRowSelect(selectedRowsData);
    }
    // This dependency array is correct for TanStack Table state:
  }, [rowSelection, onRowSelect, table]);
  */
  
  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-800">Send Push Notification 📢</h2>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={!selectedItems.length && !selectedUsers.length}
            >
              Send
            </button>
          </div>
          <hr/>

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
      
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Select Individual Users (Optional) 👇</h2>
      
      {selectedUsers.length > 0 && (
        <div className="p-3 mb-4 bg-purple-50 border-l-4 border-purple-500 text-purple-800 rounded">
          **{selectedUsers.length}** user(s) selected from the table. They will receive the notification.
        </div>
      )}
      
      {/* -----------------------------------------
              SelectableDataTable for User List
          ------------------------------------------ */}
      <SelectableDataTable
        columns={columns}
        data={data} 
        totalDataCount={data.length}
        onPageChange={() => {}} 
        title="User Directory"
        loading={false}
        // Selection Props: These states are shared with the SelectableDataTable
        rowSelection={rowSelection} 
        setRowSelection={setRowSelection}
        onRowSelect={handleRowSelection}
        createLabel="Add New User"
      />

      <hr className="my-10"/>

     
    </div>
  );
}