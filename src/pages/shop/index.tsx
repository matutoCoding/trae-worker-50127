import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { todayStats, monthStats } from '@/data/inventory';
import StatCard from '@/components/StatCard';
import { formatPrice } from '@/utils';
import { useAppStore } from '@/store';
import classnames from 'classnames';
import styles from './index.module.scss';

const ShopPage: React.FC = () => {
  const inventoryItems = useAppStore(state => state.inventoryItems);
  const billRecords = useAppStore(state => state.billRecords);
  const stockIn = useAppStore(state => state.stockIn);
  const stockOut = useAppStore(state => state.stockOut);

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockType, setStockType] = useState<'入库' | '出库'>('入库');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [remark, setRemark] = useState('');

  const warningItems = useMemo(() => {
    return inventoryItems.filter(i => i.status !== '正常').slice(0, 5);
  }, [inventoryItems]);

  const recentBills = useMemo(() => {
    return billRecords.slice(0, 5);
  }, [billRecords]);

  const billSummary = useMemo(() => {
    const income = billRecords.filter(b => b.type === '收入').reduce((s, b) => s + b.amount, 0);
    const expense = billRecords.filter(b => b.type === '支出').reduce((s, b) => s + b.amount, 0);
    return { income, expense, net: income - expense };
  }, [billRecords]);

  const selectedItem = useMemo(() => {
    return inventoryItems.find(i => i.id === selectedItemId);
  }, [inventoryItems, selectedItemId]);

  const funcList = [
    { icon: '📦', name: '库存详情', cls: 'func1', path: '/pages/inventory-detail/index', action: null },
    { icon: '⚠️', name: '库存预警', cls: 'func2', path: '/pages/inventory-detail/index?type=warn', action: null },
    { icon: '💰', name: '对账结算', cls: 'func3', path: '/pages/bill-detail/index', action: null },
    { icon: '🚚', name: '急单配送', cls: 'func4', path: '/pages/express/index', action: null },
    { icon: '📊', name: '营业统计', cls: 'func5', path: '', action: 'dev' },
    { icon: '📝', name: '出入库', cls: 'func6', path: '', action: 'stock' },
    { icon: '👥', name: '员工管理', cls: 'func7', path: '', action: 'dev' },
    { icon: '⚙️', name: '系统设置', cls: 'func8', path: '', action: 'dev' }
  ];

  const handleFunc = (path: string, name: string, action: string | null) => {
    if (action === 'stock') {
      setStockType('入库');
      setSelectedItemId('');
      setQuantity(1);
      setRemark('');
      setShowStockModal(true);
    } else if (action === 'dev') {
      Taro.showToast({ title: `${name}开发中`, icon: 'none' });
    } else if (path) {
      Taro.navigateTo({ url: path });
    }
  };

  const handleConfirmStock = () => {
    if (!selectedItemId) {
      Taro.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    if (quantity <= 0) {
      Taro.showToast({ title: '数量必须大于0', icon: 'none' });
      return;
    }
    if (stockType === '出库' && selectedItem && quantity > selectedItem.stock) {
      Taro.showToast({ title: `库存不足（当前${selectedItem.stock}${selectedItem.unit}）`, icon: 'none' });
      return;
    }

    if (stockType === '入库') {
      stockIn({
        itemId: selectedItemId,
        quantity,
        remark: remark.trim() || undefined
      });
    } else {
      stockOut({
        itemId: selectedItemId,
        quantity,
        remark: remark.trim() || undefined
      });
    }

    Taro.showToast({ title: `${stockType}成功`, icon: 'success' });
    setShowStockModal(false);
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
              onClick={() => handleFunc(func.path, func.name, func.action)}
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

      {showStockModal && (
        <View className={styles.modalMask} onClick={() => setShowStockModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation && (e as any).stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>出入库登记</Text>
              <Text className={styles.modalClose} onClick={() => setShowStockModal(false)}>✕</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.typeTabs}>
                <View
                  className={classnames(styles.typeTab, stockType === '入库' && styles.typeTabActiveIn)}
                  onClick={() => setStockType('入库')}
                >
                  📥 入库
                </View>
                <View
                  className={classnames(styles.typeTab, stockType === '出库' && styles.typeTabActiveOut)}
                  onClick={() => setStockType('出库')}
                >
                  📤 出库
                </View>
              </View>

              <Text style={{ fontSize: '26rpx', color: '#8A7A6A', marginBottom: '16rpx', display: 'block' }}>
                选择商品
              </Text>
              <View className={styles.itemSelectList}>
                {inventoryItems.map(item => (
                  <View
                    key={item.id}
                    className={classnames(styles.itemSelectItem, selectedItemId === item.id && styles.itemSelectActive)}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <View className={styles.itemSelectInfo}>
                      <Text className={styles.itemSelectName}>{item.name}</Text>
                      <Text className={styles.itemSelectStock}>
                        {item.category} · 当前库存 {item.stock}{item.unit}
                      </Text>
                    </View>
                    <Text style={{ fontSize: '32rpx', color: selectedItemId === item.id ? '#4A3728' : '#ccc' }}>
                      {selectedItemId === item.id ? '✓' : '○'}
                    </Text>
                  </View>
                ))}
              </View>

              <View className={styles.quantityRow}>
                <Text className={styles.quantityLabel}>数量</Text>
                <View className={styles.quantityControl}>
                  <View
                    className={styles.qtyBtnLarge}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </View>
                  <Input
                    className={styles.qtyInput}
                    type="number"
                    value={quantity.toString()}
                    onInput={(e) => setQuantity(Number(e.detail.value) || 1)}
                  />
                  <View
                    className={styles.qtyBtnLarge}
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </View>
                  {selectedItem && (
                    <Text style={{ fontSize: '24rpx', color: '#8A7A6A' }}>{selectedItem.unit}</Text>
                  )}
                </View>
              </View>

              <View className={styles.remarkRow}>
                <Text className={styles.remarkLabel}>备注（选填）</Text>
                <View className={styles.remarkInput}>
                  <Textarea
                    placeholder={stockType === '入库' ? '如：采购补货、退货入库等' : '如：销售出库、订单配送等'}
                    value={remark}
                    onInput={(e) => setRemark(e.detail.value)}
                  />
                </View>
              </View>
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={styles.cancelBtn} onClick={() => setShowStockModal(false)}>
                取消
              </View>
              <View
                className={classnames(
                  styles.confirmBtn,
                  stockType === '入库' ? styles.confirmBtnIn : styles.confirmBtnOut
                )}
                onClick={handleConfirmStock}
              >
                确认{stockType}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ShopPage;
