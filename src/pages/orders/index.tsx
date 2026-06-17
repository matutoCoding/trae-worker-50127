import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { orderStatusList } from '@/data/orders';
import OrderCard from '@/components/OrderCard';
import { useAppStore } from '@/store';
import { Order } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

const OrdersPage: React.FC = () => {
  const [activeStatus, setActiveStatus] = useState('全部');
  const orders = useAppStore(state => state.orders);

  const filteredOrders = useMemo(() => {
    if (activeStatus === '全部') return orders;
    return orders.filter(o => o.status === activeStatus);
  }, [activeStatus, orders]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      urgent: orders.filter(o => o.isUrgent).length,
      pending: orders.filter(o => ['待确认', '定制中', '待配送'].includes(o.status)).length,
      delivering: orders.filter(o => o.status === '配送中').length
    };
  }, [orders]);

  const goExpress = () => {
    Taro.navigateTo({ url: '/pages/express/index' });
  };

  const goCreate = () => {
    Taro.switchTab({ url: '/pages/custom/index' });
  };

  const goStockRecords = () => {
    Taro.navigateTo({ url: '/pages/stock-records/index' });
  };

  const handleOrderClick = (order: Order) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.pageTitle}>订单管理</Text>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.total}</Text>
            <Text className={styles.statLabel}>全部订单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.urgent}</Text>
            <Text className={styles.statLabel}>急单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待处理</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.delivering}</Text>
            <Text className={styles.statLabel}>配送中</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <ScrollView className={styles.statusScroll} scrollX enhanced showScrollbar={false}>
          <View className={styles.statusList}>
            {orderStatusList.map(status => (
              <View
                key={status}
                className={classnames(styles.statusItem, activeStatus === status && styles.statusActive)}
                onClick={() => setActiveStatus(status)}
              >
                {status}
              </View>
            ))}
          </View>
        </ScrollView>
        <View className={styles.actionRow}>
          <View className={styles.actionBtn} onClick={goExpress}>
            急单配送
          </View>
          <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={goCreate}>
            新建订单
          </View>
        </View>
      </View>

      <View className={styles.orderList}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => handleOrderClick(order)}
            />
          ))
        ) : (
          <View className={styles.emptyOrder}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无相关订单</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default OrdersPage;
