import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ValidatedTextField from "@components/Form/ValidatedTextField";
import ValidatedSearchableSelectField from "@components/Form/ValidatedSearchableSelectField";
import ValidatedSearchMultiSelect from "@components/Form/ValidatedSearchMultiSelect";
import ValidatedLabel from "@components/Form/ValidatedLabel";
import SubmitBtn from "@components/Form/SubmitBtn";
import ToastNotification from "@components/Notification/ToastNotification";
import CreateAuthorTagModal from "@components/Modal/CreateAuthorTagModal";
import { getTags, AddTag } from "../../api-services/Modules/TagsApi";
import {
  AddBlog,
  getBlogById,
  UpdateBlog,
} from "../../api-services/Modules/BlogsApi";
import { MetaKeywordsInput } from "@components/Form/MetaKeywordsInput";
import ValidatedTextArea from "@components/Form/ValidatedTextArea";
import { AddAuthor, AddBlogCategory, getAuthor, getBlogCategory } from "../../api-services/Modules/AuthorApi";
import Uploader from "../../components/Form/Uploader";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import RichTextEditor from "../../components/Form/RichTextEditor";


const LiveBlogPreview = ({ formData }) => {
  const BASE_URL = import.meta.env.VITE_IMAGE_URL;

  // Image URL logic: file preview or existing URL
  const getPreviewImage = () => {
    if (formData.metaImage instanceof File) {
      return URL.createObjectURL(formData.metaImage);
    }
    if (typeof formData.metaImage === "string" && formData.metaImage.startsWith("http")) {
      return formData.metaImage;
    }
    return "https://via.placeholder.com/400x200?text=Blog+Image";
  };

  return (
    <div className="sticky top-10">
      <h3 className="text-lg font-bold mb-4 text-gray-700">Live Preview</h3>
      <div className="w-full max-w-[350px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col mx-auto">
        <div className="w-full h-[200px]">
          <img
            src={getPreviewImage()}
            className="w-full h-full object-cover"
            alt="Preview"
          />
        </div>
        <div className="p-5 flex flex-col gap-3">
          <h3 className="text-xl font-bold text-[#002B49] leading-tight line-clamp-2">
            {formData.title || "Your Blog Title Will Appear Here"}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {formData.description || "Every year around this time, there is a familiar buzz in the air. News debates, office conversations..."}
          </p>
          <div className="mt-2 text-gray-400 text-sm font-medium">
            {new Date().toLocaleDateString("en-US")}
          </div>
        </div>
      </div>
    </div>
  );
};
// Yup validation schema
const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  metaTitle: Yup.string()
    .required("Meta title is required")
    .min(2, "Meta title must be at least 2 characters")
    .max(70, "Meta title cannot exceed 70 characters")
    .trim(),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(10000, "Description cannot exceed 10000 characters")
    .trim(),
  content: Yup.string()
    .required("Content is required")
    .min(50, "Content must be at least 50 characters")
    .max(30000, "Content cannot exceed 30000 characters")
    .trim(),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["draft", "published", "archived", "reviewed"], "Invalid status"),
  // metadata: Yup.object().shape({
  //   level: Yup.string()
  //     .notRequired()
  //     // .min(2, 'Level must be at least 2 characters')
  //     // .max(50, 'Level cannot exceed 50 characters')
  //     .trim(),
  //   category: Yup.string()
  //     .required("Category is required")
  //     .oneOf(["backend", "frontend", "fullstack"], "Invalid category"),
  // }),
  // author_xid: Yup.string().required('Author is required').trim(),
  // tags: Yup.array()
  //   .min(1, 'At least one tag is required')
  //   .required('Tags are required'),
  metaKeywords: Yup.string().notRequired().default("").trim(),
  metaImage: Yup.mixed()
    .required("Image is required")
    .test("is-valid-image", "Image must be a valid file or URL", (value) => {
      return typeof value === "string" || value instanceof File;
    }),
});

// const BlogPreviewCard = ({ formData, author, tags, baseImageUrl }) => {

//   const selectedAuthor = author.find(a => a.value === formData.author_xid)?.label || 'No author selected';
//   const selectedTags = formData.tags
//     ?.map(tagId => tags.find(t => t.value === tagId)?.label)
//     .filter(Boolean)
//     .join(', ') || 'No tags selected';

