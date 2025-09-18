import React, { useEffect, useState } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import ToastNotification from '@components/Notification/ToastNotification';
import Drawer from '../../../components/Drawer';
import ValidatedTextField from "../../../components/Form/ValidatedTextField";
import ImageUploadField from "../../../components/Form/ImageUploadField";
import ValidatedLabel from "../../../components/Form/ValidatedLabel";
import ValidatedTextArea from "../../../components/Form/ValidatedTextArea";
import { useForm } from "react-hook-form";
import { AddBanner, getBanners, getBannerById, UpdateBanner, deleteBanner } from '../../../api-services/Modules/BannerApi';
import { bannerColumn } from '../../../components/TableHeader';
import SubmitBtn from '@components/Form/SubmitBtn'
import ConfirmModal from '../../../components/ConfirmationationModal';


const Banner = () => {
  const imageUrl = import.meta.env.VITE_IMAGE_URL
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
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
      bannerTitle: "",
      bannerDescription: "",
      bannerImage: "",
      bannerBtn: '',
      bannerLink: '',
      isActive: true,
    },
  });

  const handleCreate = () => {
    setIsDrawerOpen(true);
    setIsEditMode(false);
    reset();
  };

  const handleEdit = async (data) => {
    try {
      // setLoading(true);
      const response = await getBannerById(data.id);
      if (response?.data?.success) {
        const banner = response.data.data; 
        console.log(banner, 'banner data from getBannerById');

        setIsEditMode(true);
        setSelectedBanner(data.id);
        setIsDrawerOpen(true);
        setValue('bannerTitle', banner.bannerTitle || '');
        setValue('bannerDescription', banner.bannerDescription || '');
        setValue('bannerBtn', banner.bannerBtn || '');
        setValue('bannerLink', banner.bannerLink || '');
        setValue('isActive', banner.isActive !== undefined ? banner.isActive : true);

        if (banner.bannerImage) {
          const fullImageUrl = `${imageUrl}${banner?.bannerImage}`;
          console.log(fullImageUrl, "fullImageUrl")
          setValue('bannerImage', fullImageUrl);
        } else {
          setValue('bannerImage', '');
        }
      } else {
        ToastNotification.error('Failed to fetch banner details');
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
      ToastNotification.error('Failed to fetch banner details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getBanners(query.page_no, query.limit, '');

      console.log('Response:', response.data.data.data);
      if (response?.data?.success) {
        setData(response?.data?.data?.rows || []);
        setTotalDataCount(response?.data?.data?.pagination?.total || 0);
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
    fetchBanners();
  }, [query.page_no]);

  const onPageChange = (pageNo) => {
    setQuery((prevQuery) => {
      return {
        ...prevQuery,
        page_no: pageNo.pageIndex + 1
      };
    });
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('bannerTitle', formData.bannerTitle);
      formDataToSend.append('bannerDescription', formData.bannerDescription);
      formDataToSend.append('bannerBtn', formData.bannerBtn);
      formDataToSend.append('bannerLink', formData.bannerLink);
      formDataToSend.append('isActive', formData.isActive);
      if (formData.bannerImage && formData.bannerImage instanceof File) {
        formDataToSend.append('bannerImage', formData.bannerImage);
      }

      if (isEditMode) {
        // Call PATCH API for updating banner
        const response = await UpdateBanner(selectedBanner, formDataToSend);
        if (response?.data?.success) {
          ToastNotification.success('Banner Updated Successfully!');
          fetchBanners();
          closeDrawer();
           setLoading(false);
        } else {
          ToastNotification.error('Failed to Update Banner!');
          setLoading(false);
        }
      } else {
        // Call POST API for creating banner
        const response = await AddBanner(formDataToSend);
        if (response?.data?.success) {
          ToastNotification.success('Banner created successfully!');
          fetchBanners();
          closeDrawer();
          setLoading(false);
        } else {
          ToastNotification.error('Failed to create Banner!');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      ToastNotification.error('Something went wrong!');
      setLoading(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setIsEditMode(false);
    setSelectedBanner(null);
    reset();
  };

  const handleDeleteClick = (id) => {
    setBannerToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await deleteBanner(bannerToDelete);
      if (response?.data?.success) {
        ToastNotification.success("Banner deleted successfully!");
        fetchBanners();
      } else {
        ToastNotification.error("Failed to delete banner!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      ToastNotification.error("Something went wrong!");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setBannerToDelete(null);
    }
  };

  return (
    <>
      <Toaster />
      <DataTable
        columns={
          bannerColumn(
            {
              handleEdit,
              handleDelete : handleDeleteClick,
            })}
        title='Banners'
        data={data}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}
      />

       <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        loading={loading}
        title="Delete Confirmation"
        message="Are you sure you want to delete this banner? This action cannot be undone."
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={isEditMode ? "Update Banner" : "Create Banner"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ValidatedTextField
            name="bannerTitle"
            control={control}
            rules={{ required: true }}
            label="Title"
            placeholder="Enter Title"
            errors={errors}
            helperText="Title is required!"
          />

          <ValidatedTextField
            name="bannerBtn"
            control={control}
            rules={{ required: true }}
            label="Button Text"
            placeholder="Enter Button Text"
            errors={errors}
            helperText="Button Text is required!"
          />

          <ValidatedTextField
            name="bannerLink"
            control={control}
            rules={{ required: true }}
            label="Button Link"
            placeholder="Enter Button Link"
            errors={errors}
            helperText="Button Link is required!"
          />

          <ValidatedTextArea
            name="bannerDescription"
            control={control}
            label="Description"
            errors={errors}
            placeholder="Enter description"
            rows={4}
            rules={{ required: "Description is required" }}
          />

          <ValidatedLabel label="Image" />
          <ImageUploadField
            name="bannerImage"
            control={control}
            label="Image"
            rules={{ required: true }}
            errors={errors}
          />

          <div>
            <label className="block mb-1">Status</label>
            <select
              {...register("isActive")}
              className="select select-bordered w-full"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={closeDrawer}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <div>
              <SubmitBtn loading={loading} label={isEditMode ? "Update" : "Submit"} />
            </div>
          </div>
        </form>
      </Drawer>
    </>
  )
}

export default Banner
