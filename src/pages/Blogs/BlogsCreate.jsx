'use client'

import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ValidatedTextField from '../../components/Form/ValidatedTextField'
import ValidatedSearchableSelectField from '../../components/Form/ValidatedSearchableSelectField'
import ValidatedSearchMultiSelect from '../../components/Form/ValidatedSearchMultiSelect'
import ValidatedLabel from '../../components/Form/ValidatedLabel'
import SubmitBtn from '../../components/Form/SubmitBtn'
import ToastNotification from '../../components/Notification/ToastNotification'
import CreateAuthorTagModal from '../../components/Modal/CreateAuthorTagModal'
// import { AddAuthor, AddTag, getTags, AddBlog } from '@/api-services/cms-service'

export default function BlogCreate() {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [modalType, setModalType] = useState("author")

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      content: '',
      status: 'draft',
      readTime: '',
      isFeatured: false,
      metaTitle: '',
      metaDescription: '',
      metaImage: '',
      metaKeywords: '',
      metadata: { category: '', level: '' },
      author_xid: '',
      tags: []
    }
  })

  const fetchTags = async () => {
    try {
      const response = await getTags(1, 100, '')
      if (response?.data?.success) {
        const mapped = response?.data?.data?.map(item => ({
          label: item?.Name?.toUpperCase(),
          value: item?.ID
        }))
        setTags(mapped)
      } else {
        ToastNotification.error("Error fetching tags")
      }
    } catch (err) {
      ToastNotification.error("Failed to fetch tags")
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const res = await AddBlog(data)
      if (res?.data?.success) {
        ToastNotification.success("Blog created successfully")
        navigate('/cms/blogs')
      } else {
        ToastNotification.error("Failed to create blog")
      }
    } catch (err) {
      ToastNotification.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Create Blog</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-4 bg-white shadow p-4 rounded-xl">
          <ValidatedTextField name="title" control={control} label="Title" errors={errors} />
          <ValidatedTextField name="description" control={control} label="Description" errors={errors} />
          <ValidatedTextField name="content" control={control} label="Content" errors={errors} />

          <ValidatedLabel label="Select Status" />
          <ValidatedSearchableSelectField
            name="status"
            control={control}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Archived", value: "archived" },
              { label: "Reviewed", value: "reviewed" },
            ]}
            errors={errors}
            setGlobalFilter={setGlobalFilter}
            globalFilter={globalFilter}
          />

          <ValidatedTextField name="metaTitle" control={control} label="Meta Title" errors={errors} />
          <ValidatedTextField name="metadata.level" control={control} label="Level" errors={errors} />
          <ValidatedTextField name="metaImage" control={control} label="Meta Image URL" errors={errors} />
          <ValidatedTextField name="metadata.category" control={control} label="Category" errors={errors} />
          <ValidatedTextField name="metaTitle" control={control} label="Meta Title" errors={errors} />
          <ValidatedTextField name="metadata.level" control={control} label="Level" errors={errors} />
          <ValidatedTextField name="metaImage" control={control} label="Meta Image URL" errors={errors} />
          <ValidatedTextField name="metadata.category" control={control} label="Category" errors={errors} />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 sticky top-20 self-start">
          {/* Author */}
          <div className="bg-white shadow p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Select Author</h3>
              <button type="button" onClick={() => { setModalType("author"); setOpenModal(true) }}
                className="px-3 py-1 text-sm border rounded">Add</button>
            </div>
            <ValidatedSearchableSelectField
              name="author_xid"
              control={control}
              options={[
                { label: 'Deepak', value: '1' },
                { label: 'Swapnil', value: '2' },
              ]}
              errors={errors}
              setGlobalFilter={setGlobalFilter}
              globalFilter={globalFilter}
            />
          </div>

          {/* Tags */}
          <div className="bg-white shadow p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Select Tags</h3>
              <button type="button" onClick={() => { setModalType("tag"); setOpenModal(true) }}
                className="px-3 py-1 text-sm border rounded">Create</button>
            </div>
            <ValidatedSearchMultiSelect
              name="tags"
              control={control}
              label="Tags"
              options={tags}
              errors={errors}
              setGlobalFilter={setGlobalFilter}
              globalFilter={globalFilter}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <SubmitBtn loading={loading} label="Submit" />
          </div>
        </div>
      </form>

      {/* Modal */}
      <CreateAuthorTagModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        type={modalType}
        onSubmit={modalType === "tag" ? () => {} : () => {}}
      />
    </div>
  )
}
