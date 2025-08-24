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

// Author
export const AddAuthor = async payload => Api().post(`/author`, payload)
