import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useUserStore } from '../../stores/useUserStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { User } from '../../types';

export default function AdminUsers() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/');
      return;
    }
    api.get('/admin/users').then((res) => {
      setUsers(res.data.data);
      setLoading(false);
    });
  }, [user, navigate]);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(users.map((u) => u._id === userId ? { ...u, role: role as any } : u));
      toast.success('Role updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">Users</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">User</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-800">{u.name}</td>
                <td className="py-3 px-4 text-gray-600">{u.email}</td>
                <td className="py-3 px-4">
                  <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="border border-gray-300 px-2 py-1 text-sm rounded-none">
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm">ID: {u._id.slice(-8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
