// import React, { useEffect, useState } from 'react';
// import DataTable from '../../components/Table/DataTable';
// import { Toaster } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import { AddFaq, addTestimonial, getCategory, getFaq, getTestimonials, updateFaq } from '../../api-services/cms-services'; // Added updateFaq
// import ToastNotification from '../../components/Notification/ToastNotification';
// import { faqColumn, testimonialsColumn } from '../../components/TableHeader';
// import { useForm } from 'react-hook-form';
// import ValidatedTextField from '../../components/Form/ValidatedTextField';
// import ValidatedTextArea from '../../components/Form/ValidatedTextArea';
// import ValidatedLabel from '../../components/Form/ValidatedLabel';
// import ValidatedSearchableSelectField from '../../components/Form/ValidatedSearchableSelectField';
// import ImageUploadField from '../../components/Form/ImageUploadField';

// const Testimonials = () => {
//     const navigate = useNavigate();
//     const [data, setData] = useState([]);
//     const [totalDataCount, setTotalDataCount] = useState(0);
//     const [globalFilter, setGlobalFilter] = useState('');
//     const [categoryData, setCategoryData] = useState([]);
//     const [pagination, setPagination] = useState({
//         pageIndex: 0,
//         pageSize: 10,
//     });
//     const [query, setQuery] = useState({
//         limit: 10,
//         page_no: 1,
//         search: '',
//     });
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [selectedFaq, setSelectedFaq] = useState(null);

//     const {
//         control,
//         register,
//         handleSubmit,
//         formState: { errors },
//         reset,
//         setValue,
//     } = useForm({
//         defaultValues: {
//             name: '',
//             designation: '',
//             company: '',
//             testimonial: '',
//             image: ''
//         },
//     });

//     const handleCreate = () => {
//         setIsModalOpen(true);
//         setIsEditMode(false); // Set to create mode
//         reset(); // Reset form for creating new FAQ
//     };

//     const handleEdit = (faq) => {
//         console.log(faq, "faqqq")
//         setIsEditMode(true);
//         setSelectedFaq(faq?.id); // Store the FAQ data
//         setIsModalOpen(true);
//         // Populate form with FAQ data
//         setValue('name', faq.name);
//         setValue('company', faq.company);
//         setValue('designation', faq.designation);
//         setValue('testimonial', faq.testimonial || false);
//         setValue('image', faq.image || false);
//     };


//     console.log(isEditMode, "isEdits")

//     const fetchFaqs = async () => {
//         try {
//             const response = await getTestimonials(query.page_no, query.limit, '');
//             if (response?.data?.success) {
//                 setData(response?.data?.data || []); // Adjust based on actual response
//                 setTotalDataCount(response?.data?.data?.pagination?.total || 0);
//             } else {
//                 ToastNotification.error('Error fetching data');
//             }
//         } catch (error) {
//             console.error('Error fetching:', error);
//             ToastNotification.error('Failed to fetch data');
//         }
//     };

//     const fetchCategory = async () => {
//         try {
//             const response = await getTestimonials(query.page_no, query.limit, '');
//             if (response?.data?.success) {
//                 const mapped = response?.data?.data?.map((item) => ({
//                     label: item?.name?.toUpperCase(),
//                     value: item?.id,
//                 }));
//                 setCategoryData(mapped);
//             } else {
//                 ToastNotification.error('Error fetching categories');
//             }
//         } catch (error) {
//             console.error('Error fetching categories:', error);
//             ToastNotification.error('Failed to fetch categories');
//         }
//     };

//     const onSubmit = async (formData) => {
//         console.log('Form Data:', formData);
//         try {
//             // const sanitizedData = {
//             //     name: formData.name || '', // Fallback to empty string if null/undefined
//             //     designation: formData.designation || '',
//             //     company: formData.company || '',
//             //     testimonial: formData.testimonial || '',
//             //     file: formData.image || '',
//             //     isActive: formData.isActive ?? true,
//             //     order: formData.order || 1,
//             // };

//             if (isEditMode) {
//                 console.log("edit")
//                 const response = await updateTestimonial({ id: selectedTestimonial, ...sanitizedData });
//                 if (response?.data?.success) {
//                     ToastNotification.success('Testimonial updated successfully!');
//                     fetchFaqs();
//                     setIsModalOpen(false);
//                     setIsEditMode(false);
//                     setSelectedTestimonial(null);
//                     reset();
//                 } else {
//                     ToastNotification.error('Failed to update testimonial.');
//                 }
//             } else {
//                 console.log("add")
//                 const response = await addTestimonial({
//                     "name": "Alice Johnson",
//                     "designation": "Product Manager",
//                     "company": "InnovateX",
//                     "testimonial": "This platform was a game-changer for our team!",
//                     "image": "https://example.com/images/alice.jpg",
//                     "order": 1,
//                     "isActive": true
//                 });
//                 if (response?.data?.success) {
//                     ToastNotification.success('Testimonial added successfully!');
//                     fetchFaqs();
//                     setIsModalOpen(false);
//                     reset();
//                 } else {
//                     ToastNotification.error('Failed to add testimonial.');
//                 }
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             ToastNotification.error('Something went wrong!');
//         }
//     };

