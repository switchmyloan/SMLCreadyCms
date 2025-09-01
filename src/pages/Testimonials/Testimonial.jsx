import React, { useEffect, useState } from 'react';
import DataTable from '../../components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getTestimonials, addTestimonial, updateTestimonial } from '../../api-services/cms-services';
import ToastNotification from '../../components/Notification/ToastNotification';
import { testimonialsColumn } from '../../components/TableHeader';
import { useForm } from 'react-hook-form';
import ValidatedTextField from '../../components/Form/ValidatedTextField';
import ValidatedTextArea from '../../components/Form/ValidatedTextArea';
import ValidatedLabel from '../../components/Form/ValidatedLabel';
import ImageUploadField from '../../components/Form/ImageUploadField';

const Testimonials = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [totalDataCount, setTotalDataCount] = useState(0);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [query, setQuery] = useState({
        limit: 10,
        page_no: 1,
        search: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        defaultValues: {
            name: '',
            designation: '',
            company: '',
            testimonial: '',
            image: null, // Expect a File object or null for create, URL string for edit
            order: 1,
            isActive: true,
        },
    });

    const handleCreate = () => {
        setIsModalOpen(true);
        setIsEditMode(false);
        reset();
    };

    const handleEdit = (testimonial) => {
        console.log('Editing Testimonial:', testimonial);
        setIsEditMode(true);
        setSelectedTestimonial(testimonial?.id);
        setIsModalOpen(true);
        setValue('name', testimonial.name || '');
        setValue('company', testimonial.company || '');
        setValue('designation', testimonial.designation || '');
        setValue('testimonial', testimonial.testimonial || '');
        setValue('image', testimonial.image || null); // Set to URL string or null
        setValue('order', testimonial.order || 1);
        setValue('isActive', testimonial.isActive ?? true);
    };

    const fetchTestimonials = async () => {
        try {
            const response = await getTestimonials(query.page_no, query.limit, '');
            console.log('Fetch Testimonials Response:', response);
            if (response?.data?.success) {
                setData(response?.data?.data || []);
                setTotalDataCount(response?.data?.pagination?.total || 0);
            } else {
                ToastNotification.error(response?.data?.message || 'Error fetching testimonials');
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            ToastNotification.error('Failed to fetch testimonials');
        }
    };

    const handleAddTestimonial = async (formData) => {
    try {
        const sanitizedData = {
            name: formData.name?.trim() || '',
            designation: formData.designation?.trim() || '',
            company: formData.company?.trim() || '',
            testimonial: formData.testimonial?.trim() || '',
            image: typeof formData.image === 'string' ? formData.image : '', // Expect a URL string
            isActive: formData.isActive ?? true,
            order: Number(formData.order) || 1,
        };

        if (!sanitizedData.name) {
            ToastNotification.error('Name is required');
            return;
        }

        console.log('Add Testimonial Payload:', sanitizedData);

        const response = await addTestimonial(sanitizedData);
        if (response?.data?.success) {
            ToastNotification.success('Testimonial added successfully!');
            await fetchTestimonials();
            setIsModalOpen(false);
            reset();
        } else {
            ToastNotification.error(response?.data?.message || 'Failed to add testimonial.');
        }
    } catch (error) {
        console.error('Error adding testimonial:', error);
        ToastNotification.error(error.message || 'Something went wrong!');
    }
};

    const handleUpdateTestimonial = async (formData) => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name?.trim() || '');
            formDataToSend.append('designation', formData.designation?.trim() || '');
            formDataToSend.append('company', formData.company?.trim() || '');
            formDataToSend.append('testimonial', formData.testimonial?.trim() || '');
            if (formData.image instanceof File) {
                formDataToSend.append('image', formData.image);
            } else if (formData.image && typeof formData.image === 'string') {
                formDataToSend.append('image', formData.image);
            }
            formDataToSend.append('isActive', String(formData.isActive ?? true));
            formDataToSend.append('order', String(Number(formData.order) || 1));

            console.log('Update Testimonial FormData:', Array.from(formDataToSend.entries()));

            const response = await updateTestimonial({ id: selectedTestimonial, ...Object.fromEntries(formDataToSend) });
            if (response?.data?.success) {
                ToastNotification.success('Testimonial updated successfully!');
                await fetchTestimonials();
                setIsModalOpen(false);
                setIsEditMode(false);
                setSelectedTestimonial(null);
                reset();
            } else {
                ToastNotification.error(response?.data?.message || 'Failed to update testimonial.');
            }
        } catch (error) {
            console.error('Error updating testimonial:', error);
            ToastNotification.error(error.message || 'Something went wrong!');
        }
    };

    const onSubmit = async (formData) => {
        console.log('Form Data:', formData);

        if (!formData.name?.trim()) {
            ToastNotification.error('Name is required');
            return;
        }

        if (isEditMode) {
            await handleUpdateTestimonial(formData);
        } else {
            await handleAddTestimonial(formData);
        }
    };

    const onPageChange = (pageNo) => {
        setQuery((prevQuery) => ({
            ...prevQuery,
            page_no: pageNo.pageIndex + 1,
            limit: pagination.pageSize,
        }));
    };

    useEffect(() => {
        fetchTestimonials();
    }, [query.page_no, query.limit]);

    return (
        <>
            <Toaster />
            <DataTable
                columns={testimonialsColumn({ handleEdit })}
                title="Testimonials"
                data={data}
                totalDataCount={totalDataCount}
                onCreate={handleCreate}
                createLabel="Create"
                onPageChange={onPageChange}
                setPagination={setPagination}
                pagination={pagination}
            />

            {isModalOpen && (
                <dialog id="testimonial_modal" className="modal modal-open">
                    <div className="modal-box w-full max-w-xl">
                        <h2 className="mb-4 text-xl font-bold">
                            {isEditMode ? 'Update Testimonial' : 'Create Testimonial'}
                        </h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <ValidatedTextField
                                    name="name"
                                    control={control}
                                    rules={{ required: 'Name is required' }}
                                    label="Name"
                                    placeholder="Enter name"
                                    errors={errors}
                                />
                                <ValidatedTextField
                                    name="designation"
                                    control={control}
                                    rules={{ required: 'Designation is required' }}
                                    label="Designation"
                                    placeholder="Enter designation"
                                    errors={errors}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ValidatedTextField
                                    name="company"
                                    control={control}
                                    rules={{ required: 'Company is required' }}
                                    label="Company"
                                    placeholder="Enter company"
                                    errors={errors}
                                />
                                <ValidatedTextField
                                    name="order"
                                    type="number"
                                    control={control}
                                    rules={{ required: 'Order is required' }}
                                    label="Order"
                                    placeholder="Enter order"
                                    errors={errors}
                                />
                            </div>
                            <ValidatedLabel label="Upload Image" />
                            <ImageUploadField
                                name="image"
                                control={control}
                                label="Upload Image"
                                errors={errors}
                                rules={{ required: 'Image is required' }}
                            />
                            <ValidatedTextArea
                                name="testimonial"
                                control={control}
                                rules={{ required: 'Testimonial is required' }}
                                label="Testimonial"
                                placeholder="Write testimonial"
                                rows={4}
                                errors={errors}
                            />
                            <div className="flex items-center">
                                <input
                                    id="isActive"
                                    type="checkbox"
                                    {...register('isActive')}
                                    className="checkbox checkbox-primary"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm">
                                    Is Active
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setIsEditMode(false);
                                        setSelectedTestimonial(null);
                                        reset();
                                    }}
                                    className="btn"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={Object.keys(errors).length > 0}
                                >
                                    {isEditMode ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}
        </>
    );
};

export default Testimonials;