import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ValidatedTextField from "../../components/Form/ValidatedTextField";
import ValidatedTextArea from "../../components/Form/ValidatedTextArea";
import Uploader from "../../components/Form/Uploader";
import { createTemplate, updateTemplate } from "../../api-services/Modules/Leads";
import ValidatedSingleSelect from "../../components/Form/ValidatedSingleSelect";
import { useNavigate, useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ToastNotification from "../../components/Notification/ToastNotification";

export default function PushNotificationCreate() {

  const [selectedItems, setSelectedItems] = useState([]);
  const [options, setOptions] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();



  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors }
  } = useForm({
    imageUrl: null,
    group_xid: null,
    title: '',
    message: ''
  });

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      // "https://admin.cready.in/api/public/admin",
      `${import.meta.env.VITE_API_URL}/public/admin`,
      {
        method: "POST",
        body: formData,
      }
    );

    const json = await res.json();

    if (!json?.success) {
      throw new Error("Image upload failed");
    }

    return json.data.path; // 👈 IMPORTANT
  };


  const fetchGroups = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/push-notification/admin/group`);

    if (!res.ok) {
      console.error("Failed to fetch groups:", res.statusText);
      return [];
    }

    const json = await res.json();

    const list = json?.data?.data || [];

    const formatted = list.map((item) => ({
      value: item.id,
      label: `${item.groupName} (${item.memberCount || 0} users)`
    }));

    setOptions(formatted);
    return formatted;
  };
  const fetchTemplate = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/push-notification/admin/templates/${id}`);

    if (!res.ok) {
      console.error("Failed to fetch groups:", res.statusText);
      return [];
    }

    const json = await res.json();

    const list = json?.data || [];

    console.log(list?.title, "list?.title")
    setValue('title', list?.title)
    setValue('group_xid', list?.group_xid)
    setValue('message', list?.message)
    setValue('imageUrl', import.meta.env.VITE_API_URL + '/' + list?.imageUrl)
  };


  const removeItem = (item) => {
    setSelectedItems(selectedItems.filter((i) => i !== item));
  };

  const onSubmit = async (data) => {
    try {
      let imagePath = data.imageUrl;

      // 🟡 Agar image File hai tabhi upload karo
      if (data.imageUrl instanceof File) {
         imagePath = await uploadImage(data.imageUrl);
        
      }

      const payload = {
        title: data.title,
        message: data.message,
        group_xid: data.group_xid,
        imageUrl: import.meta.env.VITE_IMAGE_URL+imagePath, // 👈 sirf path jayega
      };

      const response = id
        ? await updateTemplate(id, payload)
        : await createTemplate(payload);

      if (response?.success || response?.data?.success) {
        ToastNotification.success("Template saved successfully!");
        navigate("/push-notification");
        return;
      }

      ToastNotification.error("Failed to save template");
    } catch (err) {
      console.error(err);
      ToastNotification.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchGroups();
    if (id) {
      fetchTemplate()
    }
  }, [])

  return (
    <div className="p-6">
      <Toaster />
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-800">{id ? 'Update' : 'Send'} Push Notification 📢</h2>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            // disabled={!selectedItems.length && !selectedUsers.length}
            >
              {id ? 'Update' : 'Send'}
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
              name="imageUrl"
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