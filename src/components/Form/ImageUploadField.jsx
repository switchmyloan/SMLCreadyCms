// import React, { useState, useEffect } from "react";
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

//   // Sync preview with field value
//   useEffect(() => {
//     if (control._formValues[name]) {
//       const value = control._formValues[name];
//       setPreview(value instanceof File ? URL.createObjectURL(value) : value);
//     } else {
//       setPreview(defaultPreview);
//     }
//   }, [control._formValues[name], defaultPreview]);

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
//       render={({ field: { onChange, value } }) => (
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
//                 onError={(e) => {
//                   console.error('Image failed to load:', preview);
//                   e.target.src = 'https://avatar.iran.liara.run/public/38'; // Fallback image
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
import { X, Upload } from "lucide-react";

const ImageUploadField = ({
  name,
  control,
  label = "Upload Image",
  rules,
  errors,
  defaultPreview = null,
  maxWidth = 100,
  maxHeight = 100,
}) => {
  const [preview, setPreview] = useState(defaultPreview);

  // Sync preview with form values
  useEffect(() => {
    if (control?._formValues?.[name]) {
      const value = control._formValues[name];
      setPreview(value instanceof File ? URL.createObjectURL(value) : value);
    } else {
      setPreview(defaultPreview);
    }
  }, [control?._formValues?.[name], defaultPreview]);

  const handleImageChange = (e, onChange) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange(file);
    }
  };

  const handleRemove = (onChange) => {
    setPreview(null);
    onChange(null);
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange } }) => (
        <div className="space-y-3">
          {/* Upload Button */}
          {!preview && (
            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e, onChange)}
              />
              <Upload className="w-6 h-6 text-gray-500 mb-1" />
              <span className="text-gray-600 text-sm">{label}</span>
            </label>
          )}

          {/* Preview Section */}
          {preview && (
            <div className="relative w-fit">
              <img
                src={preview}
                alt="Preview"
                className="rounded-lg shadow object-contain transition"
                style={{
                  maxWidth: maxWidth,
                  maxHeight: maxHeight,
                }}
                onError={(e) => {
                  console.error("Image failed to load:", preview);
                  e.currentTarget.src =
                    "https://avatar.iran.liara.run/public/38";
                }}
              />
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(onChange)}
                className="absolute top-2 right-2 bg-white rounded-full shadow p-1 hover:bg-red-500 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Error Message */}
          {errors?.[name] && (
            <p className="text-red-500 text-sm">{errors[name]?.message}</p>
          )}
        </div>
      )}
    />
  );
};

export default ImageUploadField;
