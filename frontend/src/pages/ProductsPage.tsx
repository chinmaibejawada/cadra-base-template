import { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../api/products';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/formatters';
import type { ProductFormData } from '../types/product';

export default function ProductsPage() {
  const { data: products, isLoading, error, refetch } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{ id: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const emptyForm: ProductFormData = { sku: '', name: '', unit: 'lbs', unitPrice: 0, currentStock: 0, reorderPoint: 0 };
  const [form, setForm] = useState<ProductFormData>(emptyForm);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (p: NonNullable<typeof products>[number]) => {
    setEditingProduct({ id: p.id });
    setForm({ sku: p.sku, name: p.name, description: p.description, category: p.category, unit: p.unit, unitPrice: Number(p.unitPrice), currentStock: Number(p.currentStock), reorderPoint: Number(p.reorderPoint) });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...form }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createProduct.mutate(form, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProduct.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={(error as Error).message} onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Products" description={`${products?.length || 0} products`} actions={<button onClick={openCreate} className="rounded-md bg-prairie-600 px-4 py-2 text-sm font-medium text-white hover:bg-prairie-700">+ Add Product</button>} />

      {!products || products.length === 0 ? (
        <EmptyState title="No products yet" description="Add your first product to get started." action={<button onClick={openCreate} className="rounded-md bg-prairie-600 px-4 py-2 text-sm font-medium text-white hover:bg-prairie-700">Add Product</button>} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => {
                const isLow = Number(product.currentStock) <= Number(product.reorderPoint);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4"><span className="font-medium text-gray-900">{product.name}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.category || '—'}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{formatCurrency(Number(product.unitPrice))}/{product.unit}</td>
                    <td className={`px-6 py-4 text-right text-sm font-medium ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                      {Number(product.currentStock).toFixed(1)} {product.unit}
                      {isLow && <span className="ml-1.5 text-xs text-red-500">(Low)</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(product)} className="mr-2 text-sm text-prairie-600 hover:text-prairie-800">Edit</button>
                      <button onClick={() => setDeleteTarget({ id: product.id, name: product.name })} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">SKU *</label>
              <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit *</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none">
                <option value="lbs">lbs</option>
                <option value="bu">bu</option>
                <option value="ton">ton</option>
                <option value="gal">gal</option>
                <option value="each">each</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input type="text" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price *</label>
              <input type="number" step="0.01" min="0" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <input type="number" step="0.001" min="0" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: parseFloat(e.target.value) || 0 })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reorder At</label>
              <input type="number" step="0.001" min="0" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: parseFloat(e.target.value) || 0 })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={!form.sku || !form.name || form.unitPrice <= 0} className="rounded-md bg-prairie-600 px-4 py-2 text-sm font-medium text-white hover:bg-prairie-700 disabled:opacity-50">
              {editingProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Product" message={`Are you sure you want to delete "${deleteTarget?.name}"?`} confirmLabel="Delete" />
    </div>
  );
}