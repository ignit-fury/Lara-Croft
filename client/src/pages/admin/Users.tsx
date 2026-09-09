import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useUserStore } from '../../stores/useUserStore';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { user } = useUserStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    api.get('/admin/users').then((res) => {
      setUsers(res.data.data);
      setLoading(false);
    });
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (!window.confirm(`Change ${target.name}'s role to ${role}?`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(users.map((u) => u.id === userId ? { ...u, role } : u));
      toast.success(`${target.name} is now ${role}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  };

  if (loading) return <div className="text-brand-muted">Loading...</div>;

  return (
    <div className="bg-brand-card border border-brand-border">
      <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
        <div className="text-[15px] font-[700]">All users</div>
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-brand-border">
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Name</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Email</th>
            <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-black/8 hover:bg-black/5">
              <td className="py-3 px-5 font-[700]">{u.name}</td>
              <td className="py-3 px-5 text-brand-muted text-[12px]">{u.email}</td>
              <td className="py-3 px-5">
                {u.role === 'super_admin' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-[5px] text-[11px] font-[700] uppercase tracking-wide" style={{ backgroundColor: '#e63946', color: '#fdf0d5' }}>
                    ★ Super Admin
                  </span>
                ) : isSuperAdmin ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-white border border-brand-border text-brand-text px-2 py-[7px] text-[12.5px] font-[600] cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span
                    className="inline-flex items-center px-2.5 py-[5px] text-[11px] font-[700] uppercase tracking-wide"
                    style={{
                      backgroundColor:
                        u.role === 'super_admin' ? '#e63946' :
                        u.role === 'admin' ? '#8a6d3f' :
                        u.role === 'manager' ? '#4c5a2e' :
                        '#666',
                      color: '#fdf0d5',
                    }}
                  >
                    {u.role}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
