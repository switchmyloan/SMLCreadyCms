import { useEffect, useState } from 'react'
import DataTable from '@components/Table/DataTable';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import ToastNotification from '@components/Notification/ToastNotification';
import { getLeads } from '../../../api-services/Modules/Leads';
import { leadsColumn } from '../../../components/TableHeader';


const Leads = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false); // N
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    // totalDataCount: totalDataCount ? totalDataCount : 1
  })
  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: '',

  })

  const handleCreate = () => {

    navigate("/blogs/create");
  }


  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await getLeads(query.page_no, query.limit, '');
      if (response?.data?.success) {
        let blogs = response?.data?.data || [];

        // Sort by createdAt ascending
        blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setData(blogs);
        setTotalDataCount(response?.data?.data?.pagination?.total || 0);
      } else {
        ToastNotification.error("Error fetching data");
      }
    } catch (error) {
      console.error('Error fetching:', error);
      ToastNotification.error('Failed to fetch data');
      // router.push('/login');
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (data) => {
    navigate(`/lead-detail/${data?.id}`, {
      state: { lead: data }
    })
  }

  const onPageChange = (pageNo) => {
    setQuery((prevQuery) => {
      return {
        ...prevQuery,
        page_no: pageNo.pageIndex + 1
      };
    });
  };


  useEffect(() => {
    fetchBlogs();
  }, [query.page_no]);
  return (
    <>
      <Toaster />
      <DataTable
        columns={leadsColumn({
          handleEdit
        })}
        title='Leads'
        data={data}
        totalDataCount={totalDataCount}
        // onCreate={handleCreate}
        createLabel="Create"
        onPageChange={onPageChange}
        setPagination={setPagination}
        pagination={pagination}
        loading={loading}
        onRefresh={fetchBlogs}
      />
    </>
  )
}

export default Leads
