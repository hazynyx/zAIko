import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  InventoryItem, 
  TimeSeriesPoint, 
  Optimization, 
  Alert,
  Transaction,
  mockInventory,
  mockTimeSeries,
  mockOptimizations,
  mockAlerts,
  mockTransactions
} from '@/lib/mockData';

interface AppState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;

  inventory: InventoryItem[];
  updateStock: (id: string, newStock: number) => void;
  updateProduct: (id: string, updates: Partial<InventoryItem>) => void;
  recordSale: (id: string, quantity: number) => void;
  reorderProduct: (id: string, quantity: number) => void;
  receiveOrder: (id: string) => void;
  addProduct: (item: Omit<InventoryItem, 'id' | 'status' | 'value'>) => void;
  deleteProduct: (id: string) => void;
  applyDiscount: (id: string, discountPercent: number) => void;

  timeSeriesData: TimeSeriesPoint[];
  
  optimizations: Optimization[];
  approveOptimization: (id: string) => void;
  rejectOptimization: (id: string) => void;

  alerts: Alert[];
  transactions: Transaction[];
  
  // Simulator parameters
  simulatorParams: {
    marketingSpend: number;
    discountPercent: number;
    weatherImpact: number;
  };
  updateSimulatorParam: (param: keyof AppState['simulatorParams'], value: number) => void;
  updateSimulatorParam: (param: keyof AppState['simulatorParams'], value: number) => void;
}

const syncAlerts = (currentAlerts: Alert[], inventory: InventoryItem[]): Alert[] => {
  const desiredAlertIds = new Set<string>();
  const newAlerts: Alert[] = [...currentAlerts];

  const addOrKeepAlert = (id: string, message: string, severity: 'high' | 'medium' | 'low') => {
    desiredAlertIds.add(id);
    if (!newAlerts.some(a => a.id === id)) {
      newAlerts.push({
        id,
        message,
        timestamp: new Date().toISOString(),
        severity
      });
    }
  };

  inventory.forEach(item => {
    if (item.status === 'Out of Stock') {
      addOrKeepAlert(`ALT-OOS-${item.id}`, `Critical: ${item.name} is completely Out of Stock!`, 'high');
    } else if (item.status === 'Low' && !item.orderedQuantity) {
      addOrKeepAlert(`ALT-LOW-${item.id}`, `Warning: ${item.name} is running Low (${item.stock} left). Action required.`, 'medium');
    } 
    
    if (item.orderedQuantity) {
      addOrKeepAlert(`ALT-ORD-${item.id}`, `Pending Shipment: ${item.orderedQuantity} units of ${item.name} are on the way.`, 'low');
    }
    
    if (item.value > 5000 || item.stock > 400) {
      addOrKeepAlert(`ALT-OVS-${item.id}`, `Overstock Risk: ${item.name} has unusually high capital tied up (${item.stock} units).`, 'medium');
    }
  });

  return newAlerts.filter(a => {
    if (a.id.startsWith('ALT-OOS-') || a.id.startsWith('ALT-LOW-') || a.id.startsWith('ALT-ORD-') || a.id.startsWith('ALT-OVS-')) {
      return desiredAlertIds.has(a.id);
    }
    return true; // Keep manual/mock alerts untouched
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const syncOptimizations = (currentOpts: Optimization[], inventory: InventoryItem[]): Optimization[] => {
  const desiredOptIds = new Set<string>();
  const newOpts: Optimization[] = [...currentOpts];

  const addOrKeepOpt = (id: string, message: string, type: 'sale' | 'reorder' | 'transfer') => {
    desiredOptIds.add(id);
    if (!newOpts.some(o => o.id === id)) {
      newOpts.push({
        id,
        message,
        status: 'pending',
        type
      });
    }
  };

  inventory.forEach(item => {
    if (item.stock > 400 || item.value > 5000) {
      addOrKeepOpt(`OPT-OVS-${item.id}`, `Initiate bundle offer on ${item.name} to clear excess stock before value depreciates`, 'sale');
    }
    if (item.status === 'Low' && !item.orderedQuantity) {
      addOrKeepOpt(`OPT-LOW-${item.id}`, `Reorder ${item.name} immediately, distributor lead time is 2 days`, 'reorder');
    }
  });

  return newOpts.filter(o => {
    if (o.id.startsWith('OPT-OVS-') || o.id.startsWith('OPT-LOW-')) {
      return desiredOptIds.has(o.id);
    }
    return true; 
  });
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),

      inventory: mockInventory,
      updateStock: (id, newStock) => set((state) => {
        const inventory = state.inventory.map(item => {
          if (item.id === id) {
            let status = item.status;
            if (newStock === 0) status = 'Out of Stock';
            else if (newStock < 20) status = 'Low';
            else status = 'In Stock';
            return { ...item, stock: newStock, status, value: item.price * newStock };
          }
          return item;
        });
        return { 
          inventory, 
          alerts: syncAlerts(state.alerts, inventory),
          optimizations: syncOptimizations(state.optimizations, inventory) 
        };
      }),
      updateProduct: (id, updates) => set((state) => {
        const inventory = state.inventory.map(item => {
          if (item.id === id) {
            const updatedItem = { ...item, ...updates };
            if (updatedItem.stock === 0) updatedItem.status = 'Out of Stock';
            else if (updatedItem.stock < 20) updatedItem.status = 'Low';
            else updatedItem.status = 'In Stock';
            
            updatedItem.value = updatedItem.price * updatedItem.stock;
            return updatedItem;
          }
          return item;
        });
        return { 
          inventory, 
          alerts: syncAlerts(state.alerts, inventory),
          optimizations: syncOptimizations(state.optimizations, inventory)
        };
      }),
      recordSale: (id, quantity) => set((state) => {
        let soldItemName = '';
        let revenue = 0;
        const inventory = state.inventory.map(item => {
          if (item.id === id) {
            soldItemName = item.name;
            revenue = quantity * item.price;
            const newStock = Math.max(0, item.stock - quantity);
            let status = item.status;
            if (newStock === 0) status = 'Out of Stock';
            else if (newStock < 20) status = 'Low';
            else status = 'In Stock';
            return { ...item, stock: newStock, status, value: item.price * newStock };
          }
          return item;
        });
        const newTx: Transaction = {
          id: `TXN-${Date.now()}`,
          type: 'sale',
          message: `Sold ${quantity} units of ${soldItemName}`,
          timestamp: new Date().toISOString(),
          amount: revenue,
          itemId: id,
          quantity: quantity
        };

        const todayStr = new Date().toISOString().split('T')[0];
        const timeSeriesData = state.timeSeriesData.map(pt => {
          if (pt.date === todayStr) {
            return {
              ...pt,
              actual: (pt.actual || 0) + quantity
            };
          }
          return pt;
        });

        return { 
          inventory, 
          alerts: syncAlerts(state.alerts, inventory), 
          transactions: [newTx, ...state.transactions],
          timeSeriesData,
          optimizations: syncOptimizations(state.optimizations, inventory)
        };
      }),
      reorderProduct: (id, quantity) => set((state) => {
        let itemName = '';
        const inventory = state.inventory.map(item => {
          if (item.id === id) {
            itemName = item.name;
            return { ...item, orderedQuantity: (item.orderedQuantity || 0) + quantity };
          }
          return item;
        });
        const newTx: Transaction = {
          id: `TXN-${Date.now()}`,
          type: 'reorder',
          message: `Placed reorder for ${quantity} units of ${itemName}`,
          timestamp: new Date().toISOString(),
          itemId: id,
          quantity: quantity
        };
        return { 
          inventory, 
          alerts: syncAlerts(state.alerts, inventory), 
          transactions: [newTx, ...state.transactions],
          optimizations: syncOptimizations(state.optimizations, inventory)
        };
      }),
      receiveOrder: (id) => set((state) => {
        let itemName = '';
        let receivedQty = 0;
        const inventory = state.inventory.map(item => {
          if (item.id === id && item.orderedQuantity) {
            itemName = item.name;
            receivedQty = item.orderedQuantity;
            const newStock = item.stock + item.orderedQuantity;
            let status = item.status;
            if (newStock === 0) status = 'Out of Stock';
            else if (newStock < 20) status = 'Low';
            else status = 'In Stock';
            
            return {
              ...item,
              stock: newStock,
              status,
              value: item.price * newStock,
              orderedQuantity: 0
            };
          }
          return item;
        });
        if (!itemName) return { inventory, alerts: syncAlerts(state.alerts, inventory) };
        
        const newTx: Transaction = {
          id: `TXN-${Date.now()}`,
          type: 'receive',
          message: `Received shipment of ${receivedQty} units of ${itemName}`,
          timestamp: new Date().toISOString(),
          itemId: id,
          quantity: receivedQty
        };
        return { 
          inventory, 
          alerts: syncAlerts(state.alerts, inventory), 
          transactions: [newTx, ...state.transactions],
          optimizations: syncOptimizations(state.optimizations, inventory)
        };
      }),
      addProduct: (item) => set((state) => {
        let status: InventoryItem['status'] = 'In Stock';
        if (item.stock === 0) status = 'Out of Stock';
        else if (item.stock < 20) status = 'Low';
        
        const newItem: InventoryItem = {
          ...item,
          price: item.price !== undefined ? item.price : item.retailPrice,
          id: `SKU-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          status,
          value: (item.price !== undefined ? item.price : item.retailPrice) * item.stock
        };
        
        const inventory = [...state.inventory, newItem];
        return { 
          inventory, 
          alerts: syncAlerts(state.alerts, inventory),
          optimizations: syncOptimizations(state.optimizations, inventory)
        };
      }),
      deleteProduct: (id) => set((state) => {
        const inventory = state.inventory.filter(item => item.id !== id);
        return { 
          inventory, 
          alerts: syncAlerts(state.alerts, inventory),
          optimizations: syncOptimizations(state.optimizations, inventory)
        };
      }),
      applyDiscount: (id, discountPercent) => set((state) => {
        const inventory = state.inventory.map(item => {
          if (item.id === id) {
            const newPrice = item.price * (1 - (discountPercent / 100));
            return {
              ...item,
              price: newPrice,
              value: newPrice * item.stock
            };
          }
          return item;
        });
        return { inventory, alerts: syncAlerts(state.alerts, inventory) };
      }),

      timeSeriesData: mockTimeSeries,

      optimizations: mockOptimizations,
      approveOptimization: (id) => set((state) => ({
        optimizations: state.optimizations.map(opt => 
          opt.id === id ? { ...opt, status: 'approved' } : opt
        )
      })),
      rejectOptimization: (id) => set((state) => ({
        optimizations: state.optimizations.map(opt => 
          opt.id === id ? { ...opt, status: 'rejected' } : opt
        )
      })),

      alerts: mockAlerts,
      transactions: mockTransactions,

      simulatorParams: {
        marketingSpend: 1000,
        discountPercent: 10,
        weatherImpact: 0,
      },
      updateSimulatorParam: (param, value) => set((state) => ({
        simulatorParams: { ...state.simulatorParams, [param]: value }
      }))
    }),
    {
      name: 'zaiko-storage',
      // We explicitly skip persisting timeSeriesData if it's too large, but for this hackathon app, persisting the whole state is fine.
    }
  )
);
