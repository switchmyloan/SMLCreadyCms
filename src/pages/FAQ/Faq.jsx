import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { AddFaq, DeleteFaq, getFaq, updateFaq } from '../../api-services/Modules/FaqApi';
import ToastNotification from '@components/Notification/ToastNotification';
import { faqColumn } from '@components/TableHeader';
import { useForm } from 'react-hook-form';
import ValidatedTextField from '@components/Form/ValidatedTextField';
import ValidatedTextArea from '@components/Form/ValidatedTextArea';
import ValidatedLabel from '@components/Form/ValidatedLabel';
import ValidatedSearchableSelectField from '@components/Form/ValidatedSearchableSelectField';
import Drawer from '../../components/Drawer';
import { getCategory } from '../../api-services/Modules/CategoryApi';
import { AddCategory } from '../../api-services/Modules/CategoryApi';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ConfirmModal from '../../components/ConfirmationationModal';

// Yup validation schema
const validationSchema = Yup.object().shape({
  question: Yup.string()
    .required('Question is required')
    .min(2, 'Question must be at least 2 characters')
    .max(100, 'Question cannot exceed 100 characters')
    .trim(),
  answer: Yup.string()
    .required('Answer is required')
    .min(10, 'Answer must be at least 10 characters')
    .max(500, 'Answer cannot exceed 500 characters')
    .trim(),
  category_xid: Yup.string()
    .required('Category is required')
    .test('is-valid-category', 'Invalid category', function (value) {
      return value !== ''; // Ensure it’s not empty; you can enhance this to check against categoryData if needed
    }),
  isFeatured: Yup.boolean(),
});

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Faq = () => {

  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [globalFilter, setGlobalFilter] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [module, setModule] = useState([
    {
      label: "FAQ",
      value: 'faq'
    },
    {
      label: "BLOG",
      value: 'blog'
    },
  ]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteFaq, setDeleteFaq] = useState(null)

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [tablePagination, setTablePagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [query, setQuery] = useState({
    page_no: 1,
    limit: 10,
    search: '',
    filter_date: '',
    startDate: null,
    endDate: null,
    status: 'success',
    category_xid: '',
    is_featured: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('');


  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      category_xid: '',
      question: '',
      answer: '',
      module:'',
      isFeatured: false,
    },
  });

  const handleCreate = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    reset();
  };

  const handleFeaturedFilter = useCallback(newValue => {
    console.log(newValue, "newalue")
    setQuery(prev => ({
      ...prev,
      is_featured: newValue, // Update the new filter
      page_no: 1
    }));
  }, []);

  const handleEdit = (faq) => {
    console.log(faq, 'faqqq');
    setIsEditMode(true);
    setSelectedFaq(faq?.id);
    setIsModalOpen(true);

    setValue('question', faq.question);
    setValue('answer', faq.answer);
    setValue('module', faq?.module);
    setValue('category_xid', faq?.category?.id);
    setValue('isFeatured', faq.isFeatured || false);
  };

  const fetchFaqs = async () => {
    try {
      setLoading(true);

      // Normal API call — no filters
      const response = await getFaq(query.page_no, query.limit, "");

      if (response?.data?.success) {
        let rows = response?.data?.data?.rows || [];

        // FRONTEND FILTERING START ---------------------

        // Global Search Filter
        if (query.search) {
          rows = rows.filter(item =>
            item.question.toLowerCase().includes(query.search.toLowerCase()) ||
            item.answer.toLowerCase().includes(query.search.toLowerCase())
          );
        }

        // Category Filter
        if (query.category_xid) {
          rows = rows.filter(item =>
            item?.category?.id == query.category_xid
          );
        }

        if (query.is_featured) {
          const isFeaturedFilter = query.is_featured == 'true'; // Convert 'true'/'false' string to boolean

          rows = rows.filter(item => {
            // Filter based on the boolean value of item.isFeatured
            return item.isFeatured == isFeaturedFilter;
          });
        }

        console.log(query.category_xid, "category")

        // Date Filter
        if (query.filter_date === "today") {
          const today = new Date().toDateString();
          rows = rows.filter(item =>
            new Date(item.createdAt).toDateString() === today
          );
        }

        if (query.filter_date === "yesterday") {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const y = yesterday.toDateString();

          rows = rows.filter(item =>
            new Date(item.createdAt).toDateString() === y
          );
        }

        // Custom Range filter
        if (query.startDate && query.endDate) {
          const start = new Date(query.startDate);
          const end = new Date(query.endDate);

          rows = rows.filter(item => {
            const c = new Date(item.createdAt);
            return c >= start && c <= end;
          });
        }



        // FRONTEND FILTERING END ---------------------

        setData(rows);
        setTotalDataCount(response?.data?.data?.pagination?.total);
      }

    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchCategory = async () => {
    try {
      const response = await getCategory(query.page_no, query.limit, '');
      if (response?.data?.success) {
        const mapped = response?.data?.data?.rows?.map((item) => ({
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
      setLoading(true);
      if (isEditMode) {
        const data = {
          question: formData?.question,
          answer: formData?.answer,
          category_xid: formData?.category_xid,
          isFeatured: formData?.isFeatured,
          module : formData?.module
        };
        const response = await updateFaq({ id: selectedFaq, ...data });
        if (response?.data?.success) {
          ToastNotification.success('FAQ updated successfully!');
          fetchFaqs();
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedFaq(null);
          setLoading(false);
          reset();
        } else {
          setLoading(false);
          ToastNotification.error('Failed to update FAQ.');
        }
      } else {
        // Create FAQ
        const response = await AddFaq({
          question: formData?.question,
          answer: formData?.answer,
          category_xid: formData?.category_xid,
          isFeatured: formData?.isFeatured,
          module : formData?.module
        });
        if (response?.data?.success) {
          ToastNotification.success('FAQ added successfully!');
          fetchFaqs();
          setIsModalOpen(false);
          reset();
          setLoading(false);
        } else {
          setLoading(false);
          ToastNotification.error('Failed to add FAQ.');
        }
      }
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      ToastNotification.error('Something went wrong!');
    }
  };


  const onPageChange = useCallback((pageInfo) => {
    setTablePagination({
      pageIndex: pageInfo.pageIndex,
      pageSize: pageInfo.pageSize,
    });
    setQuery((prevQuery) => {
      return {
        ...prevQuery,
        page_no: pageInfo.pageIndex + 1, // 1-based index for query
        limit: pageInfo.pageSize, // new limit
      };
    });
  }, []);

  const handleStatusFilter = useCallback(newStatus => {
    setQuery(prev => ({ ...prev, status: newStatus, page_no: 1 }));
  }, []);

  const onSearchHandler = useCallback(term => {
    setQuery(prev => ({ ...prev, search: term, page_no: 1 }));
  }, []);

  const debouncedSearch = useMemo(() => debounce(onSearchHandler, 300), [onSearchHandler]);

  const onFilterByDate = useCallback(type => {
    setQuery(prev => ({
      ...prev,
      filter_date: prev.filter_date === type ? "" : type,
      startDate: null,
      endDate: null
    }));
  }, []);


  const onFilterByRange = useCallback(range => {
    setQuery(prev => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
      filter_date: ""
    }));
  }, []);


  useEffect(() => {
    fetchFaqs();
  }, [query.page_no, query.limit, query.category_xid, query.is_featured]);

  useEffect(() => {
    // if (isModalOpen) {
    fetchCategory();
    // }
  }, []);

  console.log(data, 'data???');

  const handleDelete = (faq) => {
    console.log(faq)
    setDeleteFaq(faq.id)
    setConfirmOpen(true)
  }

  const deleteConfirm = async () => {

    setLoading(true);
    try {
      const response = await DeleteFaq(deleteFaq);
      if (response?.data?.success) {
        ToastNotification.success("Deleted successfully!");
        fetchFaqs();
      } else {
        ToastNotification.error("Failed to delete!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      ToastNotification.error("Something went wrong!");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleCategoryFilter = useCallback(newCategoryXid => {
    setActiveCategoryFilter(newCategoryXid); // Update for UI display
    setQuery(prev => ({
      ...prev,
      category_xid: newCategoryXid, // Update API filter value
      page_no: 1 // Reset to the first page when filter changes
    }));
  }, []);


  const featuredOptions = useMemo(() => ([
    { value: true, label: 'True' },
    { value: false, label: 'False' },
  ]), []);

  const dynamicFiltersArray = useMemo(() => [
    // 1. Category Filter (using existing data and handler)
    {
      key: 'category_filter',
      label: 'Filter by Category',
      activeValue: query.category_xid,
      options: categoryData, // This is your fetched category data
      onChange: handleCategoryFilter,
    },
    // 2. Featured Filter (using new state and handler)
    {
      key: 'featured_filter',
      label: 'Featured Status',
      activeValue: query.is_featured,
      options: featuredOptions,
      onChange: handleFeaturedFilter,
    },
    // ... You can add more filters here easily
  ], [categoryData, query.category_xid, query.is_featured, handleCategoryFilter, handleFeaturedFilter]);
  return (
    <>
      <Toaster />
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={deleteConfirm}
        title="Delete fAQ"
        message="Are you sure you want to delete this data? This action cannot be undone."
        loading={loading}
      />
      <DataTable
        columns={faqColumn({
          handleEdit,
          handleDelete
        })}
        title="FAQ"
        data={data}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}

        // Filters
        onSearch={debouncedSearch}
        onRefresh={fetchFaqs}
        // onFilterByDate={onFilterByDate}
        activeFilter={query.filter_date}
        // onFilterByRange={onFilterByRange}
        activeDateRange={{ startDate: query.startDate, endDate: query.endDate }}

        // STATUS FILTER
        // onFilterChange={handleStatusFilter}
        activeStatusFilter={query.status}

        dynamicFilters={dynamicFiltersArray}
      />

      <Drawer
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedFaq(null);
          reset();
        }}
        title={isEditMode ? 'Update FAQ' : 'Create FAQ'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Question */}
          <ValidatedTextField
            name="question"
            control={control}
            label="Question"
            placeholder="Write a Question!"
            errors={errors}
          />

          {/* Answer */}
          <ValidatedTextArea
            name="answer"
            control={control}
            label="Answer"
            errors={errors}
            placeholder="Write Answer"
            rows={4}
          />

          {/* Is Featured */}
          <div className="flex items-center">
            <input
              id="isFeatured"
              type="checkbox"
              {...register('isFeatured')}
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
            setGlobalFilter={setGlobalFilter}
            globalFilter={globalFilter}
            placeholder="Select category"
          />


          <div>
            <ValidatedLabel label="Select module" />

            <ValidatedSearchableSelectField
              name="module"
              control={control}
              options={module}
              errors={errors}
              setGlobalFilter={setGlobalFilter}
              globalFilter={globalFilter}
              placeholder="Select module"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setIsEditMode(false);
                setSelectedFaq(null);
                reset();
              }}
              className="btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary `}
              disabled={loading}
            >
              {loading ? 'Loading...' : isEditMode ? 'Update' : 'Create'}
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
                const name = formData.get('name');
                const description = formData.get('description');

                const categoryData = {
                  name: name,
                  description: description,
                };
                console.log(categoryData, 'formadadadadada');

                try {
                  const response = await AddCategory(categoryData); // API call
                  if (response?.data?.success) {
                    ToastNotification.success('Category created successfully!');
                    fetchCategory(); // refresh dropdown
                    setIsCategoryModalOpen(false);
                  } else {
                    ToastNotification.error('Failed to create category.');
                  }
                } catch (error) {
                  console.log('err', error);
                  ToastNotification.error('Something went wrong!');
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