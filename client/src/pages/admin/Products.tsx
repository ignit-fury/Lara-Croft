import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useUserStore } from '../../stores/useUserStore';
import toast from 'react-hot-toast';

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

interface ProductForm {
  name: string;
  slug: string;
  brand: string;
  price: string;
  originalPrice: string;
  description: string;
  category: string;
  sizes: string[];
  stock: string;
  featured: boolean;
  images: string[];
}

const emptyForm: ProductForm = {
  name: '', slug: '', brand: 'LARA CROFT', price: '', originalPrice: '',
  description: '', category: '', sizes: [], stock: '', featured: false, images: [],
};

export default function AdminProducts() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/admin/login');
      return;
    }
    Promise.all([
      api.get('/products?limit=100'),
      api.get('/products/categories'),
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data.data);
      setCategories(cRes.data.data);
      setLoading(false);
    });
  }, [user, navigate]);

  const openModal = (product?: any) => {
    if (product) {
      setEditingId(product.id);
      setForm({
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        price: (product.price / 100).toString(),
        originalPrice: (product.originalPrice / 100).toString(),
        description: product.description,
        category: product.category?.id || '',
        sizes: product.sizes || [],
        stock: product.stock.toString(),
        featured: product.featured,
        images: product.images || [],
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

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
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        brand: form.brand,
        price: Math.round(parseFloat(form.price) * 100),
        original_price: Math.round(parseFloat(form.originalPrice || form.price) * 100),
        description: form.description,
        category_id: form.category || null,
        sizes: form.sizes,
        stock: parseInt(form.stock) || 0,
        featured: form.featured,
        images: form.images,
      };

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created');
      }
      const res = await api.get('/products?limit=100');
      setProducts(res.data.data);
      closeModal();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleSize = (size: string) => {
    setForm({
      ...form,
      sizes: form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size],
    });
  };

  if (loading) return <div className="text-brand-muted">Loading...</div>;

  return (
    <div>
      <div className="bg-brand-card border border-brand-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
          <div className="text-[15px] font-[700]">All products</div>
          <button onClick={() => openModal()} className="bg-brand-accent text-brand-cream border-none px-5 py-2.5 text-[12.5px] font-[700] uppercase tracking-[1px] hover:bg-brand-accent2 transition-colors cursor-pointer">
            + New product
          </button>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="w-12"></th>
              <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Name</th>
              <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Brand</th>
              <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Category</th>
              <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Price</th>
              <th className="text-left py-2.5 px-5 text-[11px] uppercase tracking-[1px] text-brand-muted font-[700]">Stock</th>
              <th className="w-32"></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-brand-muted text-[13px]">No products yet — add your first one.</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className="border-b border-black/8 hover:bg-black/5">
                <td className="py-3 px-5">
                  <div className="w-[42px] h-[42px] bg-brand-card2 border border-brand-border flex-shrink-0 overflow-hidden">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="py-3 px-5 font-[700]">
                  {p.name}{p.featured && <span className="text-brand-muted text-[12px] ml-1">★</span>}
                </td>
                <td className="py-3 px-5">{p.brand}</td>
                <td className="py-3 px-5">{p.category?.name || '—'}</td>
                <td className="py-3 px-5">
                  {formatPrice(p.price)}{p.originalPrice > p.price ? <span className="text-brand-muted text-[12px] line-through ml-1">{formatPrice(p.originalPrice)}</span> : ''}
                </td>
                <td className="py-3 px-5">{p.stock}</td>
                <td className="py-3 px-5">
                  <div className="flex gap-2">
                    <button onClick={() => openModal(p)} className="bg-transparent border border-brand-border text-brand-text px-3 py-1.5 text-[11px] font-[700] hover:bg-black/8 transition-colors cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="bg-[#8a3f3f] text-brand-cream border-none px-3 py-1.5 text-[11px] font-[700] hover:bg-[#a34d4d] transition-colors cursor-pointer">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-6" onClick={closeModal}>
          <div className="bg-brand-card border border-brand-border w-full max-w-[640px] max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-[18px] border-b border-brand-border sticky top-0 bg-brand-card">
              <div className="text-[16px] font-[800]">{editingId ? 'Edit product' : 'New product'}</div>
              <button onClick={closeModal} className="bg-black/10 border-none text-brand-text w-[30px] h-[30px] text-[16px] cursor-pointer">×</button>
            </div>
            <div className="px-6 py-[22px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-[700] uppercase tracking-[.8px] text-brand-muted">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Heritage Field Jacket" className="bg-white border border-brand-border text-brand-text px-3 py-2.5 text-[13px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-[700] uppercase tracking-[.8px] text-brand-muted">Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="heritage-field-jacket" className="bg-white border border-brand-border text-brand-text px-3 py-2.5 text-[13px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-[700] uppercase tracking-[.8px] text-brand-muted">Brand</label>
                  <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="bg-white border border-brand-border text-brand-text px-3 py-2.5 text-[13px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-[700] uppercase tracking-[.8px] text-brand-muted">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-white border border-brand-border text-brand-text px-3 py-2.5 text-[13px] cursor-pointer">
                    <option value="">Select category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-[700] uppercase tracking-[.8px] text-brand-muted">Price (₹)</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-white border border-brand-border text-brand-text px-3 py-2.5 text-[13px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-[700] uppercase tracking-[.8px] text-brand-muted">Original price (₹)</label>
                  <input type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="bg-white border border-brand-border text-brand-text px-3 py-2.5 text-[13px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-[700] uppercase tracking-[.8px] text-brand-muted">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="bg-white border border-brand-border text-brand-text px-3 py-2.5 text-[13px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-[700] uppercase tracking-[.8px] text-brand-muted">Image upload</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-[13px] text-brand-muted" />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[11px] font-[700] uppercase tracking-[.8px] text-brand-muted">Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((size) => (
                      <label key={size} className="flex items-center gap-1.5 bg-white border border-brand-border px-3 py-1.5 text-[12px] font-[600] cursor-pointer">
                        <input type="checkbox" checked={form.sizes.includes(size)} onChange={() => toggleSize(size)} className="accent-brand-accent" />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[11px] font-[700] uppercase tracking-[.8px] text-brand-muted">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="bg-white border border-brand-border text-brand-text px-3 py-2.5 text-[13px] resize-y min-h-[80px]" />
                </div>
                <div className="col-span-2 flex items-center gap-2.5">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-[18px] h-[18px] accent-brand-accent" />
                  <span className="text-[13px]" style={{ textTransform: 'none', letterSpacing: 0 }}>Feature on homepage</span>
                </div>
              </div>
              {form.images.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 bg-brand-card2 border border-brand-border overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="absolute -top-1 -right-1 bg-[#8a3f3f] text-white rounded-full w-4 h-4 text-xs flex items-center justify-center cursor-pointer">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-brand-border sticky bottom-0 bg-brand-card">
              <button onClick={closeModal} className="bg-transparent border border-brand-border text-brand-text px-5 py-2.5 text-[12.5px] font-[700] uppercase tracking-[1px] hover:bg-black/8 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="bg-brand-accent text-brand-cream border-none px-5 py-2.5 text-[12.5px] font-[700] uppercase tracking-[1px] hover:bg-brand-accent2 transition-colors cursor-pointer disabled:opacity-50">
                {saving ? 'Saving...' : 'Save product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
