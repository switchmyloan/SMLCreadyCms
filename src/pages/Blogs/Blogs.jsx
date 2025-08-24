import React from 'react'
import DataTable from '../../components/Table/DataTable';


const columns = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Email',
    accessorKey: 'email',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Role',
    accessorKey: 'role',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
];

// Data with unique IDs
// const data = [
//   { id: 1, name: 'Amit', email: 'amit@test.com', role: 'Admin' },
//   { id: 2, name: 'Rahul', email: 'rahul@test.com', role: 'Editor' },
//   { id: 3, name: 'Sneha', email: 'sneha@test.com', role: 'Viewer' },
// ].concat(
//   Array.from({ length: 39 }, (_, i) => ({
//     id: i + 4,
//     name: ['Amit', 'Rahul', 'Sneha'][i % 3],
//     email: ['amit@test.com', 'rahul@test.com', 'sneha@test.com'][i % 3],
//     role: ['Admin', 'Editor', 'Viewer'][i % 3],
//   }))
// );

const data = [
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
  { name: "Amit", email: "amit@test.com", role: "Admin" },
  { name: "Rahul", email: "rahul@test.com", role: "Editor" },
  { name: "Sneha", email: "sneha@test.com", role: "Viewer" },
];

const Blogs = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}

export default Blogs
