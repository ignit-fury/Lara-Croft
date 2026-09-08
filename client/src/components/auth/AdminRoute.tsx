import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';

export default function AdminRoute() {
  const { user } = useUserStore();

  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'super_admin') return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
