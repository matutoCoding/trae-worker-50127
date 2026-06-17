import { Order } from '@/types';

export const orders: Order[] = [
  {
    id: 'o001',
    orderNo: 'FS202606170001',
    customerName: '张先生',
    customerPhone: '138****8888',
    address: '北京市朝阳区某某街道某某小区3号楼',
    funeralHome: '八宝山殡仪馆',
    items: [
      { productId: 'p001', productName: '福寿双全男款寿衣套装', price: 2880, quantity: 1, size: 'XL', material: '真丝织锦' },
      { productId: 'p008', productName: '铺金盖银寿褥套装', price: 880, quantity: 1, size: '标准' }
    ],
    totalAmount: 3760,
    paidAmount: 3760,
    status: '配送中',
    isUrgent: true,
    createTime: '2026-06-17 08:30:00',
    deliveryTime: '2026-06-17 14:00:00',
    remark: '急单，请尽快配送至八宝山殡仪馆',
    taboos: '忌用缎子面料，不用纽扣'
  },
  {
    id: 'o002',
    orderNo: 'FS202606170002',
    customerName: '李女士',
    customerPhone: '139****6666',
    address: '北京市海淀区某某路某某号',
    funeralHome: '东郊殡仪馆',
    items: [
      { productId: 'p002', productName: '凤穿牡丹女款寿衣套装', price: 2680, quantity: 1, size: 'L', material: '真丝缎面' },
      { productId: 'p007', productName: '五福捧寿寿被', price: 480, quantity: 1, size: '加大' },
      { productId: 'p009', productName: '寿帽寿鞋全套配饰', price: 360, quantity: 1, size: '38' }
    ],
    totalAmount: 3520,
    paidAmount: 2000,
    status: '定制中',
    isUrgent: false,
    createTime: '2026-06-16 16:20:00',
    remark: '身高160cm，体重55kg，需要量身微调',
    taboos: '忌黑色，偏好蓝色系'
  },
  {
    id: 'o003',
    orderNo: 'FS202606160005',
    customerName: '王先生',
    customerPhone: '136****5555',
    address: '北京市丰台区某某街道',
    items: [
      { productId: 'p003', productName: '金丝楠木寿材', price: 18800, quantity: 1, size: '标准', material: '金丝楠木' }
    ],
    totalAmount: 18800,
    paidAmount: 18800,
    status: '待配送',
    isUrgent: true,
    createTime: '2026-06-16 10:15:00',
    deliveryTime: '2026-06-18 09:00:00',
    remark: '18号上午9点前必须送达'
  },
  {
    id: 'o004',
    orderNo: 'FS202606150012',
    customerName: '赵女士',
    customerPhone: '137****2222',
    address: '北京市西城区某某胡同',
    items: [
      { productId: 'p010', productName: '现代简约寿衣套装', price: 1880, quantity: 1, size: 'L' },
      { productId: 'p011', productName: '骨灰盒-黑檀木雕花', price: 3680, quantity: 1 }
    ],
    totalAmount: 5560,
    paidAmount: 5560,
    status: '已完成',
    isUrgent: false,
    createTime: '2026-06-15 14:30:00',
    deliveryTime: '2026-06-16 10:00:00'
  },
  {
    id: 'o005',
    orderNo: 'FS202606140008',
    customerName: '孙先生',
    customerPhone: '135****1111',
    address: '北京市东城区某某大街',
    items: [
      { productId: 'p004', productName: '柏木福寿寿材', price: 8800, quantity: 1, size: '加大' },
      { productId: 'p005', productName: '云锦唐装寿衣', price: 1280, quantity: 1, size: 'XXL' }
    ],
    totalAmount: 10080,
    paidAmount: 5000,
    status: '退换中',
    isUrgent: false,
    createTime: '2026-06-14 11:20:00',
    remark: '尺寸偏大，需要换货',
    taboos: ''
  },
  {
    id: 'o006',
    orderNo: 'FS202606130020',
    customerName: '周女士',
    customerPhone: '133****7777',
    address: '北京市通州区某某镇',
    items: [
      { productId: 'p006', productName: '真丝绣裙寿裤', price: 680, quantity: 1, size: 'XL' }
    ],
    totalAmount: 680,
    paidAmount: 680,
    status: '已取消',
    isUrgent: false,
    createTime: '2026-06-13 09:45:00',
    remark: '客户主动取消'
  }
];

export const orderStatusList = ['全部', '待确认', '定制中', '待配送', '配送中', '已完成', '退换中', '已取消'];
