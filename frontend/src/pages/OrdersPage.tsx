import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../api/orders';
import { useFarms } from '../api/farms';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const { data: orders, isLoading, error, refetch } = useOrders();
  const { data: farms } = useFarms();

  const filtered = statusFilter ? orders?.filter((o) => o.status === statusFilter) : orders;

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={(error as Error).message} onRetry={refetch} />;

  const statuses = ['draft', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${filtered?.length || 0} orders${statusFilter ? ` (${statusFilter})` : ''}`}
        actions={
          <button onClick={() => navigate('/orders/new')} className="rounded-md bg-prairie-600 px-4 py-2 text-sm font-medium text-white hover:bg-prairie-700">
            + New Order
          </button>
        }
      />

      <div className="mb-4 flex gap-2">
        <button onClick={() => setStatusFilter('')} className={`rounded-md px-3 py-1.5 text-xs font-medium ${!statusFilter ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
        {statuses.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${statusFilter === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
        ))}
      </div>

      {!filtered || filtered.length === 0 ? (
        <EmptyState title="No orders found" description={statusFilter ? `No orders with status "${statusFilter}".` : 'Create your first order.'} action={<button onClick={() => navigate('/orders/new')} className="rounded-md bg-prairie-600 px-4 py-2 text-sm font-medium text-white hover:bg-prairie-700">New Order</button>} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Farm</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((order) => (
                <tr key={order.id} onClick={() => navigate(`/orders/${order.id}`)} className="cursor-pointer hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.farm?.name || `Farm #${order.farmId}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.orderDate)}</td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}