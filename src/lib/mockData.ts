export type InventoryStatus = 'In Stock' | 'Low' | 'Out of Stock';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  status: InventoryStatus;
  price: number;
  value: number;
}

export interface TimeSeriesPoint {
  date: string;
  actual: number | null;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export interface Optimization {
  id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'sale' | 'reorder' | 'transfer';
}

export interface Alert {
  id: string;
  message: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
}

export const mockInventory: InventoryItem[] = [
  { id: 'SKU-8832', name: 'Aashirvaad Atta (5kg)', category: 'Groceries', stock: 12, status: 'Low', price: 210, value: 2520 },
  { id: 'SKU-9921', name: 'Maggi 2-Min Noodles', category: 'Snacks', stock: 450, status: 'In Stock', price: 14, value: 6300 },
  { id: 'SKU-1002', name: 'Amul Taaza Milk (1L)', category: 'Dairy', stock: 0, status: 'Out of Stock', price: 68, value: 0 },
  { id: 'SKU-4431', name: 'Tata Salt (1kg)', category: 'Groceries', stock: 85, status: 'In Stock', price: 24, value: 2040 },
  { id: 'SKU-2314', name: 'Surf Excel Matic', category: 'Household', stock: 20, status: 'Low', price: 180, value: 3600 },
];

const generateTimeSeries = (): TimeSeriesPoint[] => {
  const data: TimeSeriesPoint[] = [];
  const today = new Date();
  
  for (let i = -30; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const isFuture = i > 0;
    
    const baseValue = 100 + Math.sin(i / 5) * 20 + (Math.random() * 10 - 5);
    
    data.push({
      date: d.toISOString().split('T')[0],
      actual: isFuture ? null : Math.round(baseValue),
      predicted: Math.round(baseValue + (isFuture ? Math.random() * 5 : 0)),
      lowerBound: Math.round(baseValue - 15),
      upperBound: Math.round(baseValue + 15),
    });
  }
  return data;
};

export const mockTimeSeries = generateTimeSeries();

export const mockOptimizations: Optimization[] = [
  { id: 'OPT-1', message: 'Initiate bundle offer on Maggi to clear excess stock before expiry', status: 'pending', type: 'sale' },
  { id: 'OPT-2', message: 'Reorder Aashirvaad Atta immediately, distributor lead time is 2 days', status: 'pending', type: 'reorder' },
  { id: 'OPT-3', message: 'Move Surf Excel to front aisle for upcoming weekend demand', status: 'approved', type: 'transfer' },
];

export const mockAlerts: Alert[] = [
  { id: 'ALT-1', message: 'Sudden spike in demand for Amul Milk detected in local area', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), severity: 'high' },
  { id: 'ALT-2', message: 'Stock for Aashirvaad Atta dropping faster than predicted', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), severity: 'medium' },
];
