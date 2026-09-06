import { Link } from 'react-router-dom';
import { useUserStore } from '../../stores/useUserStore';
import { useCartStore } from '../../stores/useCartStore';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user } = useUserStore();
  const { items } = useCartStore();
  const { signInWithGoogle, signOut } = useAuth();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-brand-brown font-bold text-xl tracking-tight">PRIMA FACIE</span>
            <span className="text-brand-brown text-xs font-medium tracking-widest uppercase">LARA CROFT</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/category/lehengas" className="text-gray-600 hover:text-brand-brown text-sm font-medium transition-colors">
              Lehengas
            </Link>
            <Link to="/category/sarees" className="text-gray-600 hover:text-brand-brown text-sm font-medium transition-colors">
              Sarees
            </Link>
            <Link to="/category/suits-salwar" className="text-gray-600 hover:text-brand-brown text-sm font-medium transition-colors">
              Suits
            </Link>
            <Link to="/category/western-wear" className="text-gray-600 hover:text-brand-brown text-sm font-medium transition-colors">
              Western
            </Link>
            <Link to="/category/jewellery" className="text-gray-600 hover:text-brand-brown text-sm font-medium transition-colors">
              Jewellery
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative text-gray-600 hover:text-brand-brown">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-brown text-brand-cream text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/account" className="text-sm text-gray-600 hover:text-brand-brown">
                  {user.name}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm text-brand-brown hover:text-brand-brown-dark font-medium">
                    Admin
                  </Link>
                )}
                <button onClick={signOut} className="text-sm text-gray-500 hover:text-gray-700">
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={signInWithGoogle} className="bg-brand-brown text-brand-cream px-4 py-2 text-sm font-medium hover:bg-brand-brown-dark transition-colors">
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
