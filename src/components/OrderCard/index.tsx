import React from 'react';
import { View, Text } from '@tarojs/components';
import { Order } from '@/types';
import { formatPrice, formatDate, formatDateTime, getStatusColor, getStatusBgColor } from '@/utils';
import styles from './index.module.scss';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const finalAmount = order.totalAmount + (order.deliveryFee || 0);
  const isCompleted = order.status === '已完成';

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.orderNo}>订单号：{order.orderNo}</Text>
          <Text className={styles.orderTypeTag}>{order.orderType}单</Text>
        </View>
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

      {isCompleted && (
        <View className={styles.completeInfo}>
          {order.deliverCompleteTime && (
            <View className={styles.completeInfoRow}>
              <Text className={styles.completeInfoLabel}>完成时间</Text>
              <Text className={styles.completeInfoValue}>{order.deliverCompleteTime}</Text>
            </View>
          )}
          {order.deliveryFee && order.deliveryFee > 0 && (
            <View className={styles.completeInfoRow}>
              <Text className={styles.completeInfoLabel}>配送服务费</Text>
              <Text className={styles.completeInfoValue} style={{ color: '#4A6B8A', fontWeight: 600 }}>
                +{formatPrice(order.deliveryFee)}
              </Text>
            </View>
          )}
          {order.signRemark && (
            <View className={styles.completeInfoRow}>
              <Text className={styles.completeInfoLabel}>签收备注</Text>
              <Text className={styles.completeInfoValue}>{order.signRemark}</Text>
            </View>
          )}
        </View>
      )}

      <View className={styles.footer}>
        <Text className={styles.time}>
          {isCompleted && order.deliverCompleteTime
            ? `完成：${formatDate(order.deliverCompleteTime)}`
            : `下单：${formatDate(order.createTime)}`
          }
        </Text>
        <View className={styles.totalWrap}>
          <Text className={styles.totalLabel}>
            {isCompleted ? '总计' : '合计'}
            {order.isUrgent && <Text className={styles.amountTag}>含加急费</Text>}
            {isCompleted && order.deliveryFee && order.deliveryFee > 0 && (
              <Text className={styles.amountTagDelivery}>含配送费</Text>
            )}
          </Text>
          <Text className={styles.total}>{formatPrice(finalAmount)}</Text>
        </View>
      </View>
    </View>
  );
};

export default OrderCard;
