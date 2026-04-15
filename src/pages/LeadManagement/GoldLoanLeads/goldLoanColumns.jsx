import React from 'react';

const formatDate = (val) => {
  if (!val) return 'N/A';
  const d = new Date(val);
  if (isNaN(d.getTime())) return 'N/A';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatINR = (v) => {
  if (v === null || v === undefined || v === '' || isNaN(Number(v))) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(v));
};

const Badge = ({ children, color }) => (
  <span
    className={`px-2 py-1 rounded-md text-xs font-medium ${color}`}
  >
    {children}
  </span>
);

export const goldLoanLeadsColumn = () => [
  {
    header: 'SN',
    id: 'sn',
    enableSorting: false,
    maxSize: 50,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  {
    header: 'Name',
    id: 'name',
    cell: ({ row }) => {
      const lead = row.original?.lead || {};
      const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
      return (
        <div className="truncate max-w-[160px]" title={fullName || 'N/A'}>
          {fullName || 'N/A'}
        </div>
      );
    },
  },
  {
    header: 'Phone',
    id: 'phoneNumber',
    cell: ({ row }) => row.original?.lead?.phoneNumber || 'N/A',
  },
  {
    header: 'Email',
    id: 'emailAddress',
    cell: ({ row }) => (
      <div
        className="truncate max-w-[180px]"
        title={row.original?.lead?.emailAddress || ''}
      >
        {row.original?.lead?.emailAddress || 'N/A'}
      </div>
    ),
  },
  {
    header: 'Gender',
    id: 'gender',
    cell: ({ row }) => {
      const g = row.original?.lead?.gender;
      if (!g) return 'N/A';
      return g.charAt(0).toUpperCase() + g.slice(1);
    },
  },
  {
    header: 'Income',
    id: 'income',
    cell: ({ row }) => formatINR(row.original?.lead?.monthlyIncome),
  },
  {
    header: 'Offer',
    id: 'isOffer',
    cell: ({ row }) =>
      row.original?.isOffer ? (
        <Badge color="bg-green-100 text-green-800">Yes</Badge>
      ) : (
        <Badge color="bg-red-100 text-red-700">No</Badge>
      ),
  },
  {
    header: 'Offer Loan',
    id: 'offerLoan',
    cell: ({ row }) => formatINR(row.original?.offerLoan),
  },
  {
    header: 'Tenure',
    id: 'tenure',
    cell: ({ row }) => row.original?.tenure || 'N/A',
  },
  {
    header: 'Clicked',
    id: 'isClicked',
    cell: ({ row }) =>
      row.original?.isClicked ? (
        <Badge color="bg-indigo-100 text-indigo-800">Yes</Badge>
      ) : (
        <Badge color="bg-gray-100 text-gray-700">No</Badge>
      ),
  },
  {
    header: 'Status',
    id: 'status',
    cell: ({ row }) => row.original?.status || 'N/A',
  },
  {
    header: 'Message',
    id: 'message',
    cell: ({ row }) => (
      <div
        className="truncate max-w-[200px]"
        title={row.original?.message || ''}
      >
        {row.original?.message || 'N/A'}
      </div>
    ),
  },
  {
    header: 'Expiry',
    id: 'expiryDate',
    cell: ({ row }) => formatDate(row.original?.expiryDate),
  },
  {
    header: 'Submitted At',
    id: 'createdAt',
    cell: ({ row }) => formatDate(row.original?.createdAt),
  },
  {
    header: 'Redirect',
    id: 'redirectLink',
    cell: ({ row }) => {
      const link = row.original?.redirectLink;
      if (!link) return 'N/A';
      return (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline text-xs"
        >
          Open
        </a>
      );
    },
  },
];
