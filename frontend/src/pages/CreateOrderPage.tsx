import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarms } from '../api/farms';
import { useProducts } from '../api/products';
import { useCreateOrder } from '../api/orders';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';

interface LineItem {
  productId: number;
  quantity: number;
}

const emptyLine = (): LineItem => ({ productId: 0, quantity: 1 });

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { data: farms, isLoading: farmsLoading } = useFarms();
  const { data: products, isLoading: productsLoading } = useProducts();
  const createOrder = useCreateOrder();

  const [farmId, setFarmId] = useState<number>(0);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineItem[]>([emptyLine()]);

  const getProduct = (id: number) => products?.find((p) => p.id === id);

  const subtotal = lines.reduce((sum, line) => {
    const product = getProduct(line.productId);
    return sum + (product ? line.quantity * Number(product.unitPrice) : 0);
  }, 0);
  const taxAmount = subtotal * 0.07;
  const totalAmount = subtotal + taxAmount;

  const addLine = () => setLines([...lines, emptyLine()]);
  const removeLine = (idx: number) => { if (lines.length > 1) setLines(lines.filter((_, i) => i !== idx)); };
  const updateLine = (idx: number, field: keyof LineItem, value: number) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: value };
    setLines(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId || lines.some((l) => !l.productId || l.quantity <= 0)) return;

    createOrder.mutate(
      {
        farmId,
        orderDate,
        requestedDeliveryDate: requestedDeliveryDate || null,
        notes: notes || null,
        lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      },
      {
        onSuccess: (order) => navigate(`/orders/${order.id}`),
      }
    );
  };

  if (farmsLoading || productsLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="New Order"
        description="Create a new purchase order"
        actions={<button onClick={() => navigate('/orders')} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-700">Order Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Farm *</label>
                  <select value={farmId} onChange={(e) => setFarmId(parseInt(e.target.value, 10))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" required>
                    <option value={0}>Select a farm...</option>
                    {farms?.map((f) => <option key={f.id} value={f.id}>{f.name}{f.city ? ` — ${f.city}` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Date *</label>
                  <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requested Delivery</label>
                  <input type="date" value={requestedDeliveryDate} onChange={(e) => setRequestedDeliveryDate(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Line Items</h2>
                <button type="button" onClick={addLine} className="text-xs font-medium text-prairie-600 hover:text-prairie-800">+ Add Item</button>
              </div>
              <div className="divide-y divide-gray-100">
                {lines.map((line, idx) => {
                  const product = getProduct(line.productId);
                  const lineTotal = product ? line.quantity * Number(product.unitPrice) : 0;
                  return (
                    <div key={idx} className="flex items-end gap-3 px-5 py-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500">Product</label>
                        <select value={line.productId} onChange={(e) => updateLine(idx, 'productId', parseInt(e.target.value, 10))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none">
                          <option value={0}>Select...</option>
                          {products?.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} ({formatCurrency(Number(p.unitPrice))}/{p.unit})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-gray-500">Qty</label>
                        <input type="number" min="0.001" step="0.001" value={line.quantity} onChange={(e) => updateLine(idx, 'quantity', parseFloat(e.target.value) || 0)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" />
                      </div>
                      <div className="w-24 pt-5 text-right text-sm font-medium text-gray-900">{formatCurrency(lineTotal)}</div>
                      <button type="button" onClick={() => removeLine(idx)} disabled={lines.length === 1} className="pt-5 text-sm text-red-500 hover:text-red-700 disabled:opacity-30">&times;</button>
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-3">
                <label className="block text-xs font-medium text-gray-500">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-prairie-500 focus:outline-none" rows={2} placeholder="Optional notes..." />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax (7%)</span><span>{formatCurrency(taxAmount)}</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900"><span>Total</span><span>{formatCurrency(totalAmount)}</span></div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!farmId || lines.some((l) => !l.productId || l.quantity <= 0) || createOrder.isPending}
              className="w-full rounded-md bg-prairie-600 px-4 py-3 text-sm font-medium text-white hover:bg-prairie-700 disabled:opacity-50"
            >
              {createOrder.isPending ? 'Creating Order...' : 'Create Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}