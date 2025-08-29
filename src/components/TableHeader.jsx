import { Edit2, Trash2 } from 'lucide-react';

export const blogColumn = ({handleEdit}) => [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Slug',
    accessorKey: 'slug',
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
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Edit2 size={20} />
          </button>
          {/* <button
            onClick={() => console.log('Delete', row.original)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button> */}
        </div>
      );
    },
  },
];
export const faqColumn = ({handleEdit}) => [
  {
    header: 'Questions',
    accessorKey: 'question',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Answers',
    accessorKey: 'answer',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Category',
    accessorKey: 'category_xid',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Featured',
    accessorKey: 'isFeatured',
    cell: ({ getValue }) => getValue() ? 'True' : 'False' || 'N/A',
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Edit2 size={20} />
          </button>
          {/* <button
            onClick={() => console.log('Delete', row.original)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button> */}
        </div>
      );
    },
  },
];
export const pressColumn = ({handleEdit}) => [
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
  {
    header: 'Order',
    accessorKey: 'order',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex space-x-3">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Edit2 size={20} />
          </button>
          {/* <button
            onClick={() => console.log('Delete', row.original)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button> */}
        </div>
      );
    },
  },
];