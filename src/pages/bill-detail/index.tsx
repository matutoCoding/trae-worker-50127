import React, { useState, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { formatPrice } from '@/utils';
import classnames from 'classnames';
import styles from './index.module.scss';

type TabType = 'all' | 'in' | 'out';

const BillDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const billRecords = useAppStore(s => s.billRecords);
  const orders = useAppStore(s => s.orders);

  const getOrderByNo = (orderNo?: string) => {
    if (!orderNo) return null;
    return orders.find(o => o.orderNo === orderNo) || null;
  };

  const summary = useMemo(() => {
    const income = billRecords.filter(b => b.type === '收入').reduce((s, b) => s + b.amount, 0);
    const expense = billRecords.filter(b => b.type === '支出').reduce((s, b) => s + b.amount, 0);
    return { income, expense, net: income - expense };
  }, [billRecords]);

  const filteredRecords = useMemo(() => {
    let records = billRecords;
    if (activeTab === 'in') {
      records = records.filter(b => b.type === '收入');
    } else if (activeTab === 'out') {
      records = records.filter(b => b.type === '支出');
    }

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      records = records.filter(b => {
        const order = getOrderByNo(b.orderNo);
        return (
          b.orderNo?.toLowerCase().includes(kw) ||
          b.remark?.toLowerCase().includes(kw) ||
          b.category.toLowerCase().includes(kw) ||
          order?.customerName.toLowerCase().includes(kw)
        );
      });
    }

    return records;
  }, [activeTab, billRecords, searchKeyword, orders]);

  const groupedBills = useMemo(() => {
    const groups: Record<string, typeof billRecords> = {};
    filteredRecords.forEach(record => {
      if (!groups[record.date]) {
        groups[record.date] = [];
      }
      groups[record.date].push(record);
    });
    return groups;
  }, [filteredRecords]);

  const goToOrder = (orderNo?: string) => {
    if (!orderNo) return;
    const order = getOrderByNo(orderNo);
    if (order) {
      Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` });
    } else {
      Taro.showToast({ title: '找不到对应订单', icon: 'none' });
    }
  };

  const handleExport = () => {
    Taro.showToast({ title: '对账单导出中...', icon: 'loading' });
    setTimeout(() => {
      Taro.showToast({ title: '导出成功', icon: 'success' });
    }, 1500);
  };

  const handleSettle = () => {
    Taro.showModal({
      title: '确认结算',
      content: `确认结清本期账目？\n本期净收入：${formatPrice(summary.net)}`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '结算完成', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>对账结算</Text>
        <View className={styles.summaryCards}>
          <View className={styles.sumCard}>
            <Text className={classnames(styles.sumNum, styles.sumIncome)}>+{formatPrice(summary.income)}</Text>
            <Text className={styles.sumLabel}>本期收入</Text>
          </View>
          <View className={styles.sumCard}>
            <Text className={classnames(styles.sumNum, styles.sumExpense)}>-{formatPrice(summary.expense)}</Text>
            <Text className={styles.sumLabel}>本期支出</Text>
          </View>
          <View className={styles.sumCard}>
            <Text className={classnames(styles.sumNum, styles.sumNet)}>{formatPrice(summary.net)}</Text>
            <Text className={styles.sumLabel}>净收入</Text>
          </View>
        </View>
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder='搜索订单号、客户名、备注...'
          value={searchKeyword}
          onInput={(e) => setSearchKeyword(e.detail.value)}
        />
        {searchKeyword && (
          <Text className={styles.clearSearch} onClick={() => setSearchKeyword('')}>✕</Text>
        )}
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'all' && styles.tabActive)}
          onClick={() => setActiveTab('all')}
        >
          全部
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'in' && styles.tabActive)}
          onClick={() => setActiveTab('in')}
        >
          收入
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'out' && styles.tabActive)}
          onClick={() => setActiveTab('out')}
        >
          支出
        </View>
      </View>

      {searchKeyword && (
        <View className={styles.searchInfo}>
          <Text>搜索「{searchKeyword}」，找到 {filteredRecords.length} 条记录</Text>
        </View>
      )}

      <View className={styles.billList}>
        {Object.keys(groupedBills).length > 0 ? (
          Object.entries(groupedBills).map(([date, records]) => (
            <View key={date} className={styles.dateGroup}>
              <Text className={styles.dateHeader}>{date}</Text>
              {records.map(bill => {
                const order = getOrderByNo(bill.orderNo);
                return (
                  <View
                    key={bill.id}
                    className={classnames(styles.billItem, bill.orderNo && styles.clickable)}
                    onClick={() => goToOrder(bill.orderNo)}
                  >
                    <View className={styles.billInfo}>
                      <View className={classnames(styles.typeIcon, bill.type === '收入' ? styles.iconIn : styles.iconOut)}>
                        {bill.type === '收入' ? '📥' : '📤'}
                      </View>
                      <View className={styles.billDetail}>
                        <Text className={styles.billCategory}>
                          {bill.category}
                          {order && <Text className={styles.billCustomer}> · {order.customerName}</Text>}
                        </Text>
                        {bill.remark && <Text className={styles.billRemark}>{bill.remark}</Text>}
                        {bill.orderNo && <Text className={styles.billOrder}>订单：{bill.orderNo}</Text>}
                      </View>
                    </View>
                    <View className={styles.billRight}>
                      <Text className={classnames(styles.billAmount, bill.type === '收入' ? styles.amountIn : styles.amountOut)}>
                        {bill.type === '收入' ? '+' : '-'}{formatPrice(bill.amount)}
                      </Text>
                      {bill.orderNo && <Text className={styles.billGoDetail}>查看订单 ›</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>💰</Text>
            <Text className={styles.emptyText}>暂无账目记录</Text>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        <View className={classnames(styles.btn, styles.btnSecondary)} onClick={handleExport}>
          导出对账单
        </View>
        <View className={classnames(styles.btn, styles.btnPrimary)} onClick={handleSettle}>
          确认结算
        </View>
      </View>
    </View>
  );
};

export default BillDetailPage;
