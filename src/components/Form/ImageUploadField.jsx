// import React, { useState } from "react";
// import { Controller } from "react-hook-form";

// const ImageUploadField = ({
//   name,
//   control,
//   label = "Upload Image",
//   rules,
//   errors,
//   defaultPreview = null,
//   maxWidth = 300, // max width of preview
//   maxHeight = 300, // max height of preview
// }) => {
//   const [preview, setPreview] = useState(defaultPreview);

//   const handleImageChange = (e, onChange) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPreview(URL.createObjectURL(file));
//       onChange(file);
//     }
//   };

//   return (
//     <Controller
//       name={name}
//       control={control}
//       rules={rules}
//       render={({ field: { onChange } }) => (
//         <div className="space-y-3">
//           {/* Upload button */}
//           <label className="block">
//             <span className="sr-only">{label}</span>
//             <input
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={(e) => handleImageChange(e, onChange)}
//             />
//             <div className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-700 hover:bg-gray-100">
//               {label}
//             </div>
//           </label>

//           {/* Preview image */}
//           {preview && (
//             <div className="flex justify-left">
//               <img
//                 src={preview}
//                 alt="Preview"
//                 className="object-contain"
//                 style={{
//                   maxWidth: maxWidth,
//                   maxHeight: maxHeight,
//                   width: "40%",
//                   height: "40%",
//                 }}
//               />
//             </div>
//           )}

//           {/* Error message */}
//           {errors[name] && (
//             <p className="text-red-500 text-sm">{errors[name]?.message}</p>
//           )}
//         </div>
//       )}
//     />
//   );
// };

// export default ImageUploadField;


import React, { useState, useEffect } from "react";
import { Controller } from "react-hook-form";

const ImageUploadField = ({
  name,
  control,
  label = "Upload Image",
  rules,
  errors,
  defaultPreview = null,
  maxWidth = 300, // max width of preview
  maxHeight = 300, // max height of preview
}) => {
  const [preview, setPreview] = useState(defaultPreview);

  // Sync preview with field value
  useEffect(() => {
    if (control._formValues[name]) {
      const value = control._formValues[name];
      setPreview(value instanceof File ? URL.createObjectURL(value) : value);
    } else {
      setPreview(defaultPreview);
    }
  }, [control._formValues[name], defaultPreview]);

  const handleImageChange = (e, onChange) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange(file);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <div className="space-y-3">
          {/* Upload button */}
          <label className="block">
            <span className="sr-only">{label}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e, onChange)}
            />
            <div className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-700 hover:bg-gray-100">
              {label}
            </div>
          </label>

          {/* Preview image */}
          {preview && (
            <div className="flex justify-left">
              <img
                src={preview}
                alt="Preview"
                className="object-contain"
                style={{
                  maxWidth: maxWidth,
                  maxHeight: maxHeight,
                  width: "40%",
                  height: "40%",
                }}
                onError={(e) => {
                  console.error('Image failed to load:', preview);
                  e.target.src = 'https://avatar.iran.liara.run/public/38'; // Fallback image
                }}
              />
            </div>
          )}

          {/* Error message */}
          {errors[name] && (
            <p className="text-red-500 text-sm">{errors[name]?.message}</p>
          )}
        </div>
      )}
    />
  );
};

export default ImageUploadField;