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
import { AddAuthor, AddBlog, getAuthor, getTags } from '../../api-services/cms-services'
import ImageUploadField from '../../components/Form/ImageUploadField'
import { MetaKeywordsInput } from '../../components/Form/MetaKeywordsInput'
import ValidatedTextArea from '../../components/Form/ValidatedTextArea'

export default function BlogCreate() {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState([])
  const [author, setAuthor] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [modalType, setModalType] = useState("author")
  const [keywords, setKeywords] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
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
      file: '',
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

  const fetchAuthors = async () => {
    try {
      const response = await getAuthor(1, 10, '')
      if (response?.data?.success) {
        const mapped = response?.data?.data?.map(item => ({
          label: item?.name?.toUpperCase(),
          value: item?.id
        }))
        setAuthor(mapped)
      } else {
        ToastNotification.error("Error fetching tags")
      }
    } catch (err) {
      ToastNotification.error("Failed to fetch tags")
    }
  }

  const handleTagSubmit = async (data) => {
    console.log("Tag Data", data)
    // try {
    //   const response = await AddTag({
    //     name: data.name,
    //     description: data.description,
    //   });

    //   if (response) {
    //     ToastNotification.success("Tag added successfully!");
    //     fetchTags();   // ✅ naya tag reload karega
    //     handleClose();
    //   } else {
    //     ToastNotification.error("Failed to add tag.");
    //   }
    // } catch (err) {
    //   ToastNotification.error("Something went wrong!");
    // }
  };

  const handleAuthorSubmit = async (data) => {
    console.log("Author Data", data)
    try {
      const response = await AddAuthor({
        name: data.name,
        profileImageUrl: data.profileImageUrl,
        description: data.description,
        designation: data.designation,
        socialLink: data.socialLink
      });

      if (response) {
        ToastNotification.success("Author added successfully!");
        // ✅ yaha fetchAuthors() likhna hoga agar author API se aate hain
        // handleClose();
      } else {
        ToastNotification.error("Failed to add author.");
      }
    } catch (err) {
      ToastNotification.error("Something went wrong!");
    }
  }
  const onSubmit = async (data) => {
    console.log("Before Transform:", data);

    // 👇 Transform tags array [48, 44] -> [{id: 48}, {id: 44}]
    const payload = {
      ...data,
      tags: data.tags?.map(tagId => ({ id: tagId }))
    };

    console.log("Final Payload:", payload);

    try {
      setLoading(true)
      const res = await AddBlog(payload)   // ✅ yaha payload bhejna hai
      if (res?.data?.success) {
        ToastNotification.success("Blog created successfully")
        // navigate('/cms/blogs')
        setLoading(false)
      } else {
        ToastNotification.error("Failed to create blog")
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
      ToastNotification.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  };



  useEffect(() => {
    fetchTags()
    fetchAuthors()
  }, [])

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Create Blog</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 bg-white shadow p-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Title (half) */}
            <ValidatedTextField
              name="title"
              control={control}
              label="Title"
              errors={errors}
              placeholder={"Enter blog title"}
            />

            {/* Meta Title (half) */}
            <ValidatedTextField
              name="metaTitle"
              control={control}
              label="Meta Title"
              errors={errors}
              placeholder={"Enter meta title"}
            />

            {/* Description (textarea) - full */}
          

            <ValidatedTextArea 
              name="description"
              control={control}
              label="Description"
              errors={errors}
              className="col-span-2"
              placeholder={"Enter blog description"}
              rows={4}
            />


            {/* Content (textarea) - full */}
            <ValidatedTextArea 
              name="content"
              control={control}
              label="Content"
              errors={errors}
              className="col-span-2"
              placeholder={"Enter blog content"}
              rows={4}
            />

            {/* Select Status (half) */}
            <div>
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
                placeholder="Select status"
              />
            </div>

            {/* Level (half) */}
            <ValidatedTextField
              name="metadata.level"
              control={control}
              label="Level"
              errors={errors}
              placeholder={"Enter level (e.g., Beginner, Intermediate)"}
            />

            {/* Category (half) */}
             <div>
              <ValidatedLabel label="Select Category" />
              <ValidatedSearchableSelectField
                name="metadata.category"
                control={control}
                options={[
                  { label: "Backend", value: "backend" },
                  { label: "Frontend", value: "frontend" },
                  { label: "Full Stack", value: "fullstack" }
                ]}
                errors={errors}
                setGlobalFilter={setGlobalFilter}
                globalFilter={globalFilter}
                placeholder="Select category"
              />
            </div>

            {/* Keywords (half) */}

            <MetaKeywordsInput
              name="metaKeywords"
              control={control}
              label="Meta Keywords"
              errors={errors}
              keywords={keywords}
              setKeywords={setKeywords}
              setValue={setValue}
            />


            <ImageUploadField
              name="file"
              control={control}
              label="Upload  Image"
              errors={errors}
              rules={{ required: "Image is required" }}
            />

          </div>
        </div>


        {/* RIGHT COLUMN */}
        {/* <div className="w-full md:w-1/3"> */}
        <div className="space-y-6 lg:sticky lg:top-10 self-start">

          {/* Author */}
          <div className="bg-white shadow p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Select Author</h3>
              <button type="button" onClick={() => { setModalType("author"); setOpenModal(true) }}
                className="px-3 py-1 text-sm border rounded">Create</button>
            </div>
            <ValidatedSearchableSelectField
              name="author_xid"
              control={control}
              options={author}
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
        {/* </div> */}
      </form>

      {/* Modal */}
      <CreateAuthorTagModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        type={modalType}
        onSubmit={modalType === "tag" ? handleTagSubmit : handleAuthorSubmit}
      />
    </div>
  )
}
