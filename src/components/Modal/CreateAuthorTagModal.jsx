// 'use client'

// import { useEffect, useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { Dialog } from "@headlessui/react";
// import ImageUploadField from "../Form/ImageUploadField";

// const CreateAuthorTagModal = ({ open, handleClose, type, onSubmit }) => {
//   const {
//     register,
//     handleSubmit,
//     reset,
//     control,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       name: "",
//       email: "",
//       description: "",
//       designation: "",
//       socialLink: "",
//       file: null,
//     },
//   });

//   const [imagePreview, setImagePreview] = useState(null);

//   useEffect(() => {
//     if (type === "author") {
//       reset({
//         name: "",
//         email: "",
//         description: "",
//         designation: "",
//         socialLink: "",
//         file: null,
//       });
//     } else {
//       reset({
//         name: "",
//         description: "",
//       });
//     }
//   }, [type, reset]);


//   const handleFormSubmit = (data) => {
//     console.log("submitted ✅", data);

//     let payload = { ...data };
//     if (type === "author") {
//       payload.profileImageUrl = data.file ? data.file[0] : null;
//     }

//     onSubmit(payload);
//     reset();
//     setImagePreview(null);
//     handleClose();
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       className="fixed inset-0 z-50 flex items-center justify-center"
//     >
//       <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
//       <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
//         <Dialog.Title className="text-lg font-semibold mb-4">
//           {type === "author" ? "Create Author" : "Create Tag"}
//         </Dialog.Title>

//         <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
//           {type === "author" ? (
//             <>
//               {/* Name + Designation */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Author Name
//                   </label>
//                   <input
//                     type="text"
//                     {...register("name", { required: false })}
//                     className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.name
//                         ? "border-red-500 focus:ring-red-500"
//                         : "border-gray-300 focus:ring-blue-500"
//                       }`}
//                   />
//                   {errors.name && (
//                     <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Designation
//                   </label>
//                   <input
//                     type="text"
//                     {...register("designation", false)}
//                     className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.designation
//                         ? "border-red-500 focus:ring-red-500"
//                         : "border-gray-300 focus:ring-blue-500"
//                       }`}
//                   />
//                   {errors.designation && (
//                     <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>
//                   )}
//                 </div>
//               </div>

//               {/* Social Link */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Social Link
//                 </label>
//                 <input
//                   type="text"
//                   {...register("socialLink", { required: "Social Link is required" })}
//                   className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.socialLink
//                       ? "border-red-500 focus:ring-red-500"
//                       : "border-gray-300 focus:ring-blue-500"
//                     }`}
//                 />
//                 {errors.socialLink && (
//                   <p className="text-red-500 text-xs mt-1">{errors.socialLink.message}</p>
//                 )}
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Description
//                 </label>
//                 <textarea
//                   rows={3}
//                   {...register("description", { required: "Description is required" })}
//                   className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.description
//                       ? "border-red-500 focus:ring-red-500"
//                       : "border-gray-300 focus:ring-blue-500"
//                     }`}
//                 />
//                 {errors.description && (
//                   <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
//                 )}
//               </div>

//               {/* Image Upload */}
//               {/* Image Upload Section Fixed */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Profile Image
//                 </label>
//                 <Controller
//                   name="file"
//                   control={control}
//                   rules={{ required: "Image is required" }}
//                   render={({ field: { onChange, value } }) => (
//                     <ImageUploadField
//                       name="file"
//                       control={control}
//                       label="Upload Image"
//                       errors={errors}
//                       // 'onChange' ki jagah wahi naam dein jo error mein aa raha hai
//                       handleFileInputChangeBanner={(files) => {
//                         if (files && files.length > 0) {
//                           field.onChange(files);
//                           setImagePreview(URL.createObjectURL(files[0]));
//                         }
//                       }}
//                     />
//                   )}
//                 />
//                 {errors.file && (
//                   <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>
//                 )}
//               </div>

//               {imagePreview && (
//                 <div className="flex justify-center mt-3">
//                   <img
//                     src={imagePreview}
//                     alt="Preview"
//                     className="w-24 h-24 rounded-full object-cover"
//                   />
//                 </div>
//               )}
//             </>
//           ) : (
//             <>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Tag Name
//                 </label>
//                 <input
//                   type="text"
//                   {...register("name", { required: "Tag Name is required" })}
//                   className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.name
//                       ? "border-red-500 focus:ring-red-500"
//                       : "border-gray-300 focus:ring-blue-500"
//                     }`}
//                 />
//                 {errors.name && (
//                   <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Tag Description
//                 </label>
//                 <textarea
//                   rows={3}
//                   {...register("description")}
//                   className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           )}

//           {/* Actions */}
//           <div className="flex justify-end space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={handleClose}
//               className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
//             >
//               Save
//             </button>
//           </div>
//         </form>
//       </div>
//     </Dialog>
//   );
// };

// export default CreateAuthorTagModal;


'use client'

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog } from "@headlessui/react";

const CreateAuthorModal = ({ open, handleClose, onSubmit }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null); // Custom input ref

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      designation: "",
      socialLink: "",
      file: null,
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
      setImagePreview(null);
    }
  }, [open, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 overflow-y-auto max-h-[95vh]">
        <Dialog.Title className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">Add New Author</Dialog.Title>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          
          {/* Text Inputs */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Author Name</label>
              <input type="text" {...register("name", { required: "Name is required" })} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Designation</label>
              <input type="text" {...register("designation", { required: "Designation is required" })} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>

          {/* Custom Image Input - Yahan dhyan dein */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo</label>
            <Controller
              name="file"
              control={control}
              rules={{ required: "Image is required" }}
              render={({ field: { onChange, value } }) => (
                <div className="flex flex-col items-center justify-center">
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      imagePreview ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover shadow-md" />
                    ) : (
                      <div className="text-center">
                        <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-1 text-xs text-gray-500">Click to upload photo</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          onChange(file); // React Hook Form Update
                          setImagePreview(URL.createObjectURL(file)); // Preview Update
                        }
                      }}
                    />
                  </div>
                  {errors.file && <p className="text-red-500 text-[11px] mt-1">{errors.file.message}</p>}
                </div>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Bio / Description</label>
            <textarea rows={3} {...register("description", { required: "Bio is required" })} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100" />
          </div>

          <div className="flex gap-3 pt-6">
            <button type="button" onClick={handleClose} className="flex-1 px-4 py-2 border rounded-lg text-sm font-bold">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Add Author</button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default CreateAuthorModal;