import { create } from 'zustand';
import { Product, Order, InventoryItem, SizeRecord } from '@/types';

interface AppState {
  selectedProducts: Product[];
  currentOrder: Partial<Order> | null;
  sizeRecord: Partial<SizeRecord>;
  selectedMaterialIds: string[];
  urgentOrders: Order[];
  setSelectedProducts: (products: Product[]) => void;
  addSelectedProduct: (product: Product) => void;
  removeSelectedProduct: (productId: string) => void;
  setCurrentOrder: (order: Partial<Order> | null) => void;
  setSizeRecord: (size: Partial<SizeRecord>) => void;
  setSelectedMaterialIds: (ids: string[]) => void;
  toggleMaterialId: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  selectedProducts: [],
  currentOrder: null,
  sizeRecord: {
    gender: '男'
  },
  selectedMaterialIds: [],
  urgentOrders: [],
  setSelectedProducts: (products) => set({ selectedProducts: products }),
  addSelectedProduct: (product) => {
    const exists = get().selectedProducts.find(p => p.id === product.id);
    if (!exists) {
      set({ selectedProducts: [...get().selectedProducts, product] });
    }
  },
  removeSelectedProduct: (productId) => {
    set({ selectedProducts: get().selectedProducts.filter(p => p.id !== productId) });
  },
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setSizeRecord: (size) => set({ sizeRecord: { ...get().sizeRecord, ...size } }),
  setSelectedMaterialIds: (ids) => set({ selectedMaterialIds: ids }),
  toggleMaterialId: (id) => {
    const ids = get().selectedMaterialIds;
    if (ids.includes(id)) {
      set({ selectedMaterialIds: ids.filter(i => i !== id) });
    } else {
      set({ selectedMaterialIds: [...ids, id] });
    }
  }
}));
