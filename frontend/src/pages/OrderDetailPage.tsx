import { useParams, useNavigate } from 'react-router-dom';
import { useOrder, useUpdateOrderStatus, useCancelOrder, useDeleteOrder } from '../api/orders';
import NoteList from '../components/notes/NoteList';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import PageHeader from '../components/ui/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { formatCurrency, formatDate, getNextStatuses } from '../utils/formatters';
import { useState } from 'react';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = parseInt(id || '0', 10);
  const { data: order, isLoading, error, refetch } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();
  const deleteOrder = useDeleteOrder();
  const [cancelTarget, setCancelTarget] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={(error as Error).message} onRetry={refetch} />;
  if (!order) return <ErrorDisplay message="Order not found" />;

  const nextStatuses = getNextStatuses(order.status);
  const taxRate = order.subtotal > 0 ? ((order.taxAmount / order.subtotal) * 100).toFixed(1) : '7.0';

  const handleStatusTransition = (status: string) => {
    updateStatus.mutate({ id: order.id, status }, { onSuccess: () => refetch() });
  };

  const handleCancel = () => {
    cancelOrder.mutate(order.id, { onSuccess: () => { setCancelTarget(false); refetch(); } });
  };

  const handleDelete = () => {
    deleteOrder.mutate(order.id, { onSuccess: () => navigate('/orders') });
  };

  return (
    <div>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={`Created ${formatDate(order.createdAt)}`}
        actions={
          <button onClick={() => navigate('/orders')} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Back to Orders
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Line Items</h2>
              <StatusBadge status={order.status} />
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-2 text-left">Product</th>
                  <th className="px-5 py-2 text-right">Qty</th>
                  <th className="px-5 py-2 text-right">Unit Price</th>
                  <th className="px-5 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.orderLines?.map((line) => (
                  <tr key={line.id} className="text-sm">
                    <td className="px-5 py-3 font-medium text-gray-900">{line.product?.name || `Product #${line.productId}`}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{Number(line.quantity).toFixed(3)} {line.product?.unit || ''}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{formatCurrency(Number(line.unitPrice))}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">{formatCurrency(Number(line.lineTotal))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-200 px-5 py-4">
              <div className="ml-auto space-y-1 text-sm" style={{ maxWidth: '16rem' }}>
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax ({taxRate}%)</span><span>{formatCurrency(order.taxAmount)}</span></div>
                <div className="flex justify-between text-base font-semibold text-gray-900"><span>Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-4">
              <NoteList notableType="order" notableId={order.id} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Order Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Farm:</span> {order.farm?.name || `#${order.farmId}`}</p>
              <p><span className="font-medium">Order Date:</span> {formatDate(order.orderDate)}</p>
              {order.requestedDeliveryDate && <p><span className="font-medium">Requested Delivery:</span> {formatDate(order.requestedDeliveryDate)}</p>}
              {order.actualDeliveryDate && <p><span className="font-medium">Actual Delivery:</span> {formatDate(order.actualDeliveryDate)}</p>}
              {order.notes && <p><span className="font-medium">Notes:</span> {order.notes}</p>}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Actions</h3>
            <div className="space-y-2">
              {nextStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusTransition(status)}
                  disabled={updateStatus.isPending}
                  className={`w-full rounded-md px-3 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                    status === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : 'bg-prairie-600 hover:bg-prairie-700'
                  }`}
                >
                  {status === 'cancelled' ? 'Cancel Order' : `Move to ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                </button>
              ))}
              {order.status === 'draft' && (
                <button onClick={() => setDeleteTarget(true)} className="w-full rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                  Delete Draft
                </button>
              )}
              {nextStatuses.length === 0 && order.status !== 'cancelled' && (
                <p className="text-xs text-gray-400 italic text-center">No further actions available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog isOpen={cancelTarget} onClose={() => setCancelTarget(false)} onConfirm={handleCancel} title="Cancel Order" message={`Are you sure you want to cancel order ${order.orderNumber}?`} confirmLabel="Cancel Order" />
      <ConfirmDialog isOpen={deleteTarget} onClose={() => setDeleteTarget(false)} onConfirm={handleDelete} title="Delete Draft" message="Are you sure you want to delete this draft order? This cannot be undone." confirmLabel="Delete" />
    </div>
  );
}