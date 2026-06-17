import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { inventoryItems, billRecords, todayStats, monthStats } from '@/data/inventory';
import StatCard from '@/components/StatCard';
import { formatPrice } from '@/utils';
import classnames from 'classnames';
import styles from './index.module.scss';

const ShopPage: React.FC = () => {
  const warningItems = useMemo(() => {
    return inventoryItems.filter(i => i.status !== '正常').slice(0, 5);
  }, []);

  const recentBills = useMemo(() => {
    return billRecords.slice(0, 5);
  }, []);

  const billSummary = useMemo(() => {
    const income = billRecords.filter(b => b.type === '收入').reduce((s, b) => s + b.amount, 0);
    const expense = billRecords.filter(b => b.type === '支出').reduce((s, b) => s + b.amount, 0);
    return { income, expense, net: income - expense };
  }, []);

  const funcList = [
    { icon: '📦', name: '库存详情', cls: 'func1', path: '/pages/inventory-detail/index' },
    { icon: '⚠️', name: '库存预警', cls: 'func2', path: '/pages/inventory-detail/index?type=warn' },
    { icon: '💰', name: '对账结算', cls: 'func3', path: '/pages/bill-detail/index' },
    { icon: '🚚', name: '急单配送', cls: 'func4', path: '/pages/express/index' },
    { icon: '📊', name: '营业统计', cls: 'func5', path: '' },
    { icon: '📝', name: '出入库', cls: 'func6', path: '' },
    { icon: '👥', name: '员工管理', cls: 'func7', path: '' },
    { icon: '⚙️', name: '系统设置', cls: 'func8', path: '' }
  ];

  const handleFunc = (path: string, name: string) => {
    if (path) {
      Taro.navigateTo({ url: path });
    } else {
      Taro.showToast({ title: `${name}开发中`, icon: 'none' });
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.shopInfo}>
          <View className={styles.shopAvatar}>🏛️</View>
          <View className={styles.shopDetail}>
            <Text className={styles.shopName}>福寿缘寿衣店（总店）</Text>
            <Text className={styles.shopAddr}>北京市朝阳区某某路88号</Text>
          </View>
        </View>
        <View className={styles.statGrid}>
          <StatCard label={todayStats[0].label} value={todayStats[0].value} unit={todayStats[0].unit} trend={todayStats[0].trend} />
          <StatCard label={todayStats[1].label} value={todayStats[1].value} unit={todayStats[1].unit} trend={todayStats[1].trend} />
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardIcon}>📈</Text>
            本月经营
          </Text>
        </View>
        <View style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16rpx' }}>
          {monthStats.map((stat, idx) => (
            <View key={idx} style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '32rpx', fontWeight: 700, color: '#2E1F14', display: 'block', marginBottom: '4rpx' }}>
                {stat.value}{stat.unit}
              </Text>
              <Text style={{ fontSize: '22rpx', color: '#8A7A6A' }}>{stat.label}</Text>
              {stat.trend !== undefined && (
                <Text style={{
                  fontSize: '20rpx',
                  color: stat.trend >= 0 ? '#3D7A3D' : '#A33D3D',
                  display: 'block',
                  marginTop: '4rpx'
                }}>
                  {stat.trend >= 0 ? '↑' : '↓'}{Math.abs(stat.trend)}%
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardIcon}>🔧</Text>
            常用功能
          </Text>
        </View>
        <View className={styles.funcGrid}>
          {funcList.map((func, idx) => (
            <View
              key={idx}
              className={styles.funcItem}
              onClick={() => handleFunc(func.path, func.name)}
            >
              <View className={classnames(styles.funcIcon, styles[func.cls])}>
                {func.icon}
              </View>
              <Text className={styles.funcName}>{func.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardIcon}>⚠️</Text>
            库存预警
          </Text>
          <Text
            className={styles.cardMore}
            onClick={() => Taro.navigateTo({ url: '/pages/inventory-detail/index?type=warn' })}
          >
            查看全部 ›
          </Text>
        </View>
        {warningItems.length > 0 ? (
          warningItems.map(item => (
            <View key={item.id} className={styles.warnItem}>
              <View className={styles.warnInfo}>
                <Text className={styles.warnName}>{item.name}</Text>
                <Text className={styles.warnMeta}>
                  当前库存 {item.stock}{item.unit} / 最低库存 {item.minStock}{item.unit}
                </Text>
              </View>
              <Text className={classnames(styles.warnStatus, item.status === '缺货' ? styles.warnOut : styles.warnStock)}>
                {item.status === '缺货' ? '已缺货' : '库存预警'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ fontSize: '26rpx', color: '#8A7A6A', textAlign: 'center', padding: '32rpx 0' }}>
            暂无库存预警
          </Text>
        )}
      </View>

      <View className={styles.card}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardIcon}>💰</Text>
            近期账目
          </Text>
          <Text
            className={styles.cardMore}
            onClick={() => Taro.navigateTo({ url: '/pages/bill-detail/index' })}
          >
            对账结算 ›
          </Text>
        </View>
        {recentBills.map(bill => (
          <View key={bill.id} className={styles.billItem}>
            <View className={styles.billInfo}>
              <Text className={styles.billCategory}>{bill.category}</Text>
              <Text className={styles.billDate}>
                {bill.date} {bill.remark ? `· ${bill.remark}` : ''}
              </Text>
            </View>
            <Text className={classnames(styles.billAmount, bill.type === '收入' ? styles.amountIn : styles.amountOut)}>
              {bill.type === '收入' ? '+' : '-'}{formatPrice(bill.amount)}
            </Text>
          </View>
        ))}
        <View className={styles.summary}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>本期收入</Text>
            <Text className={classnames(styles.summaryValue, styles.summaryIncome)}>
              +{formatPrice(billSummary.income)}
            </Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>本期支出</Text>
            <Text className={classnames(styles.summaryValue, styles.summaryExpense)}>
              -{formatPrice(billSummary.expense)}
            </Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>净收入</Text>
            <Text className={classnames(styles.summaryValue, styles.summaryNet)}>
              {formatPrice(billSummary.net)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ShopPage;
