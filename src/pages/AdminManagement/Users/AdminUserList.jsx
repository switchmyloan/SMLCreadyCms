import { useState, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Users,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Key,
  ChevronRight,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getAllAdminUsers,
  deleteAdminUser,
  changeAdminPassword,
} from '../../../api-services/Modules/AdminRoleApi';
import toast, { Toaster } from 'react-hot-toast';

const AdminUserList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Fetch admin users
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAdminUsers();
      const usersData = res?.data?.data || [];
      setData(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
      toast.error('Failed to fetch admin users');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle delete user
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the user "${name}"?`)) {
      return;
    }
    try {
      await deleteAdminUser(id);
      toast.success('User deleted successfully');
      fetchData();
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await changeAdminPassword(selectedUser.id, newPassword);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to change password:', err);
      toast.error(err?.response?.data?.message || 'Failed to change password');
    }
  };

  // Table columns
  const columns = [
    {
      accessorKey: 'email',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {row.original.firstName?.[0]?.toUpperCase() || row.original.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium">
              {row.original.firstName} {row.original.lastName}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1 text-gray-600">
          <Phone className="w-4 h-4" />
          {getValue() || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
            {row.original.role?.name || 'No Role'}
          </span>
        </span>
      ),
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ getValue }) => {
        const date = getValue();
        return date ? (
          <span className="text-sm text-gray-600">
            {new Date(date).toLocaleString()}
          </span>
        ) : (
          <span className="text-sm text-gray-400">Never</span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => (
        getValue() ? (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-4 h-4" /> Active
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-600">
            <XCircle className="w-4 h-4" /> Inactive
          </span>
        )
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/users/${row.original.id}/edit`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit User"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedUser(row.original);
              setShowPasswordModal(true);
            }}
            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Change Password"
          >
            <Key className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id, row.original.email)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete User"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>Admin</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">User Management</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
            <p className="text-gray-500 mt-1">Manage CMS admin users and their access</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/admin/users/create')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xl font-bold">{data.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-xl font-bold">
                {data.filter(u => u.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inactive Users</p>
              <p className="text-xl font-bold">
                {data.filter(u => !u.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Users className="w-12 h-12 mb-3 text-gray-300" />
            <p>No admin users found</p>
            <button
              onClick={() => navigate('/admin/users/create')}
              className="mt-4 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Add first user
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Change Password for {selectedUser?.email}
            </h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;
