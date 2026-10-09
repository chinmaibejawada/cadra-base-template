import { useNavigate } from 'react-router-dom';
import { useFarms } from '../api/farms';
import { useProducts, useLowStockProducts } from '../api/products';
import { useOrders } from '../api/orders';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';

function StatsCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: farms } = useFarms();
  const { data: products } = useProducts();
  const { data: lowStock } = useLowStockProducts();
  const { data: orders } = useOrders();

  if (!farms || !products || !orders) return <LoadingSpinner />;

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const recentOrders = orders.slice(0, 10);

  return (
    <div>
      <PageHeader title="Dashboard" description="Prairie Ridge Ag Supply - Overview" />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Active Farms" value={farms.length} color="text-prairie-700" />
        <StatsCard label="Products" value={products.length} color="text-blue-700" />
        <StatsCard label="Pending Orders" value={pendingOrders.length} color="text-amber-700" />
        <StatsCard label="Low Stock Items" value={lowStock?.length || 0} color="text-red-700" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="flex cursor-pointer items-center justify-between px-5 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.farm?.name || `Farm #${order.farmId}`} · {formatDate(order.orderDate)}</p>
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

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {!lowStock || lowStock.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">All products are well-stocked.</p>
            ) : (
              lowStock.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate('/products')}
                  className="flex cursor-pointer items-center justify-between px-5 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">{Number(product.currentStock).toFixed(1)} {product.unit}</p>
                    <p className="text-xs text-gray-400">Reorder at: {Number(product.reorderPoint).toFixed(1)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}