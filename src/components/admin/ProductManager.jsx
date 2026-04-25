import React, { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/productService';
import { Package, Plus, Pencil, Trash2, Save, X, Search, Eye, EyeOff, IndianRupee } from 'lucide-react';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const emptyProduct = { name: '', tamil: '', pricePerKg: '', pricePerThar: '', desc: '', available: true };
  const [formData, setFormData] = useState(emptyProduct);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'pricePerKg' || name === 'pricePerThar' ? Number(value) || '' : value)
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const result = await addProduct(formData);
    if (result.success) {
      setShowAddForm(false);
      setFormData(emptyProduct);
      await loadProducts();
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      tamil: product.tamil || '',
      pricePerKg: product.pricePerKg || '',
      pricePerThar: product.pricePerThar || '',
      desc: product.desc || '',
      available: product.available !== false,
    });
  };

  const handleSaveEdit = async () => {
    const success = await updateProduct(editingId, formData);
    if (success) {
      setEditingId(null);
      setFormData(emptyProduct);
      await loadProducts();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const success = await deleteProduct(id);
    if (success) await loadProducts();
  };

  const handleToggleAvailability = async (product) => {
    const success = await updateProduct(product.id, { available: !product.available });
    if (success) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, available: !p.available } : p));
    }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tamil?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ProductForm = ({ onSubmit, submitLabel, onCancel }) => (
    <form onSubmit={onSubmit} className="bg-green-950/30 border border-green-800/30 rounded-2xl p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-green-400/70 uppercase mb-1.5">Product Name</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input-field w-full" placeholder="e.g. Nendran" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-green-400/70 uppercase mb-1.5">Tamil Name</label>
          <input type="text" name="tamil" value={formData.tamil} onChange={handleChange} className="input-field w-full" placeholder="e.g. நேந்திரன்" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-green-400/70 uppercase mb-1.5">Price per Kg (₹)</label>
          <input required type="number" name="pricePerKg" value={formData.pricePerKg} onChange={handleChange} className="input-field w-full" placeholder="65" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-green-400/70 uppercase mb-1.5">Price per Thar (₹)</label>
          <input required type="number" name="pricePerThar" value={formData.pricePerThar} onChange={handleChange} className="input-field w-full" placeholder="450" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-green-400/70 uppercase mb-1.5">Description</label>
          <textarea name="desc" value={formData.desc} onChange={handleChange} className="input-field w-full min-h-[80px] py-3" placeholder="Short description of the product..." />
        </div>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-green-900/50 peer-focus:ring-2 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 peer-checked:after:bg-white"></div>
          </label>
          <span className="text-sm text-gray-300">Available in Shop</span>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 transition-colors flex items-center gap-2">
            <X size={16} /> Cancel
          </button>
        )}
        <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-green-500 hover:bg-green-400 text-[#020a04] transition-colors flex items-center gap-2">
          <Save size={16} /> {submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 slide-up pb-4 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-200 flex items-center gap-2">
            <Package className="text-green-400" /> Product Management
          </h2>
          <p className="text-xs text-green-500/50">Add, edit, or remove products from the store</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData(emptyProduct); }}
          className="px-5 py-2.5 rounded-xl font-bold bg-green-500 hover:bg-green-400 text-[#020a04] transition-colors flex items-center gap-2 text-sm"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {showAddForm && (
        <div className="slide-up">
          <h3 className="text-lg font-bold text-white mb-3">New Product</h3>
          <ProductForm onSubmit={handleAdd} submitLabel="Add Product" onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600/50" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="input-field pl-11 !py-3 !text-base shadow-lg"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center glass-card">
          <Package size={48} className="mx-auto mb-3 text-green-800/40" />
          <p className="text-green-500/40 text-lg">No products found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <div key={product.id} className={`glass-card p-5 border ${product.available !== false ? 'border-green-800/30' : 'border-red-900/30 opacity-60'}`}>
              {editingId === product.id ? (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Editing: {product.name}</h3>
                  <ProductForm
                    onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}
                    submitLabel="Save Changes"
                    onCancel={() => { setEditingId(null); setFormData(emptyProduct); }}
                  />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-green-100 text-lg">{product.name}</h3>
                      {product.tamil && <span className="text-sm text-green-500/50">({product.tamil})</span>}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.available !== false ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {product.available !== false ? 'Available' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{product.desc}</p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1 text-sm">
                        <IndianRupee size={14} className="text-green-500/50" />
                        <span className="text-green-300 font-bold">{product.pricePerKg}</span>
                        <span className="text-green-500/40">/kg</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <IndianRupee size={14} className="text-green-500/50" />
                        <span className="text-green-300 font-bold">{product.pricePerThar}</span>
                        <span className="text-green-500/40">/thar</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleAvailability(product)}
                      title={product.available !== false ? 'Hide from shop' : 'Show in shop'}
                      className={`p-2.5 rounded-xl transition-colors ${product.available !== false ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'}`}
                    >
                      {product.available !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2.5 rounded-xl text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
