import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useUserStore } from '../../stores/useUserStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Product } from '../../types';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function AdminProducts() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/');
      return;
    }
    api.get('/products?limit=100').then((res) => {
      setProducts(res.data.data);
      setLoading(false);
    });
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Stock</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-gray-100 flex-shrink-0">
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-800">{formatPrice(product.price)}</td>
                <td className="py-3 px-4 text-gray-800">{product.stock}</td>
                <td className="py-3 px-4">
                  <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:underline text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
