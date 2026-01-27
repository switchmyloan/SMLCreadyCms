import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  ChevronRight,
  Save,
  ArrowLeft,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  getRoleById,
  getAllPermissions,
  assignPermissions,
  updateRole,
  reseedPermissions,
} from '../../../api-services/Modules/AdminRoleApi';
import toast, { Toaster } from 'react-hot-toast';

// Permission modules matching sidebar groups exactly
const PERMISSION_MODULES = [
  { key: 'ACTIVE_USERS', label: 'Active Users', icon: '🟢' },
  { key: 'EXECUTIVE_DASHBOARD', label: 'Executive', icon: '📊' },
  { key: 'LEAD_MANAGEMENT', label: 'Lead Management', icon: '👥' },
  { key: 'APP_STATISTICS', label: 'App Statistics', icon: '📱' },
  { key: 'ANALYTICS', label: 'Analytics', icon: '📈' },
  { key: 'INTERNAL_MUTUAL_FUNDS', label: 'Internal Mutual Funds', icon: '💹' },
  { key: 'MUTUAL_FUNDS', label: 'Mutual Funds', icon: '💰' },
  { key: 'LENDER_MANAGEMENT', label: 'Lender Management', icon: '🏦' },
  { key: 'BLOGS', label: 'Blogs', icon: '📝' },
  { key: 'PUSH_NOTIFICATION', label: 'Push Notification', icon: '🔔' },
  { key: 'UTM', label: 'UTM', icon: '🔗' },
  { key: 'FAQ', label: 'FAQ', icon: '❓' },
  { key: 'MIS_RAW', label: 'MIS Raw', icon: '📑' },
  { key: 'CMS_MANAGEMENT', label: 'CMS Management', icon: '📰' },
  { key: 'ADMIN_MANAGEMENT', label: 'Admin Management', icon: '👨‍💼' },
];

const RoleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reseeding, setReseeding] = useState(false);
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

  // Debug: always log permission details
  useEffect(() => {
    if (allPermissions.length > 0) {
      console.log('=== PERMISSION DEBUG ===');
      console.log('Total permissions from API:', allPermissions.length);
      console.log('Available modules in DB:', [...new Set(allPermissions.map(p => p.module))]);
      console.log('Expected modules:', PERMISSION_MODULES.map(m => m.key));
      console.log('Grouped permissions count:', groupedPermissions.length);
      console.log('Sample permission:', allPermissions[0]);
    }
  }, [allPermissions, groupedPermissions]);

  // Select/Deselect all permissions
  const toggleAllPermissions = () => {
    const allSelected = allPermissions.every(p => selectedPermissions.has(p.id));
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      allPermissions.forEach(p => {
        if (allSelected) {
          newSet.delete(p.id);
        } else {
          newSet.add(p.id);
        }
      });
      return newSet;
    });
  };

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

  // Handle reseed permissions
  const handleReseed = async () => {
    if (!window.confirm('This will reset all permissions to default. Continue?')) {
      return;
    }
    setReseeding(true);
    try {
      const response = await reseedPermissions();
      console.log('Reseed response:', response);
      toast.success('Permissions reseeded successfully! Refreshing...');
      // Reload the page to fetch fresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Failed to reseed permissions:', err);
      toast.error(err?.response?.data?.message || 'Failed to reseed permissions');
    } finally {
      setReseeding(false);
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
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {selectedPermissions.size} of {allPermissions.length} permissions selected
            </div>
            <button
              type="button"
              onClick={handleReseed}
              disabled={reseeding}
              className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800 font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${reseeding ? 'animate-spin' : ''}`} />
              {reseeding ? 'Reseeding...' : 'Reseed Permissions'}
            </button>
            <button
              type="button"
              onClick={toggleAllPermissions}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {allPermissions.every(p => selectedPermissions.has(p.id)) ? 'Deselect All' : 'Select All'}
            </button>
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
                    <span className="font-semibold text-gray-800">{group.label}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      {group.permissions.filter(p => selectedPermissions.has(p.id)).length}/{group.permissions.length}
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

                {/* Permissions Grid */}
                <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {group.permissions.map((perm) => (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedPermissions.has(perm.id)
                          ? 'bg-indigo-50 border border-indigo-200'
                          : 'hover:bg-gray-50 border border-gray-100'
                      }`}
                      title={perm.description || perm.name}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.has(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="w-4 h-4 mt-0.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          perm.action === 'VIEW' ? 'bg-blue-100 text-blue-700' :
                          perm.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                          perm.action === 'EDIT' ? 'bg-yellow-100 text-yellow-700' :
                          perm.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                          perm.action === 'EXPORT' ? 'bg-purple-100 text-purple-700' :
                          perm.action === 'SEND' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {perm.action}
                        </span>
                        <p className="text-xs text-gray-600 mt-1 truncate">{perm.name}</p>
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
