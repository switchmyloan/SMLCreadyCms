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
export const AddBlog = async (formData) => {
  return Api().post('/blog', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
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
