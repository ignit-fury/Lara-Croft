import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';

export default function AdminRoute() {
  const { user } = useUserStore();

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin' && user.role !== 'manager') return <Navigate to="/" replace />;

  return <Outlet />;
}