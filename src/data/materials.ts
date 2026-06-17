import { Material } from '@/types';

export const materials: Material[] = [
  {
    id: 'm001',
    name: '真丝织锦',
    category: '面料',
    price: 380,
    unit: '米',
    description: '桑蚕丝织就，手感柔滑，光泽华美，是高端寿衣首选面料。',
    features: ['天然桑蚕丝', '光泽华美', '透气亲肤', '传统工艺'],
    image: 'https://picsum.photos/id/225/600/400',
    stock: 86
  },
  {
    id: 'm002',
    name: '南京云锦',
    category: '面料',
    price: 680,
    unit: '米',
    description: '中国三大名锦之首，寸锦寸金，皇家御用贡品级别面料。',
    features: ['国家级非遗', '手工织造', '金线装饰', '收藏价值'],
    image: 'https://picsum.photos/id/230/600/400',
    stock: 32
  },
  {
    id: 'm003',
    name: '真丝缎面',
    category: '面料',
    price: 260,
    unit: '米',
    description: '光泽感强，垂坠感好，适合做寿衣外衣，庄重大气。',
    features: ['真丝材质', '光泽莹润', '垂坠感好', '易打理'],
    image: 'https://picsum.photos/id/220/600/400',
    stock: 128
  },
  {
    id: 'm004',
    name: '纯棉贡缎',
    category: '面料',
    price: 120,
    unit: '米',
    description: '纯棉材质，缎纹织法，手感柔软，适合贴身穿着。',
    features: ['100%纯棉', '亲肤透气', '柔软舒适', '性价比高'],
    image: 'https://picsum.photos/id/103/600/400',
    stock: 256
  },
  {
    id: 'm005',
    name: '织锦缎',
    category: '面料',
    price: 180,
    unit: '米',
    description: '传统提花织物，花纹繁复精美，是寿衣常用经典面料。',
    features: ['传统提花', '花纹精美', '色泽艳丽', '经济实惠'],
    image: 'https://picsum.photos/id/250/600/400',
    stock: 168
  },
  {
    id: 'm006',
    name: '金丝楠木',
    category: '木材',
    price: 18000,
    unit: '立方',
    description: '百年老料，香气清幽，纹理华美，防潮防腐，寿材极品。',
    features: ['百年老料', '天然芳香', '千年不腐', '皇家御用'],
    image: 'https://picsum.photos/id/582/600/400',
    stock: 2
  },
  {
    id: 'm007',
    name: '太行柏木',
    category: '木材',
    price: 6800,
    unit: '立方',
    description: '太行山崖柏，芳香辟秽，木质坚硬，性价比高。',
    features: ['芳香辟秽', '木质坚硬', '性价比高', '产量丰富'],
    image: 'https://picsum.photos/id/598/600/400',
    stock: 8
  },
  {
    id: 'm008',
    name: '非洲黑檀木',
    category: '木材',
    price: 12000,
    unit: '立方',
    description: '质地坚硬如铁，纹理细腻乌黑，高档骨灰盒首选材料。',
    features: ['质地坚硬', '纹理细腻', '不变形不开裂', '高端尊贵'],
    image: 'https://picsum.photos/id/787/600/400',
    stock: 5
  },
  {
    id: 'm009',
    name: '天然汉白玉',
    category: '石材',
    price: 3800,
    unit: '立方',
    description: '质地温润洁白，永不变色，骨灰盒和墓碑常用石材。',
    features: ['天然石材', '温润洁白', '永不褪色', '象征高洁'],
    image: 'https://picsum.photos/id/1082/600/400',
    stock: 6
  },
  {
    id: 'm010',
    name: '新疆棉花',
    category: '填充物',
    price: 85,
    unit: '斤',
    description: '优质长绒棉，蓬松保暖，手感柔软，传统寿衣首选填充。',
    features: ['长绒棉', '蓬松保暖', '天然无害', '传统工艺'],
    image: 'https://picsum.photos/id/106/600/400',
    stock: 500
  }
];

export const materialCategories = ['全部', '面料', '木材', '石材', '填充物'];
