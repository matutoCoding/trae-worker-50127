import React from 'react';
import { View, Text } from '@tarojs/components';
import { Order } from '@/types';
import { formatPrice, formatDate, getStatusColor, getStatusBgColor } from '@/utils';
import styles from './index.module.scss';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <Text className={styles.orderNo}>订单号：{order.orderNo}</Text>
        <View className={styles.statusWrap}>
          {order.isUrgent && <Text className={styles.urgentTag}>急单</Text>}
          <Text
            className={styles.status}
            style={{
              color: getStatusColor(order.status),
              background: getStatusBgColor(order.status)
            }}
          >
            {order.status}
          </Text>
        </View>
      </View>

      <View className={styles.customer}>
        <View className={styles.customerInfo}>
          <Text className={styles.customerName}>{order.customerName}</Text>
          <Text className={styles.customerPhone}>{order.customerPhone}</Text>
          {order.funeralHome && (
            <View className={styles.funeralHome}>
              <Text>殡仪馆直送：{order.funeralHome}</Text>
            </View>
          )}
        </View>
      </View>

      <Text className={styles.address}>{order.address}</Text>

      <View className={styles.items}>
        {order.items.map((item, idx) => (
          <View key={idx} className={styles.item}>
            <Text className={styles.itemName}>{item.productName}</Text>
            {(item.size || item.material) && (
              <Text className={styles.itemSpec}>
                {item.size ? item.size : ''}{item.size && item.material ? ' / ' : ''}{item.material ? item.material : ''}
              </Text>
            )}
            <Text className={styles.itemPrice}>{formatPrice(item.price)} x{item.quantity}</Text>
          </View>
        ))}
      </View>

      {order.taboos && (
        <View style={{ marginBottom: '24rpx' }}>
          <Text style={{ fontSize: '24rpx', color: '#A33D3D' }}>
            避讳提示：{order.taboos}
          </Text>
        </View>
      )}

      <View className={styles.footer}>
        <Text className={styles.time}>{formatDate(order.createTime)}</Text>
        <View className={styles.totalWrap}>
          <Text className={styles.totalLabel}>合计</Text>
          <Text className={styles.total}>{formatPrice(order.totalAmount)}</Text>
        </View>
      </View>
    </View>
  );
};

export default OrderCard;
