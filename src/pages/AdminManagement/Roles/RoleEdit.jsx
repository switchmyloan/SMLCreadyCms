import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  ChevronRight,
  Save,
  ArrowLeft,
  Check,
  Loader2,
} from 'lucide-react';
import {
  getRoleById,
  getAllPermissions,
  assignPermissions,
  updateRole,
} from '../../../api-services/Modules/AdminRoleApi';
import toast, { Toaster } from 'react-hot-toast';

// Permission modules for grouping
const PERMISSION_MODULES = [
  { key: 'CAMPAIGNS', label: 'Campaigns', icon: '📢' },
  { key: 'SEGMENTS', label: 'Segments', icon: '👥' },
  { key: 'ANALYTICS', label: 'Analytics', icon: '📊' },
  { key: 'USERS', label: 'Users', icon: '👤' },
  { key: 'LEADS', label: 'Leads', icon: '📋' },
  { key: 'LENDERS', label: 'Lenders', icon: '🏦' },
  { key: 'PUSH_NOTIFICATIONS', label: 'Push Notifications', icon: '🔔' },
  { key: 'CMS', label: 'CMS Content', icon: '📝' },
  { key: 'SETTINGS', label: 'Settings', icon: '⚙️' },
  { key: 'ROLES', label: 'Roles', icon: '🛡️' },
  { key: 'ACTIVE_USERS', label: 'Active Users', icon: '🟢' },
];

const RoleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  // Fetch role and permissions
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [roleRes, permsRes] = await Promise.all([
        getRoleById(id),
        getAllPermissions(),
      ]);

      const roleData = roleRes?.data?.data;
      const permsData = permsRes?.data?.data || [];

      setRole(roleData);
      setAllPermissions(permsData);
      setFormData({
        name: roleData?.name || '',
        description: roleData?.description || '',
        isActive: roleData?.isActive ?? true,
      });

      // Set selected permissions from role
      if (roleData?.permissions) {
        const permIds = new Set(
          roleData.permissions.map(rp => rp.permission?.id || rp.permission_xid)
        );
        setSelectedPermissions(permIds);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load role data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group permissions by module
  const groupedPermissions = PERMISSION_MODULES.map(module => ({
    ...module,
    permissions: allPermissions.filter(p => p.module === module.key),
  })).filter(g => g.permissions.length > 0);

  // Handle permission toggle
  const togglePermission = (permId) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permId)) {
        newSet.delete(permId);
      } else {
        newSet.add(permId);
      }
      return newSet;
    });
  };

  // Toggle all permissions in a module
  const toggleModule = (moduleKey) => {
    const modulePerms = allPermissions.filter(p => p.module === moduleKey);
    const allSelected = modulePerms.every(p => selectedPermissions.has(p.id));

    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      modulePerms.forEach(p => {
        if (allSelected) {
          newSet.delete(p.id);
        } else {
          newSet.add(p.id);
        }
      });
      return newSet;
    });
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      // Update role details
      await updateRole(id, formData);

      // Update permissions
      await assignPermissions(id, Array.from(selectedPermissions));

      toast.success('Role updated successfully');
      navigate('/admin/roles');
    } catch (err) {
      console.error('Failed to save role:', err);
      toast.error(err?.response?.data?.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>Admin</span>
          <ChevronRight className="w-4 h-4" />
          <span>Roles</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Edit Role</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/roles')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Role: {role?.name}
              </h1>
              <p className="text-gray-500 mt-1">
                Manage permissions for this role
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Role Details Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Role Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={role?.isSystemRole}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
              placeholder="Enter role name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter description"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Permissions</h2>
          <div className="text-sm text-gray-500">
            {selectedPermissions.size} of {allPermissions.length} permissions selected
          </div>
        </div>

        <div className="space-y-4">
          {groupedPermissions.map((group) => {
            const allSelected = group.permissions.every(p => selectedPermissions.has(p.id));
            const someSelected = group.permissions.some(p => selectedPermissions.has(p.id));

            return (
              <div
                key={group.key}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Module Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleModule(group.key)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{group.icon}</span>
                    <span className="font-medium">{group.label}</span>
                    <span className="text-xs text-gray-500">
                      ({group.permissions.filter(p => selectedPermissions.has(p.id)).length}/{group.permissions.length})
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    allSelected
                      ? 'bg-indigo-600 border-indigo-600'
                      : someSelected
                        ? 'bg-indigo-200 border-indigo-400'
                        : 'border-gray-300'
                  }`}>
                    {allSelected && <Check className="w-3 h-3 text-white" />}
                    {someSelected && !allSelected && <div className="w-2 h-0.5 bg-indigo-600" />}
                  </div>
                </div>

                {/* Permissions List */}
                <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {group.permissions.map((perm) => (
                    <label
                      key={perm.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedPermissions.has(perm.id)
                          ? 'bg-indigo-50 border border-indigo-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.has(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {perm.action}
                        </span>
                        <p className="text-xs text-gray-500">{perm.name}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleEdit;
