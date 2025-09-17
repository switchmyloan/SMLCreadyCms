import { Edit2, Image, Trash2 , Eye} from 'lucide-react';
const S3_IMAGE_PATH = import.meta.env.VITE_IMAGE_URL

export const blogColumn = ({ handleEdit }) => [
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
    header: "Description",
    accessorKey: "description",
    cell: ({ getValue }) => (
      <div
        style={{
          minWidth: "150px",
          maxWidth: "200px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        className="tooltip cursor-pointer "
        data-tip={getValue() || "N/A"}
        title={getValue() || "N/A"}
      >
        {getValue() || "N/A"}
      </div>
    ),
  },
  {
    header: 'Banner',
    accessorKey: 'metaImage',
    cell: info => {
      const imageUrl = info.row.original.metaImage

      if (!imageUrl) {
        return null
      }
      const imagePath = `${S3_IMAGE_PATH}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
      console.log(imagePath, "imagePath")
      return (
        <>
          <img
            src={imagePath}
            alt="blog image"
            onError={(e) => {
              e.currentTarget.src = "https://dummyimage.com/100x50/cccccc/000000&text=No+Image"; // public folder me rakho
            }}
            style={{
              objectFit: 'cover',
              marginBottom: '10px',
              width: '100px',
              height: '50px',
              borderRadius: "0px"
            }}
          />

        </>
      )
    },
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
export const faqColumn = ({ handleEdit }) => [
  {
    header: 'Questions',
    accessorKey: 'question',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: "Answers",
    accessorKey: "answer",
    cell: ({ getValue }) => (
      <div
        style={{
          minWidth: "150px",
          maxWidth: "200px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        className="tooltip cursor-pointer "
        data-tip={getValue() || "N/A"}
        title={getValue() || "N/A"}
      >
        {getValue() || "N/A"}
      </div>
    ),
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
export const testimonialsColumn = ({ handleEdit }) => [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Designation',
    accessorKey: 'designation',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Company',
    accessorKey: 'company',
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
export const pressColumn = ({ handleEdit }) => [
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
export const bannerColumn = ({ handleEdit, handleDelete }) => [
  {
    header: 'Title',
    accessorKey: 'bannerTitle',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Description',
    accessorKey: 'bannerDescription',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Banner',
    accessorKey: 'bannerImage',
    cell: info => {
      const imageUrl = info.row.original.bannerImage

      if (!imageUrl) {
        return null
      }
      const imagePath = `${S3_IMAGE_PATH}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
      console.log(imagePath, "imagePath")
      return (
        <>
          <img src={imagePath} alt=""

            style={{
              objectFit: 'cover',
              marginBottom: '10px',
              width: '100px',
              height: '50px',
            }}
          />

        </>
      )
    },
  },
  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: ({ getValue }) => getValue() ? 'True' : 'False',
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
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button>
        </div>
      );
    },
  },
];
export const lenderColumn = ({ handleEdit, handleDelete }) => [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Max Amount',
    accessorKey: 'maximumLoanAmount',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Min Amount',
    accessorKey: 'minimumLoanAmount',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Min Tenure',
    accessorKey: 'minimumTenure',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Max Tenure',
    accessorKey: 'maximumTenure',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Rate',
    accessorKey: 'startingInterestRate',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
 
  
  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: ({ getValue }) => getValue() ? 'True' : 'False',
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
            onClick={() => handleDelete(row.original.id)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button> */}
        </div>
      );
    },
  },
];
export const leadsColumn = ({ handleEdit, handleDelete }) => [
  {
    header: 'FirstName',
    accessorKey: 'firstName',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'LastName',
    accessorKey: 'lastName',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'phoneNumber',
    accessorKey: 'phoneNumber',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'BioMetric',
    accessorKey: 'isBioMetricEnabled',
    cell: ({ getValue }) => getValue() ? 'True' : 'False',
  },
  {
    header: 'Mpin Enabled',
    accessorKey: 'isMpinEnabled',
    cell: ({ getValue }) => getValue() ? 'True' : 'False',
  },
  {
    header: 'Email Verified',
    accessorKey: 'isEmailVerified',
    cell: ({ getValue }) => getValue() ? 'True' : 'False',
  },
  
  {
    header: 'Phone Verified',
    accessorKey: 'isPhoneVerified',
    cell: ({ getValue }) => (
      <span className="flex space-x-3">
        {getValue() ? (
          <span className="p-2 font-semibold">Active</span>
        ) : (
          <span className="p-2 font-semibold">Inactive</span>
        )}
      </span>
    )
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
            <Eye size={20} />
          </button>
        </div>
      );
    },
  },
];