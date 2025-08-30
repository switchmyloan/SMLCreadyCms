import React, { useEffect, useState } from 'react';
import DataTable from '../../components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AddFaq, getCategory, getFaq, getPress, updateFaq } from '../../api-services/cms-services'; // Added updateFaq
import ToastNotification from '../../components/Notification/ToastNotification';
import { faqColumn, pressColumn } from '../../components/TableHeader';
import { useForm } from 'react-hook-form';
import ValidatedTextField from '../../components/Form/ValidatedTextField';
import ValidatedTextArea from '../../components/Form/ValidatedTextArea';
import ValidatedLabel from '../../components/Form/ValidatedLabel';
import ValidatedSearchableSelectField from '../../components/Form/ValidatedSearchableSelectField';

const Press = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [totalDataCount, setTotalDataCount] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [categoryData, setCategoryData] = useState([]);
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
    const [selectedFaq, setSelectedFaq] = useState(null); // Store FAQ for editing

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue, // Added to set form values for editing
    } = useForm({
        defaultValues: {
            category_xid: '',
            question: '',
            answer: '',
            isFeatured: false,
        },
    });

    const handleCreate = () => {
        setIsModalOpen(true);
        setIsEditMode(false); // Set to create mode
        reset(); // Reset form for creating new FAQ
    };

    const handleEdit = (faq) => {
        console.log(faq, "faqqq")
        setIsEditMode(true); // Set to edit mode
        setSelectedFaq(faq?.id); // Store the FAQ data
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

    const fetchCategory = async () => {
        try {
            const response = await getCategory(query.page_no, query.limit, '');
            if (response?.data?.success) {
                const mapped = response?.data?.data?.map((item) => ({
                    label: item?.name?.toUpperCase(),
                    value: item?.id,
                }));
                setCategoryData(mapped);
            } else {
                ToastNotification.error('Error fetching categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            ToastNotification.error('Failed to fetch categories');
        }
    };

    const onSubmit = async (formData) => {
        try {
            if (isEditMode) {
                const data = {
                    question: formData.question,
                    answer: formData.answer,
                    category_xid: formData.category_xid,
                    isFeatured: formData.isFeatured,
                }
                const response = await updateFaq({ id: selectedFaq, ...data });
                if (response?.data?.success) {
                    ToastNotification.success('FAQ updated successfully!');
                    fetchFaqs();
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setSelectedFaq(null);
                    reset();
                } else {
                    ToastNotification.error('Failed to update FAQ.');
                }
            } else {
                // Create FAQ
                const response = await AddFaq({
                    question: formData.question,
                    answer: formData.answer,
                    category_xid: formData.category_xid,
                    isFeatured: formData.isFeatured,
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

    useEffect(() => {
        if (isModalOpen) {
            fetchCategory();
        }
    }, [isModalOpen]);


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

           

        </>
    );
};

export default Press;
