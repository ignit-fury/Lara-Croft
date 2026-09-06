import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    brand: 'LARA CROFT',
    price: '',
    originalPrice: '',
    description: '',
    category: '',
    sizes: 'XS,S,M,L,XL',
    stock: '',
    featured: false,
    images: [] as string[],
  });

  useEffect(() => {
    api.get('/products/categories').then((res) => setCategories(res.data.data));
    if (id) {
      api.get(`/products/${id}`).then((res) => {
        const p = res.data.data;
        setForm({
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          price: (p.price / 100).toString(),
          originalPrice: (p.originalPrice / 100).toString(),
          description: p.description,
          category: p.category?._id || '',
          sizes: p.sizes?.join(',') || '',
          stock: p.stock.toString(),
          featured: p.featured,
          images: p.images || [],
        });
      });
    }
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ ...form, images: [...form.images, res.data.data.url] });
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Math.round(parseFloat(form.price) * 100),
        originalPrice: Math.round(parseFloat(form.originalPrice) * 100),
        stock: parseInt(form.stock),
        sizes: form.sizes.split(',').map((s) => s.trim()),
      };

      if (id) {
        await api.put(`/admin/products/${id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">{id ? 'Edit Product' : 'New Product'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm text-gray-500 block mb-1">Name *</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Slug *</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Brand</label>
            <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Price (₹) *</label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Original Price (₹) *</label>
            <input type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} required className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Category *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none">
              <option value="">Select category</option>
              {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Stock *</label>
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">Sizes (comma separated)</label>
          <input type="text" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-brown rounded-none" />
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <span className="text-sm text-gray-700">Featured product</span>
          </label>
        </div>
        <div>
          <label className="text-sm text-gray-500 block mb-1">Images</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="block text-sm text-gray-500" />
          <div className="flex gap-2 mt-2">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 bg-gray-100">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="bg-brand-brown text-brand-cream px-6 py-3 text-sm font-semibold hover:bg-brand-brown-dark transition-colors disabled:opacity-50">
            {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="border border-gray-300 text-gray-700 px-6 py-3 text-sm font-semibold hover:border-brand-brown transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
