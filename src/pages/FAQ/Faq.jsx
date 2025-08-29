import React, { useEffect, useState } from 'react'
import DataTable from '../../components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { AddFaq, getCategory, getFaq } from '../../api-services/cms-services'; // Assuming createFaq will be added later; using fetch for now
import ToastNotification from '../../components/Notification/ToastNotification';
import { faqColumn } from '../../components/TableHeader';
import { useForm } from 'react-hook-form';
import ValidatedTextField from '../../components/Form/ValidatedTextField';
import ValidatedTextArea from '../../components/Form/ValidatedTextArea';
import ValidatedLabel from '../../components/Form/ValidatedLabel';
import ValidatedSearchableSelectField from '../../components/Form/ValidatedSearchableSelectField';

const Faq = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [totalDataCount, setTotalDataCount] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [categoryData, setCategoryData] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [query, setQuery] = useState({
        limit: 10,
        page_no: 1,
        search: ''
    })
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            category_xid: ''
        }
    });

    const handleCreate = () => {
        setIsModalOpen(true);
        reset(); // Reset form fields when opening modal
    }

    const fetchFaqs = async () => {
        try {
            const response = await getFaq(query.page_no, query.limit, '');

            console.log('Response:', response.data.data);
            if (response?.data?.success) {
                setData(response?.data?.data || []);
                setTotalDataCount(response?.data?.data?.pagination?.totalItems || 0);
            } else {
                ToastNotification.error("Error fetching data");
            }
        } catch (error) {
            console.error('Error fetching:', error);
            ToastNotification.error('Failed to fetch data');
        }
    };
    const fetchCategory = async () => {
        try {
            const response = await getCategory(query.page_no, query.limit, '');

            console.log('Categry:', response.data.data);
            if (response?.data?.success) {
                const mapped = response?.data?.data?.map(item => ({
                    label: item?.name?.toUpperCase(),
                    value: item?.id
                }))
                console.log(mapped, "mapped")
                setCategoryData(mapped);
                setTotalDataCount(response?.data?.data?.pagination?.totalItems || 0);
            } else {
                ToastNotification.error("Error fetching data");
            }
        } catch (error) {
            console.error('Error fetching:', error);
            ToastNotification.error('Failed to fetch data');
        }
    };

    const onSubmit = async (formData) => {
        try {
            const response = await AddFaq({
                question : formData.question,
                answer : formData.answer,
                category_xid : formData.category_xid,
                isFeatured : formData.isFeatured
            });
            if (response) {
                ToastNotification.success("FAQ added successfully!");
                fetchFaqs();
                setIsModalOpen(false);
            } else {
                ToastNotification.error("Failed to add tag.");
            }
        } catch {
            ToastNotification.error("Something went wrong!");
        }
    };

    const handleEdit = (data) => {
        navigate(`/faq/${data?.id}`)
    }

    useEffect(() => {
        fetchFaqs();
    }, [query.page_no]);

    const onPageChange = (pageNo) => {
        setQuery((prevQuery) => ({
            ...prevQuery,
            page_no: pageNo.pageIndex + 1
        }));
    };

    useEffect(() => {
        if (isModalOpen) {
            fetchCategory()
        }
    }, [isModalOpen])

    return (
        <>
            <Toaster />
            <DataTable
                columns={faqColumn({
                    handleEdit
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-bold">Create FAQ</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <ValidatedTextField
                                    name='question'
                                    control={control}
                                    rules={{ required: true }}
                                    label='Question'
                                    placeholder="Write a Question!"
                                    errors={errors}
                                    helperText='Question is Required!'

                                />
                            </div>

                            <div>
                                <ValidatedTextArea
                                    name="answer"
                                    control={control}
                                    label="Answers"
                                    errors={errors}
                                    className="col-span-2"
                                    placeholder="Write Answer"
                                    rows={4}
                                    rules={{ required: "Answer is required" }}
                                />

                            </div>

                            <div className="flex items-center">
                                <input
                                    id="isFeatured"
                                    type="checkbox"
                                    {...register('isFeatured')}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                                    Is Featured
                                </label>
                            </div>

                            <div>
                                <ValidatedLabel label="Select category" />
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
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default Faq