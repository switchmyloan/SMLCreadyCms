// import { useForm } from 'react-hook-form'
// import { useEffect, useState } from 'react'
// import { useNavigate, useParams } from 'react-router-dom'
// import ValidatedTextField from '../../components/Form/ValidatedTextField'
// import ValidatedSearchableSelectField from '../../components/Form/ValidatedSearchableSelectField'
// import ValidatedSearchMultiSelect from '../../components/Form/ValidatedSearchMultiSelect'
// import ValidatedLabel from '../../components/Form/ValidatedLabel'
// import SubmitBtn from '../../components/Form/SubmitBtn'
// import ToastNotification from '../../components/Notification/ToastNotification'
// import CreateAuthorTagModal from '../../components/Modal/CreateAuthorTagModal'
// import { AddAuthor, AddBlog, AddTag, getAuthor, getTags, getBlogById, UpdateBlog } from '../../api-services/cms-services'
// import ImageUploadField from '../../components/Form/ImageUploadField'
// import { MetaKeywordsInput } from '../../components/Form/MetaKeywordsInput'
// import ValidatedTextArea from '../../components/Form/ValidatedTextArea'

// export default function BlogCreate() {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const isEdit = Boolean(id);

//   const [globalFilter, setGlobalFilter] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [tags, setTags] = useState([])
//   const [author, setAuthor] = useState([])
//   const [openModal, setOpenModal] = useState(false)
//   const [modalType, setModalType] = useState("author")
//   const [keywords, setKeywords] = useState([]);

//   const {
//     control,
//     handleSubmit,
//     setValue,
//     formState: { errors }
//   } = useForm({
//     defaultValues: {
//       title: '',
//       slug: '',
//       description: '',
//       content: '',
//       status: 'draft',
//       readTime: '',
//       isFeatured: false,
//       metaTitle: '',
//       metaDescription: '',
//       file: '',
//       metaKeywords: '',
//       metadata: { category: '', level: '' },
//       author_xid: '',
//       tags: []
//     }
//   })

//   // Fetch Tags
//   const fetchTags = async () => {
//     try {
//       const response = await getTags(1, 100, '')
//       if (response?.data?.success) {
//         const mapped = response?.data?.data?.map(item => ({
//           label: item?.Name?.toUpperCase(),
//           value: item?.ID
//         }))
//         setTags(mapped)
//       } else {
//         ToastNotification.error("Error fetching tags")
//       }
//     } catch {
//       ToastNotification.error("Failed to fetch tags")
//     }
//   }

//   // Fetch Authors
//   const fetchAuthors = async () => {
//     try {
//       const response = await getAuthor(1, 10, '')
//       if (response?.data?.success) {
//         const mapped = response?.data?.data?.map(item => ({
//           label: item?.name?.toUpperCase(),
//           value: item?.id
//         }))
//         setAuthor(mapped)
//       } else {
//         ToastNotification.error("Error fetching authors")
//       }
//     } catch {
//       ToastNotification.error("Failed to fetch authors")
//     }
//   }

//   // Fetch Blog if editing
//   useEffect(() => {
//     fetchTags()
//     fetchAuthors()

//     if (isEdit) {
//       const fetchBlog = async () => {
//         try {
//           const res = await getBlogById(id)
//           if (res?.data?.success) {
//             const blog = res.data.data
//             setValue('title', blog.title)
//             setValue('metaTitle', blog.metaTitle)
//             setValue('description', blog.description)
//             setValue('content', blog.content)
//             setValue('status', blog.status)
//             setValue('metadata.level', blog.metadata.level)
//             setValue('metadata.category', blog.metadata.category)
//             setValue('author_xid', blog.author_xid || '')
//             setValue('tags', blog.tags?.map(t => t.id) || [])

//             // Convert string to array for keywords
//             // const keywordArray = blog.metaKeywords ? blog.metaKeywords.split(',') : []
//             // setKeywords(keywordArray)
//             const keywordArray = blog.metaKeywords ? blog.metaKeywords.split(',').filter(keyword => keyword.trim() !== '') : [];
//           setKeywords(keywordArray);
//           setValue('metaKeywords', keywordArray.join(', '), { shouldValidate: true });
//           } else {
//             ToastNotification.error("Failed to load blog")
//           }
//         } catch {
//           ToastNotification.error("Failed to load blog")
//         }
//       }
//       fetchBlog()
//     }

//   }, [id, setValue])

//   // Modal submissions
//   const handleTagSubmit = async (data) => {
//     try {
//       const response = await AddTag(
//         [{
//         name: data.name,
//         description: data.description,
//       }]
//     );
//       if (response) {
//         ToastNotification.success("Tag added successfully!");
//         fetchTags();
//         setOpenModal(false);
//       } else {
//         ToastNotification.error("Failed to add tag.");
//       }
//     } catch {
//       ToastNotification.error("Something went wrong!");
//     }
//   }

//   const handleAuthorSubmit = async (data) => {
//     try {
//       const response = await AddAuthor({
//         name: data.name,
//         file: data.file,
//         description: data.description,
//         designation: data.designation,
//         socialLink: data.socialLink
//       });
//       if (response) {
//         ToastNotification.success("Author added successfully!");
//         fetchAuthors();
//         setOpenModal(false);
//       } else {
//         ToastNotification.error("Failed to add author.");
//       }
//     } catch {
//       ToastNotification.error("Something went wrong!");
//     }
//   }

//   // Submit Blog
//   const onSubmit = async (data) => {
//     console.log(id)
//     const payload = {
//       ...data,
//       tags: data.tags?.map(tagId => ({ id: tagId })),
//       metaKeywords: keywords.join(',') // convert array back to string
//     }

//     try {
//       setLoading(true)
//       let res
//       if (isEdit) {
//         res = await UpdateBlog({ id: id, ...payload })
//       } else {
//         res = await AddBlog(payload)
//       }

//       if (res?.data?.success) {
//         ToastNotification.success(isEdit ? "Blog updated successfully" : "Blog created successfully")
//         navigate('/blogs')
//       } else {
//         ToastNotification.error(isEdit ? "Failed to update blog" : "Failed to create blog")
//       }
//     } catch {
//       ToastNotification.error("Something went wrong")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="">
//       <h2 className="text-2xl font-bold mb-6">{isEdit ? "Edit Blog" : "Create Blog"}</h2>

//       <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//         {/* LEFT COLUMN */}
//         <div className="lg:col-span-2 bg-white shadow p-6 rounded-xl">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

//             <ValidatedTextField
//               name="title"
//               control={control}
//               label="Title"
//               errors={errors}
//               placeholder="Enter blog title"
//               rules={{ required: "Title is required" }}
//             />

//             <ValidatedTextField
//               name="metaTitle"
//               control={control}
//               label="Meta Title"
//               errors={errors}
//               placeholder="Enter meta title"
//               rules={{ required: "Meta title is required" }}
//             />

//             <ValidatedTextArea
//               name="description"
//               control={control}
//               label="Description"
//               errors={errors}
//               className="col-span-2"
//               placeholder="Enter blog description"
//               rows={4}
//               rules={{ required: "Description is required" }}
//             />

//             <ValidatedTextArea
//               name="content"
//               control={control}
//               label="Content"
//               errors={errors}
//               className="col-span-2"
//               placeholder="Enter blog content"
//               rows={4}
//               rules={{ required: "Content is required" }}
//             />

//             <div>
//               <ValidatedLabel label="Select Status" />
//               <ValidatedSearchableSelectField
//                 name="status"
//                 control={control}
//                 options={[
//                   { label: "Draft", value: "draft" },
//                   { label: "Published", value: "published" },
//                   { label: "Archived", value: "archived" },
//                   { label: "Reviewed", value: "reviewed" },
//                 ]}
//                 errors={errors}
//                 rules={{ required: "Status is required" }}
//                 setGlobalFilter={setGlobalFilter}
//                 globalFilter={globalFilter}
//                 placeholder="Select status"
//               />
//             </div>

//             <ValidatedTextField
//               name="metadata.level"
//               control={control}
//               label="Level"
//               errors={errors}
//               placeholder="Enter level (e.g., Beginner, Intermediate)"
//               rules={{ required: true }}
//               helperText="Level is required"
//             />

//             <div>
//               <ValidatedLabel label="Select Category" />
//               <ValidatedSearchableSelectField
//                 name="metadata.category"
//                 control={control}
//                 options={[
//                   { label: "Backend", value: "backend" },
//                   { label: "Frontend", value: "frontend" },
//                   { label: "Full Stack", value: "fullstack" }
//                 ]}
//                 errors={errors}
//                 rules={{ required: "Category is required" }}
//                 setGlobalFilter={setGlobalFilter}
//                 globalFilter={globalFilter}
//                 placeholder="Select category"
//               />
//             </div>

//             <MetaKeywordsInput
//               name="metaKeywords"
//               control={control}
//               label="Meta Keywords"
//               errors={errors}
//               keywords={keywords}
//               setKeywords={setKeywords}
//               setValue={setValue}
//               rules={{ required: "Meta keywords are required" }}
//             />

//             <div>
//               <ValidatedLabel label="Upload Image" />
//               <ImageUploadField
//                 name="file"
//                 control={control}
//                 label="Upload Image"
//                 errors={errors}
//                 rules={{ required: "Image is required" }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* RIGHT COLUMN */}
//         <div className="space-y-6 lg:sticky lg:top-10 self-start">

//           <div className="bg-white shadow p-4 rounded-xl">
//             <div className="flex justify-between items-center mb-2">
//               <h3 className="font-semibold">Select Author</h3>
//               <button type="button" onClick={() => { setModalType("author"); setOpenModal(true) }}
//                 className="px-3 py-1 text-sm border rounded">Create</button>
//             </div>
//             <ValidatedSearchableSelectField
//               name="author_xid"
//               control={control}
//               options={author}
//               errors={errors}
//               rules={{ required: "Author is required" }}
//               setGlobalFilter={setGlobalFilter}
//               globalFilter={globalFilter}
//             />
//           </div>

//           <div className="bg-white shadow p-4 rounded-xl">
//             <div className="flex justify-between items-center mb-2">
//               <h3 className="font-semibold">Select Tags</h3>
//               <button type="button" onClick={() => { setModalType("tag"); setOpenModal(true) }}
//                 className="px-3 py-1 text-sm border rounded">Create</button>
//             </div>
//             <ValidatedSearchMultiSelect
//               name="tags"
//               control={control}
//               label="Tags"
//               options={tags}
//               errors={errors}
//               rules={{ required: "At least one tag is required" }}
//               setGlobalFilter={setGlobalFilter}
//               globalFilter={globalFilter}
//             />
//           </div>

//           <div className="flex justify-end">
//             <SubmitBtn loading={loading} label={isEdit ? "Update" : "Submit"} />
//           </div>

//         </div>

//       </form>

//       <CreateAuthorTagModal
//         open={openModal}
//         handleClose={() => setOpenModal(false)}
//         type={modalType}
//         onSubmit={modalType === "tag" ? handleTagSubmit : handleAuthorSubmit}
//       />
//     </div>
//   )
// }


import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ValidatedTextField from '../../components/Form/ValidatedTextField'
import ValidatedSearchableSelectField from '../../components/Form/ValidatedSearchableSelectField'
import ValidatedSearchMultiSelect from '../../components/Form/ValidatedSearchMultiSelect'
import ValidatedLabel from '../../components/Form/ValidatedLabel'
import SubmitBtn from '../../components/Form/SubmitBtn'
import ToastNotification from '../../components/Notification/ToastNotification'
import CreateAuthorTagModal from '../../components/Modal/CreateAuthorTagModal'
import { AddAuthor, AddBlog, AddTag, getAuthor, getTags, getBlogById, UpdateBlog } from '../../api-services/cms-services'
import ImageUploadField from '../../components/Form/ImageUploadField'
import { MetaKeywordsInput } from '../../components/Form/MetaKeywordsInput'
import ValidatedTextArea from '../../components/Form/ValidatedTextArea'

const BlogPreviewCard = ({ formData, author, tags }) => {
  const selectedAuthor = author.find(a => a.value === formData.author_xid)?.label || 'No author selected';
  const selectedTags = formData.tags
    ?.map(tagId => tags.find(t => t.value === tagId)?.label)
    .filter(Boolean)
    .join(', ') || 'No tags selected';
  const imageUrl = formData.file instanceof File ? URL.createObjectURL(formData.file) : formData.file || 'https://via.placeholder.com/150';

  return (
    <div className="bg-white shadow p-4 rounded-xl">
      <h3 className="font-semibold mb-2">Blog Preview</h3>
      <div className="border rounded-lg p-4">
        <div className='flex gap-3'>
          <div>
            <img
              src={`${imageUrl}`}
              alt="Blog preview"
              className="  object-cover rounded mb-4 w-24"
            />
          </div>
          <div>
            <h4 className="text-lg font-bold">{formData.title || 'Blog Title'}</h4>
            <p className="text-sm text-gray-600 mb-2">{formData.description || 'Blog description will appear here...'}</p>

          </div>

        </div>
        <p className="text-sm"><strong>Author:</strong> {selectedAuthor}</p>
        <p className="text-sm"><strong>Level:</strong> {formData.metadata?.level || 'No level'}</p>
        <p className="text-sm mt-2">{formData.content || 'Blog content will appear here...'}</p>




      </div>
    </div>
  );
};

export default function BlogCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

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
    setValue,
    watch,
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

  // Watch form data for live preview
  const formData = watch();

  // Fetch Tags
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
    } catch {
      ToastNotification.error("Failed to fetch tags")
    }
  }

  // Fetch Authors
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
        ToastNotification.error("Error fetching authors")
      }
    } catch {
      ToastNotification.error("Failed to fetch authors")
    }
  }

  // Fetch Blog if editing
  useEffect(() => {
    fetchTags()
    fetchAuthors()

    if (isEdit) {
      const fetchBlog = async () => {
        try {
          const res = await getBlogById(id)
          if (res?.data?.success) {
            const blog = res.data.data
            setValue('title', blog.title)
            setValue('metaTitle', blog.metaTitle)
            setValue('description', blog.description)
            setValue('content', blog.content)
            setValue('status', blog.status)
            setValue('metadata.level', blog.metadata.level)
            setValue('metadata.category', blog.metadata.category)
            setValue('author_xid', blog.author_xid || '')
            setValue('tags', blog.tags?.map(t => t.id) || [])
            const keywordArray = blog.metaKeywords ? blog.metaKeywords.split(',').filter(keyword => keyword.trim() !== '') : [];
            setKeywords(keywordArray);
            setValue('metaKeywords', keywordArray.join(', '), { shouldValidate: true });
          } else {
            ToastNotification.error("Failed to load blog")
          }
        } catch {
          ToastNotification.error("Failed to load blog")
        }
      }
      fetchBlog()
    }
  }, [id, setValue])

  // Modal submissions
  const handleTagSubmit = async (data) => {
    try {
      const response = await AddTag([{
        name: data.name,
        description: data.description,
      }]);
      if (response) {
        ToastNotification.success("Tag added successfully!");
        fetchTags();
        setOpenModal(false);
      } else {
        ToastNotification.error("Failed to add tag.");
      }
    } catch {
      ToastNotification.error("Something went wrong!");
    }
  }

  const handleAuthorSubmit = async (data) => {
    try {
      const response = await AddAuthor({
        name: data.name,
        file: data.file,
        description: data.description,
        designation: data.designation,
        socialLink: data.socialLink
      });
      if (response) {
        ToastNotification.success("Author added successfully!");
        fetchAuthors();
        setOpenModal(false);
      } else {
        ToastNotification.error("Failed to add author.");
      }
    } catch {
      ToastNotification.error("Something went wrong!");
    }
  }

  // Submit Blog
  const onSubmit = async (data) => {
    const payload = {
      ...data,
      tags: data.tags?.map(tagId => ({ id: tagId })),
      metaKeywords: keywords.join(',')
    }

    try {
      setLoading(true)
      let res
      if (isEdit) {
        res = await UpdateBlog({ id: id, ...payload })
      } else {
        res = await AddBlog(payload)
      }

      if (res?.data?.success) {
        ToastNotification.success(isEdit ? "Blog updated successfully" : "Blog created successfully")
        navigate('/blogs')
      } else {
        ToastNotification.error(isEdit ? "Failed to update blog" : "Failed to create blog")
      }
    } catch {
      ToastNotification.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">{isEdit ? "Edit Blog" : "Create Blog"}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 bg-white shadow p-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedTextField
              name="title"
              control={control}
              label="Title"
              errors={errors}
              placeholder="Enter blog title"
              rules={{ required: "Title is required" }}
            />
            <ValidatedTextField
              name="metaTitle"
              control={control}
              label="Meta Title"
              errors={errors}
              placeholder="Enter meta title"
              rules={{ required: "Meta title is required" }}
            />
            <ValidatedTextArea
              name="description"
              control={control}
              label="Description"
              errors={errors}
              className="col-span-2"
              placeholder="Enter blog description"
              rows={4}
              rules={{ required: "Description is required" }}
            />
            <ValidatedTextArea
              name="content"
              control={control}
              label="Content"
              errors={errors}
              className="col-span-2"
              placeholder="Enter blog content"
              rows={4}
              rules={{ required: "Content is required" }}
            />
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
                rules={{ required: "Status is required" }}
                setGlobalFilter={setGlobalFilter}
                globalFilter={globalFilter}
                placeholder="Select status"
              />
            </div>
            <ValidatedTextField
              name="metadata.level"
              control={control}
              label="Level"
              errors={errors}
              placeholder="Enter level (e.g., Beginner, Intermediate)"
              rules={{ required: true }}
              helperText="Level is required"
            />
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
                rules={{ required: "Category is required" }}
                setGlobalFilter={setGlobalFilter}
                globalFilter={globalFilter}
                placeholder="Select category"
              />
            </div>
            <MetaKeywordsInput
              name="metaKeywords"
              control={control}
              label="Meta Keywords"
              errors={errors}
              keywords={keywords}
              setKeywords={setKeywords}
              setValue={setValue}
              rules={{ required: "Meta keywords are required" }}
            />
            <div>
              <ValidatedLabel label="Upload Image" />
              <ImageUploadField
                name="file"
                control={control}
                label="Upload Image"
                errors={errors}
                rules={{ required: "Image is required" }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 lg:sticky lg:top-10 self-start">
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
              rules={{ required: "Author is required" }}
              setGlobalFilter={setGlobalFilter}
              globalFilter={globalFilter}
            />
          </div>
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
              rules={{ required: "At least one tag is required" }}
              setGlobalFilter={setGlobalFilter}
              globalFilter={globalFilter}
            />
          </div>
          <BlogPreviewCard formData={formData} author={author} tags={tags} />
          <div className="flex justify-end">
            <SubmitBtn loading={loading} label={isEdit ? "Update" : "Submit"} />
          </div>
        </div>
      </form>

      <CreateAuthorTagModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        type={modalType}
        onSubmit={modalType === "tag" ? handleTagSubmit : handleAuthorSubmit}
      />
    </div>
  )
}