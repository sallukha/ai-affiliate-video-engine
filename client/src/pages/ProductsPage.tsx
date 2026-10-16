import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Upload,
  Search,
  Trash2,
  ExternalLink,
  Video,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  DollarSign
} from 'lucide-react';
import { productService } from '../services/productService';
import { ProductItem } from '../types';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useApp } from '../context/AppContext';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { dataMode, setSelectedProductForVideo, addToast } = useApp();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Add Product Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 1999,
    currency: 'INR',
    features: 'High quality, Long battery, Fast delivery',
    affiliateUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
  });
  const [isAdding, setIsAdding] = useState(false);

  // CSV Import Modal State
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Delete Confirm Modal State
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const { data } = await productService.getProducts();
        if (mounted) setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, [dataMode]);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleCreateVideo = (product: ProductItem) => {
    setSelectedProductForVideo(product);
    addToast({
      type: 'info',
      title: 'Product Loaded',
      message: `Configuring video reel for "${product.name}"`
    });
    navigate('/create');
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.affiliateUrl) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Name and Affiliate URL are required.' });
      return;
    }

    setIsAdding(true);
    try {
      const { data } = await productService.createProduct({
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        currency: newProduct.currency,
        features: newProduct.features.split(',').map((f) => f.trim()),
        affiliateUrl: newProduct.affiliateUrl,
        imageUrl: newProduct.imageUrl
      });

      setProducts([data, ...products]);
      setIsAddOpen(false);
      addToast({ type: 'success', title: 'Product Added', message: `Added "${data.name}" to catalogue.` });
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: 1999,
        currency: 'INR',
        features: '',
        affiliateUrl: '',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add product';
      addToast({ type: 'error', title: 'Creation Failed', message: msg });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await productService.deleteProduct(productToDelete.id);
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      addToast({
        type: 'success',
        title: 'Product Removed',
        message: `Deleted "${productToDelete.name}" from catalogue.`
      });
      setProductToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      addToast({ type: 'error', title: 'Delete Failed', message: msg });
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;
    setIsImporting(true);
    try {
      const res = await productService.importProductsCsv(csvFile);
      if (res.importedCount > 0) {
        // Refresh products list
        const { data } = await productService.getProducts();
        setProducts(data);
        addToast({
          type: 'success',
          title: 'CSV Import Completed',
          message: `Successfully imported ${res.importedCount} products into your catalogue.`
        });
        setIsCsvOpen(false);
        setCsvFile(null);
      } else {
        addToast({
          type: 'warning',
          title: 'Import Notice',
          message: res.errors?.[0] || 'No new products detected in the CSV file.'
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CSV import failed';
      addToast({ type: 'error', title: 'Import Failed', message: msg });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Affiliate Products Catalogue</h2>
          <p className="mt-1 text-xs text-slate-500">
            Save products, affiliate links, and imagery for instant automated video generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCsvOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-slate-500" />
            Import CSV
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Search & View Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title or description..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Grid View
          </button>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {isLoading ? (
        <div className="space-y-3 py-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No products found"
          description="Add your first affiliate product or import a CSV catalogue to start generating reels."
          actionText="Add Product"
          onAction={() => setIsAddOpen(true)}
        />
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Affiliate Link</th>
                  <th className="px-4 py-3.5">Videos Made</th>
                  <th className="px-4 py-3.5">Added Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover border border-slate-200"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="truncate font-bold text-slate-900 text-xs sm:text-sm">{p.name}</p>
                          <p className="truncate text-xs text-slate-500 mt-0.5">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-900 whitespace-nowrap text-xs sm:text-sm">
                      {p.currency === 'INR' ? '₹' : '$'}
                      {p.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 max-w-xs truncate text-[11px] font-mono text-slate-500">
                      <a
                        href={p.affiliateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-teal-600 hover:underline"
                      >
                        <span className="truncate max-w-[160px]">{p.affiliateUrl}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                      {p.videoCount} videos
                    </td>
                    <td className="px-4 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCreateVideo(p)}
                          className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 font-semibold text-teal-700 hover:bg-teal-100"
                        >
                          <Video className="h-3.5 w-3.5" /> Generate Video
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-md"
            >
              <div>
                <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-slate-100 mb-3">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 rounded-lg bg-black/75 px-2 py-0.5 text-xs font-semibold text-white">
                    {p.currency === 'INR' ? '₹' : '$'}
                    {p.price.toLocaleString()}
                  </div>
                </div>

                <h3 className="line-clamp-1 font-semibold text-slate-900 text-xs">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{p.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                  onClick={() => setProductToDelete(p)}
                  className="rounded-md p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleCreateVideo(p)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-teal-700"
                >
                  <Video className="h-3.5 w-3.5" /> Generate Video
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Add Product to Catalogue</h3>
              <button onClick={() => setIsAddOpen(false)} className="rounded p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Keyboard Wrist Rest"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1299"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Currency</label>
                  <select
                    value={newProduct.currency}
                    onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Affiliate Destination URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://affiliate.example.com/product/123"
                  value={newProduct.affiliateUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, affiliateUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Memory foam wrist rest with anti-slip base..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-slate-900 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50"
                >
                  {isAdding && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isCsvOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          onClick={() => setIsCsvOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-teal-600" />
                <h3 className="text-base font-semibold text-slate-900">Import Products from CSV</h3>
              </div>
              <button onClick={() => setIsCsvOpen(false)} className="rounded p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-slate-600">
                <span className="font-semibold text-slate-900">Required CSV Columns:</span>
                <p className="mt-1 font-mono text-[11px] text-teal-800">
                  name, price, affiliateUrl, description
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Example: "Smart Watch", 3999, "https://affiliate.example.com/watch", "AMOLED display"
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-slate-400">
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <label className="cursor-pointer font-semibold text-teal-600 hover:text-teal-700">
                  <span>{csvFile ? csvFile.name : 'Choose CSV file to upload'}</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">UTF-8 formatted CSV files only</p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    const sampleCsv = 'name,price,affiliateUrl,description\n"Wireless Earbuds",2499,"https://affiliate.example.com/earbuds","Active noise cancelling"\n"Smart Thermos Bottle",1499,"https://affiliate.example.com/bottle","LCD temperature screen"';
                    const blob = new Blob([sampleCsv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'products_template.csv';
                    a.click();
                  }}
                  className="text-xs text-teal-600 hover:underline"
                >
                  Download Sample CSV Template
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCsvOpen(false)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2 font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCsvImport}
                    disabled={!csvFile || isImporting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50"
                  >
                    {isImporting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Import Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        title="Delete Product?"
        message={`Are you sure you want to remove "${productToDelete?.name}" from your affiliate catalogue? Existing videos referencing this product will remain in your library.`}
        confirmLabel="Delete Product"
        isDestructive
        onConfirm={handleDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
