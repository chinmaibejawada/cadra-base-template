import { useParams, useNavigate } from 'react-router-dom';
import { useFarm, useDeleteFarm } from '../api/farms';
import { useOrders } from '../api/orders';
import NoteList from '../components/notes/NoteList';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import PageHeader from '../components/ui/PageHeader';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function FarmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const farmId = parseInt(id || '0', 10);
  const { data: farm, isLoading, error, refetch } = useFarm(farmId);
  const { data: orders } = useOrders({ farmId });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={(error as Error).message} onRetry={refetch} />;
  if (!farm) return <ErrorDisplay message="Farm not found" />;

  return (
    <div>
      <PageHeader
        title={farm.name}
        description={[farm.city, farm.state].filter(Boolean).join(', ')}
        actions={
          <button onClick={() => navigate('/farms')} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Back to Farms
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Orders</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {!orders || orders.length === 0 ? (
                <p className="p-5 text-sm text-gray-400">No orders for this farm.</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="flex cursor-pointer items-center justify-between px-5 py-3 hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Contact Info</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {farm.phone && <p><span className="font-medium">Phone:</span> {farm.phone}</p>}
              {farm.email && <p><span className="font-medium">Email:</span> {farm.email}</p>}
              {farm.address && <p><span className="font-medium">Address:</span> {farm.address}</p>}
              {[farm.city, farm.state, farm.zipCode].filter(Boolean).length > 0 && (
                <p><span className="font-medium">Location:</span> {[farm.city, farm.state, farm.zipCode].filter(Boolean).join(', ')}</p>
              )}
              {!farm.phone && !farm.email && <p className="text-gray-400 italic">No contact info.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <NoteList notableType="farm" notableId={farm.id} />
          </div>
        </div>
      </div>
    </div>
  );
}