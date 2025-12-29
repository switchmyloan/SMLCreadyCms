import { useController } from "react-hook-form";
import { useEffect, useState } from "react";
import ToastNotification from "@components/Notification/ToastNotification"; // Adjust path as needed
import ValidatedLabel from "@components/Form/ValidatedLabel"; // Adjust path as needed

const Uploader = ({ name, control, label, errors, rules }) => {
  const {
    field: { onChange, value },
  } = useController({
    name,
    control,
    rules,
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  // Handle image preview and cleanup
  useEffect(() => {
    if (value) {
      if (value instanceof File) {
        // For new uploads (create mode or new file in edit mode)
        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url); // Clean up to prevent memory leaks
      } else if (typeof value === "string" && value) {
        // For edit mode with existing image URL
        setPreviewUrl(value);
      }
    } else {
      setPreviewUrl(null); // Clear preview if no image
    }
  }, [value]);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (e.g., images only)
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        ToastNotification.error("Please upload a valid image (JPEG, PNG, GIF)");
        return;
      }
      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        ToastNotification.error("Image size must be less than 5MB");
        return;
      }
      onChange(file); // Update form value with File object
    }
  };

  const validateImageResolution = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const width = img.width;
        const height = img.height;

        const aspectRatio = width / height;
        const expectedRatio = 16 / 9;

        if (
          width < 800 ||
          height < 450 ||
          Math.abs(aspectRatio - expectedRatio) > 0.05
        ) {
          reject(
            "Image must be 16:9 (Recommended: 1200×675, Minimum: 800×450)"
          );
        } else {
          resolve(true);
        }
      };
    });
  };

  return (
    <div className="mb-4">
      {/* <ValidatedLabel label={label} /> */}
      <div className="flex flex-col gap-2 cursor-pointer">
        {/* File Input */}
        {/* <input
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        /> */}
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // 1️⃣ File type validation
            const validTypes = ["image/jpeg", "image/png", "image/webp"];
            if (!validTypes.includes(file.type)) {
              ToastNotification.error("Only JPG, PNG, WEBP allowed");
              e.target.value = "";
              return;
            }

            // 2️⃣ File size validation (5MB)
            if (file.size > 5 * 1024 * 1024) {
              ToastNotification.error("Image size must be under 5MB");
              e.target.value = "";
              return;
            }

            try {
              // 3️⃣ Resolution + aspect ratio validation
              await validateImageResolution(file);

              // ✅ Correct RHF update
              onChange(file);
            } catch (err) {
              ToastNotification.error(err);
              e.target.value = "";
            }
          }}
          className="block w-full text-sm text-gray-500
    file:mr-4 file:py-2 file:px-4
    file:rounded-md file:border-0
    file:text-sm file:font-semibold
    file:bg-blue-50 file:text-blue-700
    hover:file:bg-blue-100"
        />

        <p className="text-xs text-gray-500 mt-1">
          Recommended image size: 1200×675 (16:9). Minimum: 800×450
        </p>

        {/* Image Preview */}
        {previewUrl && (
          <div className="mt-2">
            <img
              src={previewUrl}
              alt="Image preview"
              className="object-cover rounded w-32 h-32"
            />
          </div>
        )}

        {/* Error Message */}
        {errors[name] && (
          <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
        )}
      </div>
    </div>
  );
};

export default Uploader;
