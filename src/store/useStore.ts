import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  InventoryItem, 
  TimeSeriesPoint, 
  Optimization, 
  Alert,
  mockInventory,
  mockTimeSeries,
  mockOptimizations,
  mockAlerts
} from '@/lib/mockData';

interface AppState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;

  inventory: InventoryItem[];
  updateStock: (id: string, newStock: number) => void;
  updateProduct: (id: string, updates: Partial<InventoryItem>) => void;
  addProduct: (item: Omit<InventoryItem, 'id' | 'status' | 'value'>) => void;
  deleteProduct: (id: string) => void;
  applyDiscount: (id: string, discountPercent: number) => void;

  timeSeriesData: TimeSeriesPoint[];
  
  optimizations: Optimization[];
  approveOptimization: (id: string) => void;
  rejectOptimization: (id: string) => void;

  alerts: Alert[];
  
  // Simulator parameters
  simulatorParams: {
    marketingSpend: number;
    discountPercent: number;
    weatherImpact: number;
  };
  updateSimulatorParam: (param: keyof AppState['simulatorParams'], value: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),

      inventory: mockInventory,
      updateStock: (id, newStock) => set((state) => ({
        inventory: state.inventory.map(item => {
          if (item.id === id) {
            let status = item.status;
            if (newStock === 0) status = 'Out of Stock';
            else if (newStock < 20) status = 'Low';
            else status = 'In Stock';
            return { ...item, stock: newStock, status, value: item.price * newStock };
          }
          return item;
        })
      })),
      updateProduct: (id, updates) => set((state) => ({
        inventory: state.inventory.map(item => {
          if (item.id === id) {
            const updatedItem = { ...item, ...updates };
            // Recalculate dynamic fields
            if (updatedItem.stock === 0) updatedItem.status = 'Out of Stock';
            else if (updatedItem.stock < 20) updatedItem.status = 'Low';
            else updatedItem.status = 'In Stock';
            
            updatedItem.value = updatedItem.price * updatedItem.stock;
            return updatedItem;
          }
          return item;
        })
      })),
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
        
        return { inventory: [...state.inventory, newItem] };
      }),
      deleteProduct: (id) => set((state) => ({
        inventory: state.inventory.filter(item => item.id !== id)
      })),
      applyDiscount: (id, discountPercent) => set((state) => ({
        inventory: state.inventory.map(item => {
          if (item.id === id) {
            const newPrice = item.price * (1 - (discountPercent / 100));
            return {
              ...item,
              price: newPrice,
              value: newPrice * item.stock
            };
          }
          return item;
        })
      })),

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