//   // Determine the image URL based on create or edit mode
//   const imageUrl = formData.metaImage
//     ? formData.metaImage instanceof File
//       ? URL.createObjectURL(formData.metaImage) // Create mode: File object
//       : `${formData.metaImage}` // Edit mode: Prepend base URL
//     : 'https://via.placeholder.com/150?text=No+Image'; // Fallback image

//      console.log(imageUrl, "imageUrl")
//   // Clean up object URL to prevent memory leaks
//   useEffect(() => {
//     return () => {
//       if (formData.metaImage instanceof File) {
//         URL.revokeObjectURL(imageUrl);
//       }
//     };
//   }, [formData.metaImage, imageUrl]);

//   return (
//     <div className="bg-white shadow p-4 rounded-xl">
//       <h3 className="font-semibold mb-2">Blog Preview</h3>
//       <div className="border rounded-lg p-4">
//         <div className="flex gap-3">
//           {/* Image fixed size */}
//           <div className="flex-shrink-0">
//             <img
//               src={imageUrl}
//               alt="Blog preview"
//               className="object-cover rounded mb-4 w-24 h-24"
//               onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} // Fallback for broken images
//             />
//           </div>

//           {/* Text always wrap hogi */}
//           <div className="flex-1 min-w-0">
//             <h4 className="text-lg font-bold">
//               {formData.title || "Blog Title"}
//             </h4>
//             <p className="text-sm text-gray-600 mb-2 break-all">
//               {formData.description || "Blog description will appear here..."}
//             </p>
//           </div>
//         </div>

//         <p className="text-sm">
//           <strong>Author:</strong> {selectedAuthor}
//         </p>
//         <p className="text-sm">
//           <strong>Level:</strong> {formData.metadata?.level || "No level"}
//         </p>
//         <p className="text-sm mt-2">
//           {formData.content || "Blog content will appear here..."}
//         </p>
//       </div>
//     </div>
//   );
// };

