import Api from "../api";

export const AddAuthor = async (formData) => {
  return Api().post('/author', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
export const getAuthor = async (pageNo, limit, globalFilter) => {
  return Api().get(`/author?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`)
}
export const getBlogCategory = async () => {
  return Api().get(`/category/admin/blog-category`,
    {
      skipAdminAppend: true,
    }
  )

}

export const AddBlogCategory = async (payload) => {
  return Api().post(
    `/category/admin/blog-category`,
    payload,
    {
      skipAdminAppend: true,
    }
  );
};
