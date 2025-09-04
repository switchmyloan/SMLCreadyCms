import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import ToastNotification from "@components/Notification/ToastNotification";
import { useNavigate } from "react-router-dom";
// import { createBlog } from "@api/cms-services"; // <-- API call create blog ke liye

const BlogForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    status: "draft",
  });
  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    // try {
    //   setLoading(true);
    //   const response = await createBlog(formData); // API call

    //   if (response?.data?.success) {
    //     ToastNotification.success("Blog created successfully!");
    //     navigate("/blogs"); // list page par redirect
    //   } else {
    //     ToastNotification.error("Failed to create blog");
    //   }
    // } catch (error) {
    //   console.error("Error creating blog:", error);
    //   ToastNotification.error("Something went wrong");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className=" mx-auto bg-white shadow-lg rounded-lg p-6">
      <Toaster />
      <h2 className="text-2xl font-bold mb-6">On Board Lender</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="5"
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          ></textarea>
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium">Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/blogs")}
            className="px-4 py-2 rounded-lg border border-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Blog"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
