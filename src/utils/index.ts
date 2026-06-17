export const formatPrice = (price: number): string => {
  return `¥${price.toLocaleString('zh-CN')}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return dateStr.split(' ')[0];
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '';
  return dateStr;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '待确认': '#C48200',
    '定制中': '#4A6B8A',
    '待配送': '#7A6654',
    '配送中': '#165DFF',
    '已完成': '#3D7A3D',
    '退换中': '#A33D3D',
    '已取消': '#8A7A6A',
    '正常': '#3D7A3D',
    '预警': '#C48200',
    '缺货': '#A33D3D'
  };
  return colorMap[status] || '#4A3728';
};

export const getStatusBgColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    '待确认': '#FFF5E5',
    '定制中': '#E8F0F8',
    '待配送': '#F5EEE0',
    '配送中': '#E8F0FF',
    '已完成': '#E8F5E8',
    '退换中': '#F8E8E8',
    '已取消': '#F0EAE0',
    '正常': '#E8F5E8',
    '预警': '#FFF5E5',
    '缺货': '#F8E8E8'
  };
  return colorMap[status] || '#F5EEE0';
};
