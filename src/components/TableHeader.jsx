import { Edit2, Image, Trash2, Eye, Trash } from 'lucide-react';
const S3_IMAGE_PATH = import.meta.env.VITE_IMAGE_URL
import { FaUserPlus } from "react-icons/fa";

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
    accessorKey: 'isActive',
    cell: ({ getValue }) => {
      const isActive = getValue(); // This returns a boolean: true or false

      // Determine the text and badge color based on the boolean value
      const statusText = isActive ? 'Active' : 'Inactive';
      const badgeColorClass = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeColorClass}`}>
          {statusText}
        </span>
      );
    },
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
export const faqColumn = ({ handleEdit, handleDelete }) => [
  {
    header: 'Questions',
    accessorKey: 'question',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  // {
  //   header: "Answers",
  //   accessorKey: "answer",
  //   cell: ({ getValue }) => (
  //     <div
  //       style={{
  //         minWidth: "150px",
  //         maxWidth: "200px",
  //         whiteSpace: "nowrap",
  //         overflow: "hidden",
  //         textOverflow: "ellipsis",
  //       }}
  //       className="tooltip cursor-pointer "
  //       data-tip={getValue() || "N/A"}
  //       title={getValue() || "N/A"}
  //     >
  //       {getValue() || "N/A"}
  //     </div>
  //   ),
  // },

  {
    header: 'Category',
    accessorKey: 'category_xid',
    cell: ({ row }) => {
      return row?.original?.category ? row?.original?.category.name : 'N/A'
    }
  },
  {
    header: 'Module',
    accessorKey: 'module',
    cell: ({ row }) => {
      return row?.original?.module ? (row?.original?.module).toUpperCase().split('_').join(' ') : 'N/A'
    }
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
          <button
            onClick={() => handleDelete(row.original)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button>
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
export const pressColumn = ({ handleEdit, handleDelete }) => [
  {
    header: "Title",
    accessorKey: "title",
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
          <button
            onClick={() => handleDelete(row.original)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash2 size={20} />
          </button>
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
    header: 'SN', // Serial Number
    id: 'sn',
    enableSorting: false, // Serial numbers shouldn't be sortable
    maxSize: 50,
    cell: ({ row, table }) => {
      // 1. Get current pagination state from the table instance
      const { pageIndex, pageSize } = table.getState().pagination;

      // 2. Calculate the global row index
      // Formula: (Current Page Index * Page Size) + Row Index on current page + 1
      return (pageIndex * pageSize) + row.index + 1;
    },
  },
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Min Amount',
    accessorKey: 'minimumLoanAmount',
    cell: ({ getValue }) => {
      const income = getValue();

      if (income === null || income === undefined || isNaN(income)) {
        return 'N/A';
      }

      const formattedIncome = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(income);

      return formattedIncome;
    },
  },
  {
    header: 'Max Amount',
    accessorKey: 'maximumLoanAmount',
    cell: ({ getValue }) => {
      const income = getValue();

      if (income === null || income === undefined || isNaN(income)) {
        return 'N/A';
      }

      const formattedIncome = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(income);

      return formattedIncome;
    },
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
    cell: ({ getValue }) => {
      const isActive = getValue(); // This returns a boolean: true or false

      // Determine the text and badge color based on the boolean value
      const statusText = isActive ? 'Active' : 'Inactive';
      const badgeColorClass = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeColorClass}`}>
          {statusText}
        </span>
      );
    },
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
    header: 'SN', // Serial Number
    id: 'sn',
    enableSorting: false, // Serial numbers shouldn't be sortable
    maxSize: 50,
    cell: ({ row, table }) => {
      // 1. Get current pagination state from the table instance
      const { pageIndex, pageSize } = table.getState().pagination;

      // 2. Calculate the global row index
      // Formula: (Current Page Index * Page Size) + Row Index on current page + 1
      return (pageIndex * pageSize) + row.index + 1;
    },
  },
  {
    header: 'Name',
    accessorKey: 'name',
    size: 120,    // fixed width
    minSize: 120,
    maxSize: 120,
    cell: ({ row }) => {
      const firstName = row.original.firstName || '';
      const lastName = row.original.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'N/A';

      return (
        <div
          className="truncate"
          style={{ maxWidth: '120px' }}
          title={fullName} // Tooltip shows full name on hover
        >
          {fullName}
        </div>
      );
    },
  },


  {
    header: 'Number',
    accessorKey: 'phoneNumber',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Source',
    accessorKey: 'utm_source',
    cell: info => {
      const source = info.row.original.utm_header?.utm_source || 'N/A'; // optional chaining + fallback
      return (
        <div
          className="truncate"
          style={{ maxWidth: '150px' }} // adjust width as needed
          title={source} // tooltip on hover
        >
          {source}
        </div>
      );
    }
  },
  {
    header: 'Gender',
    accessorKey: 'gender',
    cell: ({ getValue }) => {
      const genderValue = getValue();
      // Normalize the value to a consistent case (e.g., lowercase)
      const normalizedGender = typeof genderValue === 'string' ? genderValue.toLowerCase() : genderValue;

      // Check for "male" or "female" using the normalized value
      const isMale = normalizedGender === 'male';
      const isFemale = normalizedGender === 'female';

      let genderText = 'N/A';
      let badgeColorClass = 'bg-gray-100 text-gray-800'; // Default for N/A

      if (isMale) {
        genderText = 'Male';
        badgeColorClass = 'bg-blue-100 text-blue-800';
      } else if (isFemale) {
        genderText = 'Female';
        badgeColorClass = 'bg-pink-100 text-pink-800';
      }

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeColorClass}`}>
          {genderText}
        </span>
      );
    },
  },
  {
    header: 'Job Type',
    accessorKey: 'jobType',
    cell: ({ getValue }) => {
      const jobType = getValue();

      // Function to convert to Title Case
      const toTitleCase = (str) => {
        if (!str) return 'N/A';
        return str
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const formattedJobType = toTitleCase(jobType);

      // Define a mapping of job types to badge styles
      const badgeStyles = {
        'Salaried': 'bg-blue-100 text-blue-800',
        'Self-Employed': 'bg-green-100 text-green-800',
        'Self-employed': 'bg-green-100 text-green-800',
        'Business Owner': 'bg-purple-100 text-purple-800',
        'Freelancer': 'bg-yellow-100 text-yellow-800',
        'Student': 'bg-indigo-100 text-indigo-800',
        'Other': 'bg-gray-100 text-gray-800',
      };

      // Get the style for the formatted job type, defaulting to 'Other'
      const style = badgeStyles[formattedJobType] || badgeStyles['Other'];

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${style}`}>
          {formattedJobType}
        </span>
      );
    },
  },
  {
    header: 'Income',
    accessorKey: 'monthlyIncome',
    cell: ({ getValue }) => {
      const income = getValue();

      if (income === null || income === undefined || isNaN(income)) {
        return 'N/A';
      }

      const formattedIncome = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(income);

      return formattedIncome;
    },
  },
  {
    header: 'DOB',
    accessorKey: 'dateOfBirth',
    cell: ({ getValue }) => {
      const dateStr = getValue();
      if (!dateStr) {
        return 'N/A';
      }

      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },
  },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const dateStr = getValue();
      if (!dateStr) {
        return 'N/A';
      }

      const date = new Date(dateStr);
      const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };

      // Create a new formatter for the 'en-IN' locale (English - India)
      const formatter = new Intl.DateTimeFormat('en-IN', options);

      // Format the date and replace the space with a forward slash
      const formattedDate = formatter.format(date).replace(/ /g, ' ');

      return (
        <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
          {formattedDate}
        </span>
      );
    },
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
export const signInColumns = ({ handleEdit, handleDelete }) => [
  {
    header: 'SN', // Serial Number
    id: 'sn',
    enableSorting: false, // Serial numbers shouldn't be sortable
    maxSize: 50,
    cell: ({ row, table }) => {
      // 1. Get current pagination state from the table instance
      const { pageIndex, pageSize } = table.getState().pagination;

      // 2. Calculate the global row index
      // Formula: (Current Page Index * Page Size) + Row Index on current page + 1
      return (pageIndex * pageSize) + row.index + 1;
    },
  },
  {
    header: 'First Name',
    accessorKey: 'firstName',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Last Name',
    accessorKey: 'lastName',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Number',
    accessorKey: 'phoneNumber',
    cell: ({ getValue }) => getValue() || 'N/A',
  },
  {
    header: 'Gender',
    accessorKey: 'gender',
    cell: ({ getValue }) => {
      const genderValue = getValue();
      // Normalize the value to a consistent case (e.g., lowercase)
      const normalizedGender = typeof genderValue === 'string' ? genderValue.toLowerCase() : genderValue;

      // Check for "male" or "female" using the normalized value
      const isMale = normalizedGender === 'male';
      const isFemale = normalizedGender === 'female';

      let genderText = 'N/A';
      let badgeColorClass = 'bg-gray-100 text-gray-800'; // Default for N/A

      if (isMale) {
        genderText = 'Male';
        badgeColorClass = 'bg-blue-100 text-blue-800';
      } else if (isFemale) {
        genderText = 'Female';
        badgeColorClass = 'bg-pink-100 text-pink-800';
      }

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${badgeColorClass}`}>
          {genderText}
        </span>
      );
    },
  },
  {
    header: 'Job Type',
    accessorKey: 'jobType',
    cell: ({ getValue }) => {
      const jobType = getValue();

      // Function to convert to Title Case
      const toTitleCase = (str) => {
        if (!str) return 'N/A';
        return str
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const formattedJobType = toTitleCase(jobType);

      // Define a mapping of job types to badge styles
      const badgeStyles = {
        'Salaried': 'bg-blue-100 text-blue-800',
        'Self-Employed': 'bg-green-100 text-green-800',
        'Self-employed': 'bg-green-100 text-green-800',
        'Business Owner': 'bg-purple-100 text-purple-800',
        'Freelancer': 'bg-yellow-100 text-yellow-800',
        'Student': 'bg-indigo-100 text-indigo-800',
        'Other': 'bg-gray-100 text-gray-800',
      };

      // Get the style for the formatted job type, defaulting to 'Other'
      const style = badgeStyles[formattedJobType] || badgeStyles['Other'];

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${style}`}>
          {formattedJobType}
        </span>
      );
    },
  },
  {
    header: 'Income',
    accessorKey: 'monthlyIncome',
    cell: ({ getValue }) => {
      const income = getValue();

      if (income === null || income === undefined || isNaN(income)) {
        return 'N/A';
      }

      const formattedIncome = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(income);

      return formattedIncome;
    },
  },
  {
    header: 'DOB',
    accessorKey: 'dateOfBirth',
    cell: ({ getValue }) => {
      const dateStr = getValue();
      if (!dateStr) {
        return 'N/A';
      }

      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },
  },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const dateStr = getValue();
      if (!dateStr) {
        return 'N/A';
      }

      const date = new Date(dateStr);
      const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };

      // Create a new formatter for the 'en-IN' locale (English - India)
      const formatter = new Intl.DateTimeFormat('en-IN', options);

      // Format the date and replace the space with a forward slash
      const formattedDate = formatter.format(date).replace(/ /g, ' ');

      return (
        <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
          {formattedDate}
        </span>
      );
    },
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
export const archiveColumns = ({ handleEdit, handleDelete }) => [
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

export const groupListFullColumns = ({ handleEdit, handleAddUsers }) => [
  {
    header: "Group Title",
    accessorKey: "title",
    cell: ({ getValue }) => getValue() || "N/A",
  },
  // {
  //   header: "Users",
  //   accessorKey: "audienceCount",
  //   cell: ({ getValue }) => getValue() || "0",
  // },
  {
    header: "Created On",
    accessorKey: "createdAt",
    cell: ({ getValue }) => getValue(),
  },

  // ACTION BUTTONS (Edit + Add Users)
  {
    header: "Actions",
    accessorKey: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex space-x-3 items-center">

          {/* EDIT */}
          <button
            onClick={(row) => {
              console.log(item, "items")
              handleEdit(item)
            }}
            title='Edit Group'
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Edit2 size={18} />
          </button>

          {/* ADD USERS */}
          <button
            onClick={() => handleAddUsers(item)}
            className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition"
            title='Add Users'
          >
            <FaUserPlus size={18} />
          </button>

        </div>
      );
    },
  },
];


