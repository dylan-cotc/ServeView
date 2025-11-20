import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, AlertCircle, CheckCircle, Shield, User, X, Key } from 'lucide-react';
import { adminAPI } from '../../services/api';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'editor';
  first_login: boolean;
  created_at: string;
  updated_at: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'editor' as 'admin' | 'editor',
    requirePasswordReset: true
  });
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    requirePasswordReset: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminAPI.getUsers();
      setUsers(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', role: 'editor', requirePasswordReset: true });
    setResetPasswordData({ newPassword: '', confirmPassword: '', requirePasswordReset: true });
    setEditingUser(null);
    setShowCreateForm(false);
  };

  const openResetPasswordModal = (user: User) => {
    setResetPasswordUser(user);
    setResetPasswordData({ newPassword: '', confirmPassword: '', requirePasswordReset: true });
    setShowResetPasswordModal(true);
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setResetPasswordUser(null);
    setResetPasswordData({ newPassword: '', confirmPassword: '', requirePasswordReset: true });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      await adminAPI.createUser(formData);
      setMessage({ type: 'success', text: 'User created successfully!' });
      resetForm();
      fetchUsers();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create user' });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setMessage(null);

    try {
      await adminAPI.updateUser(editingUser.id, {
        username: formData.username,
        role: formData.role
      });
      setMessage({ type: 'success', text: 'User updated successfully!' });
      resetForm();
      fetchUsers();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update user' });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) return;

    try {
      await adminAPI.deleteUser(user.id);
      setMessage({ type: 'success', text: 'User deleted successfully!' });
      fetchUsers();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to delete user' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser) return;

    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (resetPasswordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setMessage(null);

    try {
      await adminAPI.resetUserPassword(
        resetPasswordUser.id,
        resetPasswordData.newPassword,
        resetPasswordData.requirePasswordReset
      );
      setMessage({ type: 'success', text: 'Password reset successfully!' });
      closeResetPasswordModal();
      fetchUsers(); // Refresh to update first_login status
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to reset password' });
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      requirePasswordReset: true
    });
    setShowCreateForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h2>

          <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="max-w-md">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter password"
                    required={!editingUser}
                  />
                </div>
              )}

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'editor' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {!editingUser && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requirePasswordReset"
                    checked={formData.requirePasswordReset}
                    onChange={(e) => setFormData({ ...formData, requirePasswordReset: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="requirePasswordReset" className="ml-2 text-sm text-gray-700">
                    Require password reset on first login
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetPasswordModal && resetPasswordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Reset Password for {resetPasswordUser.username}
                </h2>
              </div>
              <button
                onClick={closeResetPasswordModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label htmlFor="modalNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="modalNewPassword"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter new password"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="modalConfirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="modalConfirmPassword"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="modalRequirePasswordReset"
                  checked={resetPasswordData.requirePasswordReset}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, requirePasswordReset: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="modalRequirePasswordReset" className="ml-2 text-sm text-gray-700">
                  Require password reset on next login
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={closeResetPasswordModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-gray-400 mr-2" />
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.first_login
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.first_login ? 'Password Reset Required' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openResetPasswordModal(user)}
                      className="text-orange-600 hover:text-orange-900 p-1"
                      title="Reset password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      title="Edit user"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found. Create your first user above.</p>
          </div>
        )}
      </div>
    </div>
  );
}