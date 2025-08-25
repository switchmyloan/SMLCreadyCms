import React, { useEffect, useState } from 'react'
import DataTable from '../../components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { getBlogs } from '../../api-services/cms-services';
import ToastNotification from '../../components/Notification/ToastNotification';


const columns = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Description',
    accessorKey: 'description',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
];


// const data = [
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
//   { name: "Amit", email: "amit@test.com", role: "Admin" },
//   { name: "Rahul", email: "rahul@test.com", role: "Editor" },
//   { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
// ];


const Blogs = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
    const [totalDataCount, setTotalDataCount] = useState(0);

  const handleCreate = () => {

    navigate("/blog-create");
  }

  const fetchBlogs = async () => {
    try {
      // setLoadingData(true);
      const response = await getBlogs(1, 10, '');

      console.log('Response:', response.data.data);
      if (response?.data?.success) {
        setData(response?.data?.data || []);
        setTotalDataCount(response?.data?.pagination?.total || 0);
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
  return (
    <div>
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <DataTable
        columns={columns}
        data={data}
        onCreate={handleCreate}
        createLabel="Add Blog"
      />
    </div>
  )
}

export default Blogs
