export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
    shipped: 'bg-purple-100 text-purple-700 border-purple-300',
    delivered: 'bg-green-100 text-green-700 border-green-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
  };
  return colors[status] || colors.draft;
}

export function getNextStatuses(status: string): string[] {
  const transitions: Record<string, string[]> = {
    draft: ['pending', 'cancelled'],
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  };
  return transitions[status] || [];
}