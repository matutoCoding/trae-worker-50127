export interface Product {
  id: string;
  name: string;
  category: '寿衣' | '寿材' | '配饰' | '套装';
  subCategory: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  traditionalIntro: string;
  materials: string[];
  sizes: string[];
  stock: number;
  isHot?: boolean;
  isNew?: boolean;
  tags: string[];
}

export interface Material {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  features: string[];
  image: string;
  stock: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  material?: string;
  specs?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  address: string;
  funeralHome?: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  status: '待确认' | '定制中' | '待配送' | '配送中' | '已完成' | '已取消' | '退换中';
  isUrgent: boolean;
  urgentFee?: number;
  deliveryFee?: number;
  materialPrice?: number;
  customServiceFee?: number;
  createTime: string;
  deliveryTime?: string;
  deliverCompleteTime?: string;
  signRemark?: string;
  remark?: string;
  taboos?: string;
  sizeInfo?: Partial<SizeRecord>;
  materialNames?: string[];
  suitName?: string;
  returnInfo?: {
    type: '退货' | '换货' | null;
    reason: string;
    handleTime?: string;
    refundAmount?: number;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  minStock: number;
  unit: string;
  location: string;
  lastUpdate: string;
  status: '正常' | '预警' | '缺货';
  recentIn: number;
  recentOut: number;
}

export interface BillRecord {
  id: string;
  date: string;
  type: '收入' | '支出';
  category: string;
  amount: number;
  orderNo?: string;
  remark?: string;
}

export interface SizeRecord {
  gender: '男' | '女';
  height: number;
  weight: number;
  shoulder: number;
  chest: number;
  waist: number;
  hip: number;
  sleeve: number;
  pants: number;
  shoeSize: number;
}

export interface StatItem {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;
}

export interface CustomItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedMaterial?: string;
  addedAt: string;
}

export interface StockRecord {
  id: string;
  itemId: string;
  itemName: string;
  type: '入库' | '出库';
  quantity: number;
  operator: string;
  date: string;
  remark?: string;
}
