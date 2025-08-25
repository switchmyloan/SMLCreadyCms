import React, { useEffect, useState } from 'react'
import DataTable from '../../components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { getBlogs } from '../../api-services/cms-services';
import ToastNotification from '../../components/Notification/ToastNotification';
import { blogColumn } from '../../components/TableHeader';


const Blogs = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
 const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const handleCreate = () => {

    navigate("/blogs/create");
  }

  const fetchBlogs = async () => {
    try {
      // setLoadingData(true);
      const response = await getBlogs(1, 10, '');

      console.log('Response:', response.data.data);
      if (response?.data?.success) {
        setData(response?.data?.data?.data || []);
        setTotalDataCount(response?.data?.data?.pagination?.totalItems || 0);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error('Error fetching:', error);
      ToastNotification.error('Failed to fetch data');
      // router.push('/login');
    } finally {
      // setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    fetchBlogs(pagination);
  }, [pagination]);
  return (
    <>
      <Toaster />
      <DataTable
        columns={blogColumn}
        data={data}
        totalDataCount={totalDataCount}
        onCreate={handleCreate}
        createLabel="Add Blog"
        onPageChange={(pagination) => setPagination(pagination)}
      />
    </>
  )
}

export default Blogs
