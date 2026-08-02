import { create } from 'zustand';
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

export const useStore = create<AppState>((set) => ({
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
        return { ...item, stock: newStock, status };
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
}));
