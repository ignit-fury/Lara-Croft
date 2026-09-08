import { Outlet, Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/admin/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { path: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { path: '/admin/users', label: 'Users', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-5.13a4 4 0 100-8 4 4 0 000 8zm6 1a4 4 0 10-3-6.65' },
];

const PAGE_LABELS: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/products': 'Products',
  '/admin/users': 'Users',
};

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useUserStore();

  const activePath = NAV_ITEMS.find((n) => location.pathname === n.path || (n.path !== '/admin' && location.pathname.startsWith(n.path)))?.path || '/admin';

  return (
    <div className="flex min-h-screen" style={{ background: '#ffffff' }}>
      <aside className="w-[236px] flex-shrink-0 border-r border-brand-border flex flex-col sticky top-0 h-screen" style={{ background: '#efefef' }}>
        <div className="px-[22px] py-[26px] border-b border-brand-border">
          <div className="text-[18px] font-[800] tracking-[.5px]">Lara Croft</div>
          <div className="text-[11px] text-brand-muted uppercase tracking-[1.5px] mt-1 opacity-85">Admin</div>
        </div>
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-[11px] text-[13.5px] font-[600] border-l-[3px] transition-all ${
                  isActive
                    ? 'bg-brand-accent text-brand-cream border-l-brand-cream'
                    : 'text-brand-muted border-l-transparent hover:bg-black/8 hover:text-brand-text'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-[22px] py-4 border-t border-brand-border">
          <Link to="/" className="inline-flex items-center gap-1.5 text-brand-muted text-[12px] font-[600] hover:text-brand-text transition-colors">
            ← View storefront
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between px-8 py-5 border-b border-brand-border" style={{ background: '#f5f5f5' }}>
          <div>
            <div className="text-[12px] text-brand-muted uppercase tracking-[1.5px] font-[700]">/admin</div>
            <div className="text-[22px] font-[800] mt-0.5">{PAGE_LABELS[activePath] || 'Dashboard'}</div>
          </div>
          <div className="flex items-center gap-2.5 bg-brand-card border border-brand-border px-3.5 py-2 text-[13px] font-[600]">
            <span className="w-2 h-2 rounded-full" style={{ background: '#4c5a2e' }} />
            {user?.name || 'Admin'} · Admin
          </div>
        </div>
        <div className="px-8 py-7 pb-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
