import { useState, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Shield,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Users,
  ChevronRight,
  Settings,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllRoles, deleteRole, seedRoles } from '../../../api-services/Modules/AdminRoleApi';
import toast, { Toaster } from 'react-hot-toast';

const RoleList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch roles
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllRoles();
      const rolesData = res?.data?.data || [];
      setData(Array.isArray(rolesData) ? rolesData : []);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      toast.error('Failed to fetch roles');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle seed roles
  const handleSeedRoles = async () => {
    try {
      await seedRoles();
      toast.success('Default roles and permissions seeded successfully');
      fetchData();
    } catch (err) {
      console.error('Failed to seed roles:', err);
      toast.error('Failed to seed roles');
    }
  };

  // Handle delete role
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the role "${name}"?`)) {
      return;
    }
    try {
      await deleteRole(id);
      toast.success('Role deleted successfully');
      fetchData();
    } catch (err) {
      console.error('Failed to delete role:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete role');
    }
  };

  // Table columns
  const columns = [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          <span className="font-medium">{row.original.name}</span>
          {row.original.isSystemRole && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              System
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ getValue }) => (
        <code className="px-2 py-1 bg-gray-100 rounded text-sm">
          {getValue()}
        </code>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => (
        <span className="text-gray-600 text-sm">{getValue() || '-'}</span>
      ),
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
            onClick={() => navigate(`/admin/roles/${row.original.id}`)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Permissions"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/admin/roles/${row.original.id}/edit`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Role"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {!row.original.isSystemRole && (
            <button
              onClick={() => handleDelete(row.original.id, row.original.name)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Role"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
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
          <span className="text-gray-900">Role Management</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
            <p className="text-gray-500 mt-1">Manage user roles and permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedRoles}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Seed Defaults
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/admin/roles/create')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Roles</p>
              <p className="text-xl font-bold">{data.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">System Roles</p>
              <p className="text-xl font-bold">
                {data.filter(r => r.isSystemRole).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Custom Roles</p>
              <p className="text-xl font-bold">
                {data.filter(r => !r.isSystemRole).length}
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
            <Shield className="w-12 h-12 mb-3 text-gray-300" />
            <p>No roles found</p>
            <button
              onClick={handleSeedRoles}
              className="mt-4 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Seed default roles
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
    </div>
  );
};

export default RoleList;
