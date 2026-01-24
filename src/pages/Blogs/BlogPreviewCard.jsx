import React from "react";

const BASE_URL = import.meta.env.VITE_IMAGE_URL;

const BlogCard = ({ blog }) => {
  // Format date if it exists, otherwise use a placeholder
  const formattedDate = blog?.createdAt 
    ? new Date(blog.createdAt).toLocaleDateString('en-US') 
    : "1/23/2026";

  return (
    <div className="w-full max-w-[350px] bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="w-full h-[200px]">
        <img
          src={`${BASE_URL}${blog.metaImage}`}
          alt={blog?.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "https://via.placeholder.com/400x200"; }}
        />
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col gap-3">
        {/* Title */}
        <h3 className="text-xl font-bold text-[#002B49] leading-tight line-clamp-2">
          {blog?.title || "Union Budget 2026-27: Key Dates & Schedule Explained Simply for..."}
        </h3>

        {/* Description/Excerpt */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {blog?.description || "Every year around this time, there is a familiar buzz in the air. News debates, office conversations, and WhatsApp forwards all ask the same question: 'Wh..."}
        </p>

        {/* Date */}
        <div className="mt-2 text-gray-400 text-sm font-medium">
          {formattedDate}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;