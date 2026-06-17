import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Product, Order, InventoryItem, SizeRecord, BillRecord, CustomItem, StockRecord } from '@/types';
import { orders as initialOrders } from '@/data/orders';
import { inventoryItems as initialInventory, billRecords as initialBills } from '@/data/inventory';

const STORAGE_KEY = 'funeral_app_state_v1';

interface PersistedState {
  orders: Order[];
  inventoryItems: InventoryItem[];
  billRecords: BillRecord[];
  customList: CustomItem[];
  stockRecords: StockRecord[];
  selectedProducts: Product[];
  sizeRecord: Partial<SizeRecord>;
  selectedMaterialIds: string[];
}

const loadPersisted = (): Partial<PersistedState> => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to load persisted state', e);
  }
  return {};
};

const savePersisted = (state: Partial<PersistedState>) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save persisted state', e);
  }
};

const persisted = loadPersisted();

const generateId = (prefix: string) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const generateOrderNo = () => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `FS${dateStr}${rand}`;
};

const formatDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const formatDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getInventoryStatus = (stock: number, minStock: number): '正常' | '预警' | '缺货' => {
  if (stock <= 0) return '缺货';
  if (stock <= minStock) return '预警';
  return '正常';
};

interface AppState {
  orders: Order[];
  inventoryItems: InventoryItem[];
  billRecords: BillRecord[];
  customList: CustomItem[];
  stockRecords: StockRecord[];
  selectedProducts: Product[];
  currentOrder: Partial<Order> | null;
  sizeRecord: Partial<SizeRecord>;
  selectedMaterialIds: string[];
  urgentOrders: Order[];

  persist: () => void;

  addCustomItem: (product: Product, size?: string) => void;
  removeCustomItem: (customItemId: string) => void;
  updateCustomItemQuantity: (customItemId: string, quantity: number) => void;
  clearCustomList: () => void;

  submitCustomOrder: (params: {
    customerName: string;
    customerPhone: string;
    address: string;
    funeralHome?: string;
    isUrgent?: boolean;
    urgentFee?: number;
    remark?: string;
    taboos?: string;
    customItems: CustomItem[];
    sizeInfo: Partial<SizeRecord>;
    materialNames: string[];
    materialPrice: number;
    suitName?: string;
  }) => Order;

  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  startDelivery: (orderId: string) => void;
  completeDelivery: (params: {
    orderId: string;
    signRemark?: string;
    deliveryFee?: number;
  }) => void;

  handleReturn: (params: {
    orderId: string;
    action: '退货' | '换货' | '完成';
    reason?: string;
    refundAmount?: number;
  }) => void;

  stockIn: (params: {
    itemId: string;
    quantity: number;
    operator?: string;
    remark?: string;
  }) => void;

  stockOut: (params: {
    itemId: string;
    quantity: number;
    operator?: string;
    remark?: string;
  }) => void;

  setSelectedProducts: (products: Product[]) => void;
  addSelectedProduct: (product: Product) => void;
  removeSelectedProduct: (productId: string) => void;
  setCurrentOrder: (order: Partial<Order> | null) => void;
  setSizeRecord: (size: Partial<SizeRecord>) => void;
  setSelectedMaterialIds: (ids: string[]) => void;
  toggleMaterialId: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  orders: persisted.orders || initialOrders,
  inventoryItems: persisted.inventoryItems || initialInventory,
  billRecords: persisted.billRecords || initialBills,
  customList: persisted.customList || [],
  stockRecords: persisted.stockRecords || [],
  selectedProducts: persisted.selectedProducts || [],
  currentOrder: null,
  sizeRecord: persisted.sizeRecord || { gender: '男' },
  selectedMaterialIds: persisted.selectedMaterialIds || [],
  urgentOrders: [],

  persist: () => {
    const state = get();
    savePersisted({
      orders: state.orders,
      inventoryItems: state.inventoryItems,
      billRecords: state.billRecords,
      customList: state.customList,
      stockRecords: state.stockRecords,
      selectedProducts: state.selectedProducts,
      sizeRecord: state.sizeRecord,
      selectedMaterialIds: state.selectedMaterialIds
    });
  },

  addCustomItem: (product, size) => {
    const existing = get().customList.find(c => c.productId === product.id && c.selectedSize === size);
    if (existing) {
      set({
        customList: get().customList.map(c =>
          c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      });
    } else {
      const newItem: CustomItem = {
        id: generateId('c'),
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: 1,
        selectedSize: size,
        addedAt: formatDateTime(new Date())
      };
      set({ customList: [...get().customList, newItem] });
    }
    get().persist();
  },

  removeCustomItem: (customItemId) => {
    set({ customList: get().customList.filter(c => c.id !== customItemId) });
    get().persist();
  },

  updateCustomItemQuantity: (customItemId, quantity) => {
    if (quantity <= 0) {
      get().removeCustomItem(customItemId);
      return;
    }
    set({
      customList: get().customList.map(c =>
        c.id === customItemId ? { ...c, quantity } : c
      )
    });
    get().persist();
  },

  clearCustomList: () => {
    set({ customList: [], selectedMaterialIds: [], sizeRecord: { gender: '男' } });
    get().persist();
  },

  submitCustomOrder: (params) => {
    const { customerName, customerPhone, address, funeralHome, isUrgent = false, urgentFee = 0, remark, taboos, customItems, sizeInfo, materialNames, materialPrice, suitName } = params;
    const now = new Date();

    const items = customItems.map(ci => ({
      productId: ci.productId,
      productName: ci.productName,
      price: ci.price,
      quantity: ci.quantity,
      size: ci.selectedSize,
      material: ci.selectedMaterial
    }));

    const itemsTotal = customItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);
    const customServiceFee = 500;
    const totalAmount = itemsTotal + materialPrice + customServiceFee + urgentFee;

    const newOrder: Order = {
      id: generateId('o'),
      orderNo: generateOrderNo(),
      customerName,
      customerPhone,
      address,
      funeralHome,
      items,
      totalAmount,
      paidAmount: 0,
      status: '待确认',
      isUrgent,
      urgentFee,
      createTime: formatDateTime(now),
      remark,
      taboos,
      sizeInfo,
      materialNames,
      suitName
    };

    set({ orders: [newOrder, ...get().orders] });

    const bill: BillRecord = {
      id: generateId('b'),
      date: formatDate(now),
      type: '收入',
      category: isUrgent ? '定制加急' : '定制服务',
      amount: totalAmount,
      orderNo: newOrder.orderNo,
      remark: `定制服务费${customServiceFee}元${urgentFee > 0 ? `，加急费${urgentFee}元` : ''}，含${customItems.length}件商品${materialNames.length ? '，材质：' + materialNames.join('/') : ''}${suitName ? '，套装：' + suitName : ''}`
    };
    set({ billRecords: [bill, ...get().billRecords] });

    get().persist();
    return newOrder;
  },

  updateOrderStatus: (orderId, status) => {
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status } : o
      )
    });
    get().persist();
  },

  startDelivery: (orderId) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;

    const now = new Date();
    set({
      orders: get().orders.map(o =>
        o.id === orderId
          ? { ...o, status: '配送中' as const, deliveryTime: formatDateTime(now) }
          : o
      )
    });
    get().persist();
  },

  completeDelivery: ({ orderId, signRemark, deliveryFee = 0 }) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;

    const now = new Date();
    set({
      orders: get().orders.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: '已完成' as const,
              deliverCompleteTime: formatDateTime(now),
              signRemark,
              deliveryFee
            }
          : o
      )
    });

    if (deliveryFee > 0) {
      const deliveryBill: BillRecord = {
        id: generateId('b'),
        date: formatDate(now),
        type: '收入',
        category: '配送服务',
        amount: deliveryFee,
        orderNo: order.orderNo,
        remark: `配送服务费${signRemark ? ' - ' + signRemark : ''}`
      };
      set({ billRecords: [deliveryBill, ...get().billRecords] });
    }

    get().persist();
  },

  handleReturn: ({ orderId, action, reason, refundAmount }) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;

    const now = new Date();
    let newStatus: Order['status'] = order.status;
    let newReturnInfo = order.returnInfo ? { ...order.returnInfo } : { type: null as '退货' | '换货' | null, reason: '' };

    if (action === '退货') {
      newStatus = '退换中';
      newReturnInfo = { type: '退货', reason: reason || '客户申请退货' };
    } else if (action === '换货') {
      newStatus = '退换中';
      newReturnInfo = { type: '换货', reason: reason || '客户申请换货' };
    } else if (action === '完成') {
      if (newReturnInfo.type === '退货') {
        newStatus = '已取消';
        const refund = refundAmount ?? order.paidAmount;
        newReturnInfo = { ...newReturnInfo, handleTime: formatDateTime(now), refundAmount: refund };

        if (refund > 0) {
          const refundBill: BillRecord = {
            id: generateId('b'),
            date: formatDate(now),
            type: '支出',
            category: '退款',
            amount: refund,
            orderNo: order.orderNo,
            remark: `退货退款 - ${newReturnInfo.reason}`
          };
          set({ billRecords: [refundBill, ...get().billRecords] });
        }
      } else if (newReturnInfo.type === '换货') {
        newStatus = '定制中';
        newReturnInfo = { ...newReturnInfo, handleTime: formatDateTime(now) };

        const bill: BillRecord = {
          id: generateId('b'),
          date: formatDate(now),
          type: '收入',
          category: '换货处理',
          amount: 0,
          orderNo: order.orderNo,
          remark: `换货处理完成 - ${newReturnInfo.reason}`
        };
        set({ billRecords: [bill, ...get().billRecords] });
      }
    }

    set({
      orders: get().orders.map(o =>
        o.id === orderId
          ? { ...o, status: newStatus, returnInfo: newReturnInfo }
          : o
      )
    });
    get().persist();
  },

  stockIn: ({ itemId, quantity, operator = '门店管理员', remark }) => {
    const now = new Date();
    const item = get().inventoryItems.find(i => i.id === itemId);
    if (!item) return;

    const newStock = item.stock + quantity;
    const newStatus = getInventoryStatus(newStock, item.minStock);

    set({
      inventoryItems: get().inventoryItems.map(i =>
        i.id === itemId
          ? {
              ...i,
              stock: newStock,
              status: newStatus,
              recentIn: i.recentIn + quantity,
              lastUpdate: formatDateTime(now)
            }
          : i
      )
    });

    const record: StockRecord = {
      id: generateId('s'),
      itemId,
      itemName: item.name,
      type: '入库',
      quantity,
      operator,
      date: formatDateTime(now),
      remark
    };
    set({ stockRecords: [record, ...get().stockRecords] });

    get().persist();
  },

  stockOut: ({ itemId, quantity, operator = '门店管理员', remark }) => {
    const now = new Date();
    const item = get().inventoryItems.find(i => i.id === itemId);
    if (!item) return;

    const newStock = Math.max(0, item.stock - quantity);
    const newStatus = getInventoryStatus(newStock, item.minStock);

    set({
      inventoryItems: get().inventoryItems.map(i =>
        i.id === itemId
          ? {
              ...i,
              stock: newStock,
              status: newStatus,
              recentOut: i.recentOut + quantity,
              lastUpdate: formatDateTime(now)
            }
          : i
      )
    });

    const record: StockRecord = {
      id: generateId('s'),
      itemId,
      itemName: item.name,
      type: '出库',
      quantity,
      operator,
      date: formatDateTime(now),
      remark
    };
    set({ stockRecords: [record, ...get().stockRecords] });

    get().persist();
  },

  setSelectedProducts: (products) => set({ selectedProducts: products }),
  addSelectedProduct: (product) => {
    const exists = get().selectedProducts.find(p => p.id === product.id);
    if (!exists) {
      set({ selectedProducts: [...get().selectedProducts, product] });
    }
    get().persist();
  },
  removeSelectedProduct: (productId) => {
    set({ selectedProducts: get().selectedProducts.filter(p => p.id !== productId) });
    get().persist();
  },
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setSizeRecord: (size) => {
    set({ sizeRecord: { ...get().sizeRecord, ...size } });
    get().persist();
  },
  setSelectedMaterialIds: (ids) => {
    set({ selectedMaterialIds: ids });
    get().persist();
  },
  toggleMaterialId: (id) => {
    const ids = get().selectedMaterialIds;
    if (ids.includes(id)) {
      set({ selectedMaterialIds: ids.filter(i => i !== id) });
    } else {
      set({ selectedMaterialIds: [...ids, id] });
    }
    get().persist();
  }
}));
