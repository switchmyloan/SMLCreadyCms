import React, { useEffect, useState } from 'react';
import DataTable from '../../components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { AddFaq, AddPress, getCategory, getFaq, getPress, updateFaq } from '../../api-services/cms-services'; // Added updateFaq
import ToastNotification from '../../components/Notification/ToastNotification';
import { pressColumn } from '../../components/TableHeader';
import { useForm } from 'react-hook-form';
import PressModal from '../Modals/PressModal';

const Press = () => {
    const [data, setData] = useState([]);
    const [totalDataCount, setTotalDataCount] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('')
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
    const [isEditMode, setIsEditMode] = useState(false); // Track create vs edit mode
    const [selectedPress, setSelectedPress] = useState(null); // Store FAQ for editing

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
            status: "",
        },
    });

    const handleCreate = () => {
        setIsModalOpen(true);
        setIsEditMode(false);
        reset();
    };

    const handleEdit = (faq) => {
        console.log(faq, "faqqq")
        setIsEditMode(true); // Set to edit mode
        setSelectedPress(faq?.id); // Store the FAQ data
        setIsModalOpen(true);
        // Populate form with FAQ data
        setValue('question', faq.question);
        setValue('answer', faq.answer);
        setValue('category_xid', faq.category_xid);
        setValue('isFeatured', faq.isFeatured || false);
    };

    const fetchPress = async () => {
        try {
            const response = await getPress(query.page_no, query.limit, '');
            if (response?.data?.success) {
                setData(response?.data?.data?.data || []); // Adjust based on actual response
                setTotalDataCount(response?.data?.data?.pagination?.totalItems || 0);
            } else {
                ToastNotification.error('Error fetching data');
            }
        } catch (error) {
            console.error('Error fetching:', error);
            ToastNotification.error('Failed to fetch data');
        }
    };

    const onSubmit = async (formData) => {
        try {
            console.log(formData, "formdata")
            console.table(
                {
                     title: formData?.title,
                    description: formData?.description,
                    image: formData?.image,
                    sourceLogo: formData?.sourceLogo,
                    redirectLink: formData?.redirectLink,
                    status: formData?.status
                }
            )
            if (isEditMode) {
                const data = {
                    question: formData.question,
                    answer: formData.answer,
                    category_xid: formData.category_xid,
                    isFeatured: formData.isFeatured,
                }
                const response = await updateFaq({ id: selectedPress, ...data });
                if (response?.data?.success) {
                    ToastNotification.success('Press updated successfully!');
                    fetchPress();
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setSelectedPress(null);
                    reset();
                } else {
                    ToastNotification.error('Failed to update Press.');
                }
            } else {
                // Create FAQ
                const response = await AddPress({
                    title: formData?.title,
                    description: formData?.description,
                    image: formData?.image,
                    sourceLogo: formData?.sourceLogo,
                    redirectLink: formData?.redirectLink,
                    status: formData?.status
                });
                if (response?.data?.success) {
                    ToastNotification.success('FAQ added successfully!');
                    fetchFaqs();
                    setIsModalOpen(false);
                    reset();
                } else {
                    ToastNotification.error('Failed to add FAQ.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            ToastNotification.error('Something went wrong!');
        }
    };

    const onPageChange = (pageNo) => {
        setQuery((prevQuery) => ({
            ...prevQuery,
            page_no: pageNo.pageIndex + 1,
            limit: pagination.pageSize, // Sync limit with pageSize
        }));
    };

    useEffect(() => {
        fetchPress();
    }, [query.page_no, query.limit]);




    console.log(data, "data???")
    return (
        <>
            <Toaster />
            <DataTable
                columns={pressColumn({
                    handleEdit,
                })}
                title="Press Room"
                data={data}
                totalDataCount={totalDataCount}
                onCreate={handleCreate}
                createLabel="Create"
                onPageChange={onPageChange}
                setPagination={setPagination}
                pagination={pagination}
            />

            {/* Modal */}
            <PressModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                reset={reset}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                control={control}
                register={register}
                errors={errors}
                setGlobalFilter={setGlobalFilter}
            />
        </>
    );
};

export default Press;
