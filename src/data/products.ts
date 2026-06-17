import { Product } from '@/types';

export const products: Product[] = [
  {
    id: 'p001',
    name: '福寿双全男款寿衣套装',
    category: '套装',
    subCategory: '男士套装',
    price: 2880,
    originalPrice: 3600,
    image: 'https://picsum.photos/id/103/600/600',
    description: '精选真丝面料，手工刺绣福寿纹样，七件套传统制式，庄重典雅。',
    traditionalIntro: '传统寿衣讲究"五领三腰"，取"五福临门，三星高照"之意。此款严格遵循古制，内外七层，寓意圆满。',
    materials: ['真丝织锦', '丝绸内衬', '棉花填充物'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '定制'],
    stock: 12,
    isHot: true,
    tags: ['热销', '传统制式', '七件套']
  },
  {
    id: 'p002',
    name: '凤穿牡丹女款寿衣套装',
    category: '套装',
    subCategory: '女士套装',
    price: 2680,
    originalPrice: 3200,
    image: 'https://picsum.photos/id/225/600/600',
    description: '苏绣凤穿牡丹纹样，真丝缎面，色彩典雅端庄，尽显大家风范。',
    traditionalIntro: '女款寿衣以凤纹、牡丹为主要纹样，象征高贵典雅。此款采用传统手工盘扣，侧开襟设计。',
    materials: ['真丝缎面', '手工苏绣', '丝绸衬里'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '定制'],
    stock: 8,
    isHot: true,
    tags: ['热销', '苏绣工艺', '女士首选']
  },
  {
    id: 'p003',
    name: '金丝楠木寿材',
    category: '寿材',
    subCategory: '实木棺材',
    price: 18800,
    originalPrice: 22000,
    image: 'https://picsum.photos/id/230/600/600',
    description: '百年金丝楠木，香气清幽，纹理华美，防潮防腐，传统榫卯结构。',
    traditionalIntro: '金丝楠木为寿材上品，古时为皇家御用。其木性稳定，千年不腐，寓意后代子孙兴旺。',
    materials: ['金丝楠木', '传统大漆', '桐油内衬'],
    sizes: ['标准', '加大', '定制'],
    stock: 3,
    isHot: true,
    tags: ['高端', '百年老料', '榫卯结构']
  },
  {
    id: 'p004',
    name: '柏木福寿寿材',
    category: '寿材',
    subCategory: '实木棺材',
    price: 8800,
    originalPrice: 10800,
    image: 'https://picsum.photos/id/582/600/600',
    description: '精选太行柏木，芳香辟秽，木质坚硬，传统工艺制作。',
    traditionalIntro: '柏木香可辟邪，木质坚硬耐腐，是民间广泛使用的寿材良材，寓意"柏岁长青"。',
    materials: ['太行柏木', '天然大漆', '棉质内衬'],
    sizes: ['标准', '加大', '定制'],
    stock: 6,
    tags: ['经典款', '性价比高']
  },
  {
    id: 'p005',
    name: '云锦唐装寿衣',
    category: '寿衣',
    subCategory: '上装',
    price: 1280,
    image: 'https://picsum.photos/id/220/600/600',
    description: '南京云锦面料，传统唐装款式，云纹图案，庄重大气。',
    traditionalIntro: '云锦为中国三大名锦之首，有"寸锦寸金"之称。云纹寓意"平步青云"。',
    materials: ['南京云锦', '真丝衬里'],
    sizes: ['M', 'L', 'XL', 'XXL', '定制'],
    stock: 15,
    isNew: true,
    tags: ['新品', '云锦面料']
  },
  {
    id: 'p006',
    name: '真丝绣裙寿裤',
    category: '寿衣',
    subCategory: '下装',
    price: 680,
    image: 'https://picsum.photos/id/250/600/600',
    description: '真丝面料，手工绣花边，传统裙裤形制，穿着舒适。',
    traditionalIntro: '传统寿裤讲究宽腰大裆，绣花边装饰，寓意"一路荣华"。',
    materials: ['真丝乔其', '手工刺绣'],
    sizes: ['M', 'L', 'XL', 'XXL', '定制'],
    stock: 20,
    tags: ['传统工艺']
  },
  {
    id: 'p007',
    name: '五福捧寿寿被',
    category: '配饰',
    subCategory: '被褥',
    price: 480,
    image: 'https://picsum.photos/id/598/600/600',
    description: '纯棉面料，五福捧寿纹样，柔软舒适，寓意吉祥。',
    traditionalIntro: '寿被绣有五福捧寿图案，寓意"五福临门，寿比南山"。',
    materials: ['纯棉贡缎', '棉花填充', '电脑绣花'],
    sizes: ['标准', '加大'],
    stock: 30,
    tags: ['传统纹样', '纯棉材质']
  },
  {
    id: 'p008',
    name: '铺金盖银寿褥套装',
    category: '配饰',
    subCategory: '被褥',
    price: 880,
    originalPrice: 1080,
    image: 'https://picsum.photos/id/1036/600/600',
    description: '金色褥子、银色盖被，传统"铺金盖银"制式，寓意后代富足。',
    traditionalIntro: '铺金盖银是传统丧葬重要习俗，寓意逝者在另一个世界富足安康，福佑子孙。',
    materials: ['织锦缎', '仿金银线', '棉花填充'],
    sizes: ['标准', '加大'],
    stock: 18,
    isHot: true,
    tags: ['热销', '传统制式']
  },
  {
    id: 'p009',
    name: '寿帽寿鞋全套配饰',
    category: '配饰',
    subCategory: '鞋帽',
    price: 360,
    image: 'https://picsum.photos/id/292/600/600',
    description: '包含寿帽、寿鞋、袜套，传统制式，做工精细。',
    traditionalIntro: '寿帽多为黑色员外帽或凤冠，寿鞋为布鞋绣莲花，寓意"脚踏莲花往西天"。',
    materials: ['呢料', '纯棉', '手工纳底'],
    sizes: ['38', '40', '42', '44', '定制'],
    stock: 25,
    tags: ['全套配饰']
  },
  {
    id: 'p010',
    name: '现代简约寿衣套装',
    category: '套装',
    subCategory: '现代款',
    price: 1880,
    image: 'https://picsum.photos/id/119/600/600',
    description: '西式西装款式，现代简约设计，适合思想开明的家庭。',
    traditionalIntro: '现代款寿衣顺应时代变化，以西式正装为蓝本，保留庄重感的同时更符合现代审美。',
    materials: ['羊毛混纺', '缎面衬里'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '定制'],
    stock: 10,
    isNew: true,
    tags: ['新品', '现代款', '西装款式']
  },
  {
    id: 'p011',
    name: '骨灰盒-黑檀木雕花',
    category: '寿材',
    subCategory: '骨灰盒',
    price: 3680,
    originalPrice: 4200,
    image: 'https://picsum.photos/id/787/600/600',
    description: '非洲黑檀木，精雕龙凤呈祥图案，工艺精湛。',
    traditionalIntro: '黑檀木质地坚硬，纹理细腻，有"木中君子"之称，雕刻龙凤寓意吉祥。',
    materials: ['非洲黑檀木', '传统大漆', '绒布内衬'],
    sizes: ['标准'],
    stock: 5,
    tags: ['高端', '精雕工艺']
  },
  {
    id: 'p012',
    name: '骨灰盒-汉白玉素面',
    category: '寿材',
    subCategory: '骨灰盒',
    price: 1680,
    image: 'https://picsum.photos/id/1082/600/600',
    description: '天然汉白玉，素面典雅，质地温润，永不变色。',
    traditionalIntro: '玉在中国传统文化中象征君子之德，"君子无故玉不去身"，以玉为盒寓意高洁。',
    materials: ['天然汉白玉', '丝绒内衬'],
    sizes: ['标准'],
    stock: 8,
    tags: ['素雅', '天然石材']
  }
];

export const categories = ['全部', '套装', '寿衣', '寿材', '配饰'];

export const taboosList = [
  {
    title: '寿衣件数避讳',
    content: '寿衣件数讲究"穿单不穿双"，一般为五、七、九件，取奇数避偶数。民间认为偶数寓意"重丧"，不吉。'
  },
  {
    title: '材质选择避讳',
    content: '寿衣忌用缎子面料，因"缎子"谐音"断子"，恐断了后代香火。多用绸子，谐音"稠子"，寓意多子多孙。'
  },
  {
    title: '颜色避讳',
    content: '寿衣颜色以蓝、棕、咖、红为主，忌用黑色和纯白。红色寿衣用于高寿老人"喜丧"，寓意儿孙有福。'
  },
  {
    title: '纽扣避讳',
    content: '寿衣不用纽扣，只用带子系结。"带子"谐音"带儿"，寓意后继有人。纽扣被认为会"扣住"子孙福气。'
  },
  {
    title: '皮毛避讳',
    content: '寿衣忌用兽皮、皮毛制作。传统认为穿兽皮来世会投胎为兽类，对子孙后代不利。'
  }
];
