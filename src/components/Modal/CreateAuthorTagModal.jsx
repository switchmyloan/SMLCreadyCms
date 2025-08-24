import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog } from "@headlessui/react";

const CreateAuthorTagModal = ({ open, handleClose, type, onSubmit }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      description: "",
      designation: "",
      socialLink: "",
    },
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      profileImageUrl: imagePreview,
    });
    reset();
    setImagePreview(null);
    handleClose();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        {/* Title */}
        <Dialog.Title className="text-lg font-semibold mb-4">
          {type === "author" ? "Create Author" : "Create Tag"}
        </Dialog.Title>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {type === "author" ? (
            <>
              {/* Name + Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Author Name
                  </label>
                  <input
                    type="text"
                    {...register("name", { required: true })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Designation
                  </label>
                  <input
                    type="text"
                    {...register("designation", { required: true })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Social Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Social Link
                </label>
                <input
                  type="text"
                  {...register("socialLink", { required: true })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  {...register("description", { required: true })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {imagePreview && (
                <div className="flex justify-center mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tag Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: true })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tag Description
                </label>
                <textarea
                  rows={3}
                  {...register("description")}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default CreateAuthorTagModal;
