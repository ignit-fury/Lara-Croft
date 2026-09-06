import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-brand-brown font-bold text-lg mb-2">PRIMA FACIE</h3>
            <p className="text-xs text-brand-brown tracking-widest uppercase mb-4">LARA CROFT</p>
            <p className="text-gray-500 text-sm">Luxury fashion for the modern Indian woman.</p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/category/lehengas" className="text-gray-500 hover:text-brand-brown text-sm">Lehengas</Link></li>
              <li><Link to="/category/sarees" className="text-gray-500 hover:text-brand-brown text-sm">Sarees</Link></li>
              <li><Link to="/category/suits-salwar" className="text-gray-500 hover:text-brand-brown text-sm">Suits & Salwar</Link></li>
              <li><Link to="/category/western-wear" className="text-gray-500 hover:text-brand-brown text-sm">Western Wear</Link></li>
              <li><Link to="/category/jewellery" className="text-gray-500 hover:text-brand-brown text-sm">Jewellery</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Help</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-500 text-sm">Shipping & Returns</span></li>
              <li><span className="text-gray-500 text-sm">Size Guide</span></li>
              <li><span className="text-gray-500 text-sm">Contact Us</span></li>
              <li><span className="text-gray-500 text-sm">FAQ</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Newsletter</h4>
            <p className="text-gray-500 text-sm mb-4">Get updates on new collections and offers.</p>
            <div className="flex">
              <input type="email" placeholder="Your email" className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
              <button className="bg-brand-brown text-brand-cream px-4 py-2 text-sm font-medium hover:bg-brand-brown-dark transition-colors rounded-none">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">&copy; 2026 Prima Facie — LARA CROFT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
