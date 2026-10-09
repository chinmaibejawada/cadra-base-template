import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarms, useCreateFarm, useUpdateFarm, useDeleteFarm } from '../api/farms';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import type { FarmFormData } from '../types/farm';

export default function FarmsPage() {
  const navigate = useNavigate();
  const { data: farms, isLoading, error, refetch } = useFarms();
  const createFarm = useCreateFarm();
  const updateFarm = useUpdateFarm();
  const deleteFarm = useDeleteFarm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<{ id: number; name: string; city?: string; state?: string; phone?: string; email?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const [form, setForm] = useState<FarmFormData>({ name: '' });

  const openCreate = () => {
    setEditingFarm(null);
    setForm({ name: '' });
    setIsModalOpen(true);
  };

  const openEdit = (farm: NonNullable<typeof farms>[number]) => {
    setEditingFarm({ id: farm.id, name: farm.name, city: farm.city || '', state: farm.state || '', phone: farm.phone || '', email: farm.email || '' });
    setForm({ name: farm.name, city: farm.city || '', state: farm.state || '', phone: farm.phone || '', email: farm.email || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFarm) {
      updateFarm.mutate({ id: editingFarm.id, ...form }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createFarm.mutate(form, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteFarm.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={(error as Error).message} onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Farms" description={`${farms?.length || 0} active farms`} actions={<button onClick={openCreate} className="rounded-md bg-prairie-600 px-4 py-2 text-sm font-medium text-white hover:bg-prairie-700">+ Add Farm</button>} />

      {!farms || farms.length === 0 ? (
        <EmptyState title="No farms yet" description="Add your first farm to get started." action={<button onClick={openCreate} className="rounded-md bg-prairie-600 px-4 py-2 text-sm font-medium text-white hover:bg-prairie-700">Add Farm</button>} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {farms.map((farm) => (
                <tr key={farm.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/farms/${farm.id}`)}>
                  <td className="px-6 py-4"><span className="font-medium text-gray-900">{farm.name}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{[farm.city, farm.state].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{farm.phone || farm.email || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(farm); }} className="mr-2 text-sm text-prairie-600 hover:text-prairie-800">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: farm.id, name: farm.name }); }} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingFarm ? 'Edit Farm' : 'Add Farm'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Farm Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input type="text" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input type="text" value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="text" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={!form.name} className="rounded-md bg-prairie-600 px-4 py-2 text-sm font-medium text-white hover:bg-prairie-700 disabled:opacity-50">
              {editingFarm ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Farm" message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}