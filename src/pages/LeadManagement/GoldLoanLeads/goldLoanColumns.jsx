import React from 'react';

const formatDate = (val) => {
  if (!val) return 'N/A';
  const d = new Date(val);
  if (isNaN(d.getTime())) return 'N/A';
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatINR = (v) => {
  if (v === null || v === undefined || v === '' || isNaN(Number(v))) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(v));
};

const Badge = ({ children, variant = 'default' }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    violet: 'bg-violet-50 text-violet-700 border border-violet-200',
    default: 'bg-gray-50 text-gray-600 border border-gray-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

export const goldLoanLeadsColumn = () => [
  {
    header: '#',
    id: 'sn',
    enableSorting: false,
    maxSize: 50,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return (
        <span className="text-gray-400 text-xs font-medium">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
  },
  {
    header: 'Lead Details',
    id: 'name',
    cell: ({ row }) => {
      const lead = row.original?.lead || {};
      const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
      const email = lead.emailAddress || '';
      const phone = lead.phoneNumber || '';
      return (
        <div className="min-w-[180px]">
          <p className="text-sm font-semibold text-gray-900 truncate" title={fullName || 'N/A'}>
            {fullName || 'N/A'}
          </p>
          {phone && (
            <p className="text-xs text-gray-500 mt-0.5">{phone}</p>
          )}
          {email && (
            <p className="text-xs text-gray-400 truncate max-w-[200px]" title={email}>
              {email}
            </p>
          )}
        </div>
      );
    },
  },
  {
    header: 'Gender',
    id: 'gender',
    cell: ({ row }) => {
      const g = row.original?.lead?.gender;
      if (!g) return <span className="text-gray-300">—</span>;
      return (
        <span className="text-sm text-gray-700">
          {g.charAt(0).toUpperCase() + g.slice(1)}
        </span>
      );
    },
  },
  {
    header: 'Income',
    id: 'income',
    cell: ({ row }) => {
      const val = row.original?.lead?.monthlyIncome;
      if (val === null || val === undefined || val === '' || isNaN(Number(val))) {
        return <span className="text-gray-300">—</span>;
      }
      return (
        <span className="text-sm font-medium text-gray-800 tabular-nums">
          {formatINR(val)}
        </span>
      );
    },
  },
  {
    header: 'Offer Status',
    id: 'isOffer',
    cell: ({ row }) =>
      row.original?.isOffer ? (
        <Badge variant="success">Received</Badge>
      ) : (
        <Badge variant="danger">No Offer</Badge>
      ),
  },
  {
    header: 'Loan Amount',
    id: 'offerLoan',
    cell: ({ row }) => {
      const val = row.original?.offerLoan;
      if (!val) return <span className="text-gray-300">—</span>;
      return (
        <span className="text-sm font-semibold text-emerald-700 tabular-nums">
          {formatINR(val)}
        </span>
      );
    },
  },
  {
    header: 'Tenure',
    id: 'tenure',
    cell: ({ row }) => {
      const t = row.original?.tenure;
      if (!t) return <span className="text-gray-300">—</span>;
      return <span className="text-sm text-gray-700">{t}</span>;
    },
  },
  {
    header: 'Clicked',
    id: 'isClicked',
    cell: ({ row }) =>
      row.original?.isClicked ? (
        <Badge variant="violet">Yes</Badge>
      ) : (
        <Badge variant="default">No</Badge>
      ),
  },
  {
    header: 'Status',
    id: 'status',
    cell: ({ row }) => {
      const status = row.original?.status;
      if (!status) return <span className="text-gray-300">—</span>;
      const code = Number(status);
      let variant = 'default';
      if (code >= 200 && code < 300) variant = 'success';
      else if (code >= 400) variant = 'danger';
      else if (code >= 300) variant = 'warning';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    header: 'Message',
    id: 'message',
    cell: ({ row }) => {
      const msg = row.original?.message;
      if (!msg) return <span className="text-gray-300">—</span>;
      return (
        <div
          className="truncate max-w-[180px] text-sm text-gray-600"
          title={msg}
        >
          {msg}
        </div>
      );
    },
  },
  {
    header: 'Expiry',
    id: 'expiryDate',
    cell: ({ row }) => {
      const val = row.original?.expiryDate;
      if (!val) return <span className="text-gray-300">—</span>;
      return <span className="text-sm text-gray-600 tabular-nums">{formatDate(val)}</span>;
    },
  },
  {
    header: 'Submitted',
    id: 'createdAt',
    cell: ({ row }) => {
      const val = row.original?.createdAt;
      if (!val) return <span className="text-gray-300">—</span>;
      return <span className="text-sm text-gray-600 tabular-nums">{formatDate(val)}</span>;
    },
  },
  {
    header: 'Action',
    id: 'redirectLink',
    cell: ({ row }) => {
      const link = row.original?.redirectLink;
      if (!link) return <span className="text-gray-300">—</span>;
      return (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Open Link
        </a>
      );
    },
  },
];