export const pushNotificationColumns = ({ sendNotification, handleEdit }) => [
  {
    header: "Title",
    accessorKey: "title",
    cell: ({ getValue }) => getValue() || "N/A",
  },
  {
    header: "Message",
    accessorKey: "message",
    cell: ({ getValue }) => getValue() || "0",
  },
  {
    header: "group",
    accessorKey: "group",
    cell: ({ row }) => {
      console.log(row.original.group.groupName, "gervale")
      return row.original.group.groupName
    }
  },

  // ACTION BUTTONS (Edit + Add Users)
  {
    header: "Actions",
    accessorKey: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex space-x-3 items-center">

          {/* ADD USERS */}
          <button
            title="Send Notification"
            onClick={() => sendNotification(item.id)}
            className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition"
          >
            <FaUserPlus size={18} />
          </button>
          {/* EDIT */}
          <button
            title="Edit"
            onClick={(row) => handleEdit(item)}
            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition"
          >
            <Edit2 size={18} />
          </button>

          <button
            title="Delete"
            onClick={(row) => handleEdit(item)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            <Trash size={18} />
          </button>

        </div>
      );
    },
  },
];
export const contactUsColumns = ({ sendNotification }) => [
  {
    header: "Name",
    accessorKey: "fullName",
    cell: ({ getValue }) => getValue() || "N/A",
  },
  {
    header: "Interest",
    accessorKey: "interest",
    cell: ({ getValue }) => getValue() || "N/A",
  },
  {
    header: "Mobile",
    accessorKey: "mobile",
    cell: ({ getValue }) => getValue() || "N/A",
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ getValue }) => getValue() || "N/A",
  },
  {
    header: "Comment",
    accessorKey: "comment",
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
    header: 'Created At',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => {
      const dateStr = getValue();
      if (!dateStr) {
        return 'N/A';
      }

      const date = new Date(dateStr);
      const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };

      // Create a new formatter for the 'en-IN' locale (English - India)
      const formatter = new Intl.DateTimeFormat('en-IN', options);

      // Format the date and replace the space with a forward slash
      const formattedDate = formatter.format(date).replace(/ /g, ' ');

      return (
        <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800">
          {formattedDate}
        </span>
      );
    },
  },
];