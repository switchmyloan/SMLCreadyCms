import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import DataTable from "../../components/Table/DataTable";
import SelectableDataTable from "../../components/Table/SelectableDataTable";
import ValidatedTextField from "../../components/Form/ValidatedTextField";
import ValidatedTextArea from "../../components/Form/ValidatedTextArea";
import ValidatedMultiSelect from "../../components/Form/ValidatedSearchMultiSelect";
import Uploader from "../../components/Form/Uploader";
import { createTemplate } from "../../api-services/Modules/Leads";
import ValidatedSearchMultiSelect from "../../components/Form/ValidatedSearchMultiSelect";
import ValidatedSingleSelect from "../../components/Form/ValidatedSingleSelect";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ToastNotification from "../../components/Notification/ToastNotification";

export default function PushNotificationCreate() {

  const [selectedItems, setSelectedItems] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [options, setOptions] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('')
  const navigate = useNavigate()


  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({
    template_image: null,
    group_xid: null,
    title: '',
    message: ''
  });

  const fetchGroups = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/push-notification/admin/group`);

    if (!res.ok) {
      console.error("Failed to fetch groups:", res.statusText);
      return [];
    }

    const json = await res.json();

    const list = json?.data?.data || [];

    const formatted = list.map((item) => ({
      value: item.id,       // must be `value`
      label: item.groupName // must be `label`
    }));

    setOptions(formatted); // assuming setOptions is defined in your component
    return formatted;
  };

  
  const removeItem = (item) => {
    setSelectedItems(selectedItems.filter((i) => i !== item));
  };

  const onSubmit = async (data) => {
    if (!data.title) {
      alert("Title is required.");
      return;
    }


    const response = await createTemplate(data);
    console.log(response)
    if (response?.success) {
      navigate('/push-notification');
    } else {
      ToastNotification.error(`Failed to add lender || 'Unknown error'}`);
    }

    setTableData((prev) => [payload, ...prev]);

    reset();
    setSelectedItems([]);
    setRowSelection({});
    setSelectedUsers([]);
  };

  useEffect(() => {
    fetchGroups()
  }, [])

  return (
    <div className="p-6">
      <Toaster />
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-800">Send Push Notification 📢</h2>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            // disabled={!selectedItems.length && !selectedUsers.length}
            >
              Send
            </button>
          </div>
          <hr />
          <div className="flex gap-4">
            <div className="flex-1">
              <ValidatedTextField
                name="title"
                control={control}
                errors={errors}
                label="Title"
                placeholder="Enter title"
                rules={{ required: "Title is required" }}
                required={true}
              />
            </div>

            {/* Audience Dropdown (Chips) */}
            <div className="flex-1 gap-4">
              <div className="">
                {/* <ValidatedMultiSelect
                  name="group_xid"
                  control={control}
                  errors={errors}
                  label="Select Group"
                  rules={{ required: "Please select at least one group" }}
                  options={options}
                /> */}
                <ValidatedSingleSelect
                  name="group_xid"
                  control={control}
                  errors={errors}
                  label="Select Group"
                  rules={{ required: "Please select a group" }}
                  options={options}
                />

              </div>
              <div className="flex-1"></div>
            </div>

          </div>
          <div className="flex-1">
            <ValidatedTextArea
              name="message"
              control={control}
              errors={errors}
              label="Message"
              placeholder="Write notification message..."
              rows={5}
              rules={{ required: "Message is required" }}
              required={true}
            />
          </div>

          <div>
            <Uploader
              name="template_image"
              control={control}
              label="Upload Profile Image"
              errors={errors}
              rules={{ required: "Profile image is required" }}
            />
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
    </div>
  );
}