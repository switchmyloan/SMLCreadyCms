import React, { useEffect, useState } from "react";
import DataTable from "@components/Table/DataTable";
import { Toaster } from "react-hot-toast";
import ToastNotification from "@components/Notification/ToastNotification";
import { pressColumn } from "@components/TableHeader";
import { useForm } from "react-hook-form";
import ValidatedTextField from "@components/Form/ValidatedTextField";
import ValidatedTextArea from "@components/Form/ValidatedTextArea";
import Drawer from "../../../components/Drawer";
import { AddPress, getPress } from "../../../api-services/Modules/PressApi";
import ImageUploadField from "../../../components/Form/ImageUploadField";
import ValidatedLabel from "../../../components/Form/ValidatedLabel";

const Press = () => {
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: "",
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPress, setSelectedPress] = useState(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      image: "",
      sourceLogo: "",
      redirectLink: "",
      status: "active",
    },
  });

  const handleCreate = () => {
    setIsDrawerOpen(true);
    setIsEditMode(false);
    reset();
  };

  const handleEdit = (press) => {
    setIsEditMode(true);
    setSelectedPress(press?.id);
    setIsDrawerOpen(true);

    // prefill form values
    setValue("title", press.title);
    setValue("description", press.description);
    setValue("image", press.image);
    setValue("sourceLogo", press.sourceLogo);
    setValue("redirectLink", press.redirectLink);
    setValue("status", press.status);
  };

  const fetchPress = async () => {
    try {
      const response = await getPress(query.page_no, query.limit, "");
      if (response?.data?.success) {
        setData(response?.data?.data?.data || []);
        setTotalDataCount(response?.data?.data?.pagination?.totalItems || 0);
      } else {
        ToastNotification.error("Error fetching Press");
      }
    } catch (error) {
      console.error("Error fetching:", error);
      ToastNotification.error("Failed to fetch Press");
    }
  };

  const onSubmit = async (formData) => {
    try {

      console.table(formData, "formdata")
        if (isEditMode) {
          const response = await updatePress({ id: selectedPress, ...formData });
          if (response?.data?.success) {
            ToastNotification.success("Press updated successfully!");
            fetchPress();
            closeDrawer();
          } else {
            ToastNotification.error("Failed to update Press.");
          }
        } else {
          const response = await AddPress(formData);
          if (response?.data?.success) {
            ToastNotification.success("Press created successfully!");
            fetchPress();
            closeDrawer();
          } else {
            ToastNotification.error("Failed to create Press.");
          }
        }
    } catch (error) {
      console.error("Error:", error);
      ToastNotification.error("Something went wrong!");
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setIsEditMode(false);
    setSelectedPress(null);
    reset();
  };

  const onPageChange = (pageNo) => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      page_no: pageNo.pageIndex + 1,
      limit: pagination.pageSize,
    }));
  };

  useEffect(() => {
    fetchPress();
  }, [query.page_no, query.limit]);

  return (
    <>
      <Toaster />
      <DataTable
        columns={pressColumn({ handleEdit })}
        title="Press Room"
        data={data}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={isEditMode ? "Update Press" : "Create Press"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <ValidatedTextField
            name="title"
            control={control}
            rules={{ required: true }}
            label="Title"
            placeholder="Enter title"
            errors={errors}
            helperText="Title is required!"
          />

          {/* Description */}
          <ValidatedTextArea
            name="description"
            control={control}
            label="Description"
            errors={errors}
            placeholder="Enter description"
            rows={4}
            rules={{ required: "Description is required" }}
          />

          {/* Image */}
            <ValidatedLabel label="Image" />
          <ImageUploadField
            name='image'
            control={control}
            label='Image URL'
            rules={{ required: true }}
            errors={errors}
          />

          {/* Source Logo */}
          <ValidatedLabel label="Source Logo" />
            <ImageUploadField
            name='sourceLogo'
            control={control}
            label='Source Logo'
            rules={{ required: true }}
            errors={errors}
          />

          {/* Redirect Link */}
          <ValidatedTextField
            name="redirectLink"
            control={control}
            label="Redirect Link"
            placeholder="Enter redirect link"
            errors={errors}
          />

          {/* Status */}
          <div>
            <label className="block mb-1">Status</label>
            <select
              {...register("status")}
              className="select select-bordered w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={closeDrawer}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Drawer>
    </>
  );
};

export default Press;
