import Api from './api'


export const getTags = async (pageNo, limit, globalFilter) => {
  return Api().get(`/tag?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`)
}
export const GetTagById = async id => Api().get(`/tag/${id}`)
export const AddTag = async payload => Api().post(`/tag`, payload)
export const DeleteTag = async id => Api().delete(`/tag/${id}`) 

export const getBlogs = async (pageNo, limit, globalFilter) => {
  return Api().get(`/blog?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`)
}
export const getBlogById = async id => Api().get(`/blog/${id}`)
export const AddBlog = async (formData) => {
  return Api().post('/blog', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
export const UpdateBlog = async payload => {
  const { id, ...data } = payload
  return Api().patch(`/blog/${id}`, data)
}


// Author
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

// FAQ API
export const getFaq = async (pageNo, limit, globalFilter) => {
  return Api().get(`/faq?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`)
}
export const AddFaq = async payload => Api().post(`/faq`, payload)

// Category APIS
export const getCategory = async (pageNo, limit, globalFilter) => {
  return Api().get(`/category?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`)
}