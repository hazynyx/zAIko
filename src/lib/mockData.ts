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
  { id: 'SKU-8832', name: 'Winter Jacket Pro', category: 'Apparel', stock: 12, status: 'Low', price: 120, value: 1440 },
  { id: 'SKU-9921', name: 'Summer T-Shirt', category: 'Apparel', stock: 450, status: 'In Stock', price: 25, value: 11250 },
  { id: 'SKU-1002', name: 'Umbrella Windproof', category: 'Accessories', stock: 0, status: 'Out of Stock', price: 15, value: 0 },
  { id: 'SKU-4431', name: 'Running Shoes X', category: 'Footwear', stock: 85, status: 'In Stock', price: 80, value: 6800 },
  { id: 'SKU-2314', name: 'Yoga Mat', category: 'Equipment', stock: 20, status: 'Low', price: 30, value: 600 },
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
  { id: 'OPT-1', message: 'Initiate flash sale on Winter Jackets to prevent overstock', status: 'pending', type: 'sale' },
  { id: 'OPT-2', message: 'Reorder SKU-8832 immediately, supplier lead time is 14 days', status: 'pending', type: 'reorder' },
  { id: 'OPT-3', message: 'Transfer 50 units of Summer T-Shirt to Region North', status: 'approved', type: 'transfer' },
];

export const mockAlerts: Alert[] = [
  { id: 'ALT-1', message: 'Sudden spike in demand for Umbrellas detected in Region North', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), severity: 'high' },
  { id: 'ALT-2', message: 'Stock for Yoga Mat dropping faster than predicted', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), severity: 'medium' },
];
