import React, { useEffect, useState } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { getBlogs } from '@api/Modules/BlogsApi';
import ToastNotification from '@components/Notification/ToastNotification';
import { blogColumn } from '@components/TableHeader';
import Drawer from '../../../components/Drawer';
import ValidatedTextField from "../../../components/Form/ValidatedTextField";
import ImageUploadField from "../../../components/Form/ImageUploadField";
import ValidatedLabel from "../../../components/Form/ValidatedLabel";
import ValidatedTextArea from "../../../components/Form/ValidatedTextArea";
import { useForm } from "react-hook-form";


const Banner = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false); // N
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    // totalDataCount: totalDataCount ? totalDataCount : 1
  })
  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: ''
  })



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
      file: "",
      status: "active",
    },
  });

  
  const handleCreate = () => {
    setIsDrawerOpen(true);
    setIsEditMode(false);
    reset();
  };


  const handleEdit = (blog) => {
    setIsEditMode(true);
    setSelectedBlog(blog?.id);
    setIsDrawerOpen(true);

    // prefill form
    const fullImageUrl = blog.image ? `${imageUrl + blog.image}` : "";
    setValue("title", blog.title);
    setValue("description", blog.description);
    setValue("file", fullImageUrl);
    setValue("status", blog.status || "active");
  };

  const fetchBlogs = async () => {
    try {
     setLoading(true); 
      const response = await getBlogs(query.page_no, query.limit, '');

      console.log('Response:', response.data.data);
      if (response?.data?.success) {
        setData(response?.data?.data?.data || []);
        setTotalDataCount(response?.data?.data?.pagination?.totalItems || 0);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error('Error fetching:', error);
    //   ToastNotification.error('Failed to fetch data');
      // router.push('/login');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchBlogs();
  }, [query.page_no]);

  const onPageChange = (pageNo) => {
    // console.log(pageNo.pageIndex, 'onPageChange');
    setQuery((prevQuery) => {
      // console.log(prevQuery); // Log the previous query state
      return {
        ...prevQuery,
        page_no: pageNo.pageIndex + 1 // Increment page number by 1
      };
    });
  };

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        const response = await updateBlog({ id: selectedBlog, ...formData });
        if (response?.data?.success) {
          ToastNotification.success("Blog updated successfully!");
          fetchBlogs();
          closeDrawer();
        } else {
          ToastNotification.error("Failed to update Blog.");
        }
      } else {
        const response = await AddBlog(formData);
        if (response?.data?.success) {
          ToastNotification.success("Blog created successfully!");
          fetchBlogs();
          closeDrawer();
        } else {
          ToastNotification.error("Failed to create Blog.");
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
    setSelectedBlog(null);
    reset();
  };
  return (
    <>
      <Toaster />
      <DataTable
        columns={blogColumn({
          handleEdit
        })}
        title='Banner'
        data={[]}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}
      />




      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={isEditMode ? "Update Banner" : "Create Banner"}
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
            name="file"
            control={control}
            label="Image"
            rules={{ required: true }}
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
  )
}

export default Banner