//     const onPageChange = (pageNo) => {
//         setQuery((prevQuery) => ({
//             ...prevQuery,
//             page_no: pageNo.pageIndex + 1,
//             limit: pagination.pageSize, // Sync limit with pageSize
//         }));
//     };

//     useEffect(() => {
//         fetchFaqs();
//     }, [query.page_no, query.limit]);

//     useEffect(() => {
//         if (isModalOpen) {
//             fetchCategory();
//         }
//     }, [isModalOpen]);


//     console.log(data, "data???")
//     return (
//         <>
//             <Toaster />
//             <DataTable
//                 columns={testimonialsColumn({
//                     handleEdit,
//                 })}
//                 title="Testimonials"
//                 data={data}
//                 totalDataCount={totalDataCount}
//                 onCreate={handleCreate}
//                 createLabel="Create"
//                 onPageChange={onPageChange}
//                 setPagination={setPagination}
//                 pagination={pagination}
//             />

//             {isModalOpen && (
//                 <dialog id="faq_modal" className="modal modal-open">
//                     <div className="modal-box w-full max-w-xl">
//                         <h2 className="mb-4 text-xl font-bold">
//                             {isEditMode ? 'Update Testimonial' : 'Create Testimonials'}
//                         </h2>
//                         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                             {/* Row 1: Name + Designation */}
//                             <div className="grid grid-cols-2 gap-4">
//                                 <ValidatedTextField
//                                     name="name"
//                                     control={control}
//                                     rules={{ required: "Name is required" }}
//                                     label="Name"
//                                     placeholder="Enter name"
//                                     errors={errors}
//                                 />

//                                 <ValidatedTextField
//                                     name="designation"
//                                     control={control}
//                                     rules={{ required: "Designation is required" }}
//                                     label="Designation"
//                                     placeholder="Enter designation"
//                                     errors={errors}
//                                 />
//                             </div>

//                             {/* Row 2: Company + Order */}
//                             <div className="grid grid-cols-2 gap-4">
//                                 <ValidatedTextField
//                                     name="company"
//                                     control={control}
//                                     rules={{ required: "Company is required" }}
//                                     label="Company"
//                                     placeholder="Enter company"
//                                     errors={errors}
//                                 />

//                                 <ValidatedTextField
//                                     name="order"
//                                     type="number"
//                                     control={control}
//                                     rules={{ required: "Order is required" }}
//                                     label="Order"
//                                     placeholder="Enter order"
//                                     errors={errors}
//                                 />
//                             </div>

//                             {/* Row 3: Image URL */}

//                             <ValidatedLabel label="Upload Image" />
//                             <ImageUploadField
//                                 name="image"
//                                 control={control}
//                                 label="Upload Image"
//                                 errors={errors}
//                                 rules={{ required: "Image is required" }}
//                             />

//                             {/* Row 4: Testimonial */}
//                             <ValidatedTextArea
//                                 name="testimonial"
//                                 control={control}
//                                 rules={{ required: "Testimonial is required" }}
//                                 label="Testimonial"
//                                 placeholder="Write testimonial"
//                                 rows={4}
//                                 errors={errors}
//                             />

//                             {/* Row 5: Is Active */}
//                             <div className="flex items-center">
//                                 <input
//                                     id="isActive"
//                                     type="checkbox"
//                                     {...register("isActive")}
//                                     className="checkbox checkbox-primary"
//                                 />
//                                 <label htmlFor="isActive" className="ml-2 block text-sm">
//                                     Is Active
//                                 </label>
//                             </div>

//                             {/* Actions */}
//                             <div className="flex justify-end gap-2 mt-4">
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setIsModalOpen(false);
//                                         setIsEditMode(false);
//                                         setSelectedTestimonial(null);
//                                         reset();
//                                     }}
//                                     className="btn"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button type="submit" className="btn btn-primary">
//                                     {isEditMode ? "Update" : "Create"}
//                                 </button>
//                             </div>
//                         </form>

//                     </div>
//                 </dialog>
//             )}

//         </>
//     );
// };

// export default Testimonials;



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