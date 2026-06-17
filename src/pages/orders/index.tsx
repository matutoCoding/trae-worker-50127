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
  const handleReturn = useAppStore(state => state.handleReturn);
  const updateOrderStatus = useAppStore(state => state.updateOrderStatus);

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

  const handleOrderClick = (order: Order) => {
    if (order.status === '退换中') {
      Taro.showActionSheet({
        itemList: ['退货处理', '换货处理', '处理完成', '查看详情'],
        success: (res) => {
          if (res.tapIndex === 0) {
            Taro.showModal({
              title: '退货处理',
              content: '确定将此订单标记为退货处理？请输入退货原因（选填）',
              editable: true,
              placeholderText: '退货原因',
              success: (r) => {
                if (r.confirm) {
                  handleReturn({
                    orderId: order.id,
                    action: '退货',
                    reason: r.content || undefined
                  });
                  Taro.showToast({ title: '已标记为退货', icon: 'success' });
                }
              }
            });
          } else if (res.tapIndex === 1) {
            Taro.showModal({
              title: '换货处理',
              content: '确定将此订单标记为换货处理？请输入换货原因（选填）',
              editable: true,
              placeholderText: '换货原因',
              success: (r) => {
                if (r.confirm) {
                  handleReturn({
                    orderId: order.id,
                    action: '换货',
                    reason: r.content || undefined
                  });
                  Taro.showToast({ title: '已标记为换货', icon: 'success' });
                }
              }
            });
          } else if (res.tapIndex === 2) {
            if (order.returnInfo?.type === '退货') {
              Taro.showModal({
                title: '确认退货完成',
                content: `退款金额 ¥${(order.returnInfo?.refundAmount ?? order.paidAmount).toLocaleString()}，确定完成退货？`,
                success: (r) => {
                  if (r.confirm) {
                    handleReturn({
                      orderId: order.id,
                      action: '完成'
                    });
                    Taro.showToast({ title: '退货已完成', icon: 'success' });
                  }
                }
              });
            } else if (order.returnInfo?.type === '换货') {
              Taro.showModal({
                title: '确认换货完成',
                content: '确定换货已完成，订单转定制中？',
                success: (r) => {
                  if (r.confirm) {
                    handleReturn({
                      orderId: order.id,
                      action: '完成'
                    });
                    Taro.showToast({ title: '换货已完成', icon: 'success' });
                  }
                }
              });
            } else {
              Taro.showToast({ title: '请先选择退货或换货', icon: 'none' });
            }
          } else {
            showOrderDetail(order);
          }
        }
      });
    } else if (order.status === '待确认') {
      Taro.showActionSheet({
        itemList: ['确认订单', '取消订单', '查看详情'],
        success: (res) => {
          if (res.tapIndex === 0) {
            updateOrderStatus(order.id, '定制中');
            Taro.showToast({ title: '订单已确认', icon: 'success' });
          } else if (res.tapIndex === 1) {
            Taro.showModal({
              title: '取消订单',
              content: '确定取消此订单？',
              success: (r) => {
                if (r.confirm) {
                  updateOrderStatus(order.id, '已取消');
                  Taro.showToast({ title: '订单已取消', icon: 'success' });
                }
              }
            });
          } else {
            showOrderDetail(order);
          }
        }
      });
    } else if (order.status === '定制中') {
      Taro.showActionSheet({
        itemList: ['标记待配送', '查看详情'],
        success: (res) => {
          if (res.tapIndex === 0) {
            updateOrderStatus(order.id, '待配送');
            Taro.showToast({ title: '已标记待配送', icon: 'success' });
          } else {
            showOrderDetail(order);
          }
        }
      });
    } else if (order.status === '配送中') {
      Taro.showActionSheet({
        itemList: ['标记已完成', '查看详情'],
        success: (res) => {
          if (res.tapIndex === 0) {
            updateOrderStatus(order.id, '已完成');
            Taro.showToast({ title: '订单已完成', icon: 'success' });
          } else {
            showOrderDetail(order);
          }
        }
      });
    } else {
      showOrderDetail(order);
    }
  };

  const showOrderDetail = (order: Order) => {
    let content = `客户：${order.customerName}\n电话：${order.customerPhone}\n地址：${order.address}\n`;
    content += `状态：${order.status}\n金额：¥${order.totalAmount.toLocaleString()}`;
    if (order.isUrgent) content += '\n⚡ 加急订单';
    if (order.funeralHome) content += `\n殡仪馆：${order.funeralHome}`;
    if (order.sizeInfo) {
      const s = order.sizeInfo;
      content += `\n尺寸：${s.gender || ''} ${s.height ? s.height + 'cm' : ''} ${s.weight ? s.weight + 'kg' : ''}`;
    }
    if (order.materialNames?.length) content += `\n材质：${order.materialNames.join('、')}`;
    if (order.taboos) content += `\n避讳：${order.taboos}`;
    if (order.returnInfo) {
      content += `\n退换：${order.returnInfo.type} - ${order.returnInfo.reason}`;
    }
    Taro.showModal({
      title: order.orderNo,
      content,
      showCancel: false
    });
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
