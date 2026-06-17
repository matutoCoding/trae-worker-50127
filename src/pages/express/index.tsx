import React, { useMemo, useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { formatPrice, formatDateTime } from '@/utils';
import { Order } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

const ExpressPage: React.FC = () => {
  const orders = useAppStore(state => state.orders);
  const startDelivery = useAppStore(state => state.startDelivery);
  const completeDelivery = useAppStore(state => state.completeDelivery);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [signRemark, setSignRemark] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');

  const urgentOrders = useMemo(() => {
    return orders.filter(o => o.isUrgent && ['待配送', '配送中', '定制中'].includes(o.status));
  }, [orders]);

  const handleCall = (phone: string) => {
    Taro.showToast({ title: '拨打：' + phone, icon: 'none' });
  };

  const handleDeliver = (orderId: string, orderNo: string) => {
    Taro.showModal({
      title: '确认配送',
      content: `确认订单 ${orderNo} 已安排配送？`,
      success: (res) => {
        if (res.confirm) {
          startDelivery(orderId);
          Taro.showToast({ title: '已安排配送', icon: 'success' });
        }
      }
    });
  };

  const handleOpenComplete = (order: Order) => {
    setCurrentOrder(order);
    setSignRemark('');
    setDeliveryFee('0');
    setShowCompleteModal(true);
  };

  const handleCompleteDelivery = () => {
    if (!currentOrder) return;
    const fee = parseFloat(deliveryFee) || 0;
    completeDelivery({
      orderId: currentOrder.id,
      signRemark: signRemark.trim() || undefined,
      deliveryFee: fee
    });
    setShowCompleteModal(false);
    Taro.showToast({ title: '配送已完成', icon: 'success' });
  };

  const handleNavigate = (address: string) => {
    Taro.showToast({ title: '导航到：' + address, icon: 'none' });
  };

  const pendingCount = urgentOrders.filter(o => o.status !== '配送中').length;
  const deliveringCount = urgentOrders.filter(o => o.status === '配送中').length;
  const funeralCount = urgentOrders.filter(o => o.funeralHome).length;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>🚨 急单配送中心</Text>
        <Text className={styles.headerDesc}>优先处理加急订单，确保按时送达殡仪馆</Text>
      </View>

      <View className={styles.statBar}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{pendingCount}</Text>
          <Text className={styles.statLabel}>待处理急单</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{deliveringCount}</Text>
          <Text className={styles.statLabel}>配送中</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{funeralCount}</Text>
          <Text className={styles.statLabel}>殡仪馆直送</Text>
        </View>
      </View>

      <View className={styles.orderList}>
        {urgentOrders.length > 0 ? (
          urgentOrders.map(order => (
            <View key={order.id} className={styles.orderCard}>
              <Text className={styles.urgentBadge}>⚡ 急单</Text>
              <View className={styles.orderHeader}>
                <Text className={styles.orderNo}>{order.orderNo}</Text>
                <Text className={styles.orderStatus}>{order.status}</Text>
              </View>

              <View className={styles.customerRow}>
                <View className={styles.customerInfo}>
                  <Text className={styles.customerName}>{order.customerName}</Text>
                  <Text className={styles.customerPhone}>{order.customerPhone}</Text>
                </View>
                <View className={styles.callBtn} onClick={() => handleCall(order.customerPhone)}>
                  📞
                </View>
              </View>

              {order.funeralHome && (
                <View className={styles.addressCard}>
                  <View className={styles.funeralHome}>
                    <Text>🏛️</Text>
                    <Text>殡仪馆直送：{order.funeralHome}</Text>
                  </View>
                  <Text className={styles.detailAddress}>{order.address}</Text>
                </View>
              )}

              {order.deliveryTime && (
                <View className={styles.timeCard}>
                  <Text className={styles.timeLabel}>要求送达时间</Text>
                  <Text className={styles.timeValue}>⏰ {formatDateTime(order.deliveryTime)}</Text>
                </View>
              )}

              <View className={styles.items}>
                {order.items.map((item, idx) => (
                  <View key={idx} className={styles.item}>
                    <Text className={styles.itemName}>{item.productName}</Text>
                    <Text className={styles.itemPrice}>{formatPrice(item.price)} x{item.quantity}</Text>
                  </View>
                ))}
              </View>

              {order.sizeInfo && (
                <View style={{ marginBottom: '16rpx' }}>
                  <Text style={{ fontSize: '24rpx', color: '#4A3728' }}>
                    📐 尺寸：{order.sizeInfo.gender || ''}
                    {order.sizeInfo.height ? ` ${order.sizeInfo.height}cm` : ''}
                    {order.sizeInfo.weight ? ` ${order.sizeInfo.weight}kg` : ''}
                  </Text>
                </View>
              )}

              {order.materialNames?.length > 0 && (
                <View style={{ marginBottom: '16rpx' }}>
                  <Text style={{ fontSize: '24rpx', color: '#4A3728' }}>
                    🧵 材质：{order.materialNames.join('、')}
                  </Text>
                </View>
              )}

              {order.remark && (
                <View style={{ marginBottom: '24rpx' }}>
                  <Text style={{ fontSize: '24rpx', color: '#A33D3D' }}>
                    备注：{order.remark}
                  </Text>
                </View>
              )}

              <View className={styles.actionRow}>
                <View className={styles.actionBtn} onClick={() => handleNavigate(order.address)}>
                  📍 导航
                </View>
                {order.status === '配送中' ? (
                  <View
                    className={classnames(styles.actionBtn, styles.completeBtn)}
                    onClick={() => handleOpenComplete(order)}
                  >
                    配送完成
                  </View>
                ) : order.status === '定制中' ? (
                  <View className={classnames(styles.actionBtn, styles.deliveredBtn)}>
                    定制中
                  </View>
                ) : (
                  <View
                    className={classnames(styles.actionBtn, styles.primaryBtn)}
                    onClick={() => handleDeliver(order.id, order.orderNo)}
                  >
                    立即配送
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={{ padding: '80rpx 0', textAlign: 'center' }}>
            <Text style={{ fontSize: '60rpx', display: 'block', marginBottom: '24rpx', opacity: 0.3 }}>✅</Text>
            <Text style={{ fontSize: '28rpx', color: '#8A7A6A' }}>暂无急单，一切顺利</Text>
          </View>
        )}
      </View>

      {showCompleteModal && currentOrder && (
        <View className={styles.modalMask}>
          <View className={styles.modalContent}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>配送完成 - {currentOrder.orderNo}</Text>
              <Text className={styles.modalClose} onClick={() => setShowCompleteModal(false)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>签收备注</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder='请输入签收情况说明，如本人签收、家属代签等'
                  value={signRemark}
                  onInput={(e) => setSignRemark(e.detail.value)}
                />
              </View>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>配送服务费（元）</Text>
                <Input
                  className={styles.formInput}
                  type='digit'
                  placeholder='请输入配送服务费，没有则填0'
                  value={deliveryFee}
                  onInput={(e) => setDeliveryFee(e.detail.value)}
                />
              </View>
            </View>
            <View className={styles.modalFooter}>
              <View className={styles.cancelBtn} onClick={() => setShowCompleteModal(false)}>
                取消
              </View>
              <View className={styles.confirmBtn} onClick={handleCompleteDelivery}>
                确认完成
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ExpressPage;