export default function BlogCreate() {
  const imageUrl = import.meta.env.VITE_IMAGE_URL;
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = id;

  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [author, setAuthor] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("author");
  const [keywords, setKeywords] = useState([]);
  const [categoryData, setCategoryData] = useState([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      content: "",
      status: "draft",
      // readTime: null,
      isFeatured: false,
      metaTitle: "",
      metaDescription: "",
      metaImage: "",
      metaKeywords: "",
      metadata: { category: "", level: "" },
      // author_xid: null,
      tags: [],
      blog_category_xid: null
    },
  });

  // Watch form data for live preview
  const formData = watch();

  // Fetch Tags
  const fetchTags = async () => {
    try {
      const response = await getTags(1, 100, "");
      if (response?.data?.success) {
        const mapped = response?.data?.rows?.map((item) => ({
          label: item?.Name?.toUpperCase(),
          value: item?.ID,
        }));
        setTags(mapped);
      } else {
        ToastNotification.error("Error fetching tags");
      }
    } catch {
      ToastNotification.error("Failed to fetch tags");
    }
  };

  // Fetch Authors
  const fetchAuthors = async () => {
    try {
      const response = await getAuthor(1, 10, "");
      if (response?.data?.success) {
        const mapped = response?.data?.data?.rows?.map((item) => ({
          label: item?.name?.toUpperCase(),
          value: item?.id,
        }));
        setAuthor(mapped);
      } else {
        ToastNotification.error("Error fetching authors");
      }
    } catch {
      ToastNotification.error("Failed to fetch authors");
    }
  };
  const fetchBlogCategory = async () => {
    try {
      const response = await getBlogCategory(1, 10, "");
      console.log(response?.data?.data, "ddd")
      if (response?.data?.success) {
        const mapped = response?.data?.data?.rows?.map((item) => ({
          label: item?.name?.toUpperCase(),
          value: item?.id,
        }));
        setCategoryData(mapped);
      } else {
        ToastNotification.error("Error fetching authors");
      }
    } catch {
      ToastNotification.error("Failed to fetch authors");
    }
  };

  // Fetch Blog if editing
  useEffect(() => {
    fetchTags();
    fetchAuthors();

    if (isEdit && id != undefined) {
        
      console.log("ander aya");
      const fetchBlog = async () => {
        try {
          const res = await getBlogById(id);
          console.log(res, "edit blog");
          if (res?.data?.success) {
            const blog = res?.data?.data;

            // let metadata = {};
            // try {
            //   metadata = blog.metadata ? JSON.parse(blog.metadata) : {};
            // } catch (err) {
            //   console.error("Metadata parse error:", err);
            //   metadata = {};
            // }

            setValue("title", blog.title);
            setValue("metaTitle", blog.metaTitle);
            setValue("description", blog.description);
            setValue("metaDescription", blog.metaDescription);
            setValue("slug", blog.slug);
            setValue("content", blog.content);
            setValue("status", blog.status);
            // setValue("metadata.level", metadata.level || "");
            // setValue("metadata.category", metadata.category || "");
            setValue("blog_category_xid", blog?.categoryId || "");
            setValue('author_xid', blog?.author?.id || '')
            // setValue("tags", blog.tags?.map((t) => t.id) || []);
            const keywordArray = blog.metaKeywords
              ? blog.metaKeywords
                .split(",")
                .filter((keyword) => keyword.trim() !== "")
              : [];
            setKeywords(keywordArray);
            setValue("metaKeywords", keywordArray.join(", "), {
              shouldValidate: true,
            });

            if (blog.metaImage) { 
              const fullImageUrl = `${imageUrl}${blog.metaImage}`; // Ensure no double slashes
              console.log(fullImageUrl, "fullImageUrl");
              setValue("metaImage", fullImageUrl); // Set as string URL
            } else {
              setValue("metaImage", ""); // Clear image field if no image
            }
          } else {
            ToastNotification.error("Failed to load blog");
          }
        } catch {
          ToastNotification.error("Failed to load blog");
        }
      };
      fetchBlog();
    }
  }, [id, setValue]);

  // Modal submissions
  const handleTagSubmit = async (data) => {
    try {
      const response = await AddTag([
        {
          name: data.name,
          description: data.description,
        },
      ]);
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
  };

  const handleAuthorSubmit = async (data) => {
    try {
      const response = await AddAuthor({
        name: data.name,
        profileImageUrl: data.file,
        description: data.description,
        designation: data.designation,
        socialLink: data.socialLink,
        metaDescription: data.metaDescription,
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
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Tags aur keywords ka formatting
      const payload = {
        ...data,
        tags: data.tags?.map((tagId) => ({ id: tagId })),
        metaKeywords: keywords.join(","),
      };

      // ---- FORM DATA BANANA ----
      const formData = new FormData();

      // Non-file fields append
      Object.keys(payload).forEach((key) => {
        if (key !== "metaImage" && key !== "tags" && key !== "metadata") {
          formData.append(key, payload[key]);
        }
      });

      // Tags ko properly append karna
      // if (payload.tags?.length) {
      //   formData.append("tags", JSON.stringify(payload.tags));
      // }

      // Metadata ko bhi JSON me append karna
      if (payload.metadata) {
        formData.append("metadata", JSON.stringify(payload.metadata));
      }

      // File: create me hamesha, update me sirf jab nayi file ho
      if (!isEdit || (isEdit && payload.metaImage instanceof File)) {
        formData.append("metaImage", payload.metaImage);
      }

      const formDataObject = Object.fromEntries(formData.entries());
      console.log("FormData as object:", formDataObject);
      // ---- API CALL ----
      let res;
      if (isEdit) {
        res = await UpdateBlog(id, formData); // sirf id aur formData bhejna
      } else {
        res = await AddBlog(formData);
      }

      if (res?.data?.success) {
        ToastNotification.success(
          isEdit ? "Blog updated successfully" : "Blog created successfully"
        );
        navigate("/blogs");
      } else {
        ToastNotification.error(
          isEdit ? "Failed to update blog" : "Failed to create blog"
        );
      }
    } catch (err) {
      console.error(err);
      ToastNotification.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
    fetchTags();
    fetchBlogCategory()
  }, []);

  return (
    <>
      <div className="">


        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-6"
        >
          <div className="flex justify-between text-center">
            <h2 className="text-2xl font-bold pb-0 mb-0">
              {id ? "Edit Blog" : "Create Blog"}
            </h2>
            <div>
              <SubmitBtn loading={loading} label={id ? "Update" : "Submit"} />
            </div>
          </div>
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 bg-white shadow p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValidatedTextField
                name="title"
                control={control}
                label="Title"
                errors={errors}
                placeholder="Enter blog title"
              />
              <ValidatedTextField
                name="slug"
                control={control}
                label="Slug"
                errors={errors}
                placeholder="Enter slug"
              />
              <div className="space-y-1">
                <div className=" flex items-center justify-between">
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
                  name="blog_category_xid"
                  control={control}
                  options={categoryData}
                  errors={errors}
                  setGlobalFilter={setGlobalFilter}
                  globalFilter={globalFilter}
                  placeholder="Select category"
                // label="Select Blog Category"
                />
              </div>

              <div className="space-y-1 lg:sticky self-start">

                <div className="flex justify-between items-center ">

                  <ValidatedLabel label="Select Author" />
                 
                  <button
                    type="button"
                    className="btn btn-xs btn-outline btn-primary"
                    onClick={() => { setModalType("author"); setOpenModal(true) }}
                  >
                    + Create
                  </button>
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
              <ValidatedTextField
                name="metaTitle"
                control={control}
                label="Meta Title"
                errors={errors}
                placeholder="Enter meta title"
              />

              <ValidatedTextArea
                name="description"
                control={control}
                label="Description"
                errors={errors}
                className="col-span-2"
                placeholder="Enter blog description"
                rows={4}
              />
              
              <RichTextEditor
                name="content"
                control={control}
                label="Content"
                errors={errors}
              />

              <ValidatedTextArea
                name="metaDescription"
                control={control}
                label="Meta Description"
                errors={errors}
                className="col-span-2"
                placeholder="Enter  content"
                rows={4}
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
                  setGlobalFilter={setGlobalFilter}
                  globalFilter={globalFilter}
                  placeholder="Select status"
                />
              </div>
              {/* <ValidatedTextField
              name="metadata.level"
              control={control}
              label="Level"
              errors={errors}
              placeholder="Enter level (e.g., Beginner, Intermediate)"
              helperText="Level is required"
            /> */}
              {/* <div>
              <ValidatedLabel label="Select Category" />
              <ValidatedSearchableSelectField
                name="metadata.category"
                control={control}
                options={[
                  { label: "Backend", value: "backend" },
                  { label: "Frontend", value: "frontend" },
                  { label: "Full Stack", value: "fullstack" },
                ]}
                errors={errors}
                setGlobalFilter={setGlobalFilter}
                globalFilter={globalFilter}
                placeholder="Select category"
              />
            </div> */}
              <MetaKeywordsInput
                name="metaKeywords"
                control={control}
                label="Meta Keywords"
                errors={errors}
                keywords={keywords}
                setKeywords={setKeywords}
                setValue={setValue}
              />
              <div>
                <ValidatedLabel label="Upload Image" />
                <Uploader
                  name="metaImage"
                  control={control}
                  label="Upload Image"
                  errors={errors}
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
                setGlobalFilter={setGlobalFilter}
                globalFilter={globalFilter}
              />
            </div>
            {/* <div className="bg-white shadow p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Select Tags</h3>
              <button
                type="button"
                onClick={() => {
                  setModalType("tag");
                  setOpenModal(true);
                }}
                className="px-3 py-1 text-sm border rounded"
              >
                Create
              </button>
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
          </div> */}
            {/* <BlogPreviewCard formData={formData} author={author} tags={tags}  baseImageUrl={imageUrl}/> */}
            <div className="lg:col-span-1">
              <LiveBlogPreview formData={formData} />
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




      {
        isCategoryModalOpen && (
          <dialog open className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Create Blog Category</h3>
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
                    const response = await AddBlogCategory(categoryData); // API call
                    if (response?.data?.success) {
                      ToastNotification.success('Category created successfully!');
                      fetchBlogCategory(); // refresh dropdown
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
        )
      }
    </>
  );
}
