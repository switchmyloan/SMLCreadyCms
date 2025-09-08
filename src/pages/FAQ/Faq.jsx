import React, { useEffect, useState } from 'react';
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { AddFaq, getFaq, updateFaq } from '../../api-services/Modules/FaqApi';
import ToastNotification from '@components/Notification/ToastNotification';
import { faqColumn } from '@components/TableHeader';
import { useForm } from 'react-hook-form';
import ValidatedTextField from '@components/Form/ValidatedTextField';
import ValidatedTextArea from '@components/Form/ValidatedTextArea';
import ValidatedLabel from '@components/Form/ValidatedLabel';
import ValidatedSearchableSelectField from '@components/Form/ValidatedSearchableSelectField';
import Drawer from '../../components/Drawer';
import { getCategory } from '../../api-services/Modules/CategoryApi';
import {AddCategory} from "../../api-services/Modules/CategoryApi";

const Faq = () => {
    // const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [totalDataCount, setTotalDataCount] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [categoryData, setCategoryData] = useState([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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

    const fetchFaqs = async () => {
        try {
            const response = await getFaq(query.page_no, query.limit, '');
            if (response?.data?.success) {
                setData(response?.data?.data?.data || []); // Adjust based on actual response
                setTotalDataCount(response?.data?.data?.pagination?.total || 0);
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
                const mapped = response?.data?.data?.data?.map((item) => ({
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
        fetchFaqs();
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
                columns={faqColumn({
                    handleEdit,
                })}
                title="FAQ"
                data={data}
                totalDataCount={totalDataCount}
                onCreate={handleCreate}
                createLabel="Create"
                onPageChange={onPageChange}
                setPagination={setPagination}
                pagination={pagination}
            />

            <Drawer
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setSelectedFaq(null);
                    reset();
                }}
                title={isEditMode ? "Update FAQ" : "Create FAQ"}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Question */}
                    <ValidatedTextField
                        name="question"
                        control={control}
                        rules={{ required: true }}
                        label="Question"
                        placeholder="Write a Question!"
                        errors={errors}
                        helperText="Question is required!"
                    />

                    {/* Answer */}
                    <ValidatedTextArea
                        name="answer"
                        control={control}
                        label="Answer"
                        errors={errors}
                        placeholder="Write Answer"
                        rows={4}
                        rules={{ required: "Answer is required" }}
                    />

                    {/* Is Featured */}
                    <div className="flex items-center">
                        <input
                            id="isFeatured"
                            type="checkbox"
                            {...register("isFeatured")}
                            className="checkbox checkbox-primary"
                        />
                        <label htmlFor="isFeatured" className="ml-2 block text-sm">
                            Is Featured
                        </label>
                    </div>

                    {/* Category */}
                    <div className="flex items-center justify-between">
                        <ValidatedLabel label="Select category" />
                        <button
                            type="button"
                            className="btn btn-xs btn-outline btn-primary"
                            onClick={() => setIsCategoryModalOpen(true)}
                        >
                            + Create
                        </button>
                    </div>
                    <ValidatedSearchableSelectField
                        name="category_xid"
                        control={control}
                        options={categoryData}
                        errors={errors}
                        rules={{ required: "Category is required" }}
                        setGlobalFilter={setGlobalFilter}
                        globalFilter={globalFilter}
                        placeholder="Select category"
                    />

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => onClose()} className="btn">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {isEditMode ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </Drawer>

            {isCategoryModalOpen && (
                <dialog open className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Create Category</h3>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const name = formData.get("name");
                                const description = formData.get("description");

                                const categoryData = {
                                    name : name,
                                    description: description
                                }
                                console.log(categoryData, "formadadadadada")
                               

                                try {
                                    const response = await AddCategory(categoryData); // API call
                                    if (response?.data?.success) {
                                        ToastNotification.success("Category created successfully!");
                                        fetchCategory(); // refresh dropdown
                                        setIsCategoryModalOpen(false);
                                    } else {
                                        ToastNotification.error("Failed to create category.");
                                    }
                                } catch (error) {
                                    console.log('err', error)
                                    ToastNotification.error("Something went wrong!");
                                }
                            }}
                            className="space-y-4 mt-4"
                        >

                            <div>
                                <ValidatedLabel label="Category Name" />
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="Category name"
                                    className="input input-bordered w-full"
                                    required
                                />
                            </div>

                            <div>
                                <ValidatedLabel label="Category Description" />
                                <textarea
                                    name="description"
                                    placeholder="Category Description"
                                    className="textarea textarea-bordered w-full"
                                    rows={5}
                                />
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setIsCategoryModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </dialog>
            )}


        </>
    );
};

export default Faq;
