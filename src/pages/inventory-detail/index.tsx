import React, { useState, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import classnames from 'classnames';
import styles from './index.module.scss';

const filters = ['全部', '正常', '预警', '缺货'];

const InventoryDetailPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('全部');
  const [searchText, setSearchText] = useState('');
  const inventoryItems = useAppStore(s => s.inventoryItems);

  const routerParams = Taro.getCurrentInstance().router?.params;
  React.useEffect(() => {
    if (routerParams?.type === 'warn') {
      setActiveFilter('预警');
    }
  }, []);

  const filteredItems = useMemo(() => {
    let result = inventoryItems;
    if (activeFilter !== '全部') {
      if (activeFilter === '预警') {
        result = result.filter(i => i.status === '预警' || i.status === '缺货');
      } else {
        result = result.filter(i => i.status === activeFilter);
      }
    }
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      result = result.filter(i =>
        i.name.toLowerCase().includes(kw) ||
        i.sku.toLowerCase().includes(kw) ||
        i.category.toLowerCase().includes(kw)
      );
    }
    return result;
  }, [activeFilter, searchText, inventoryItems]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case '正常': return styles.statusNormal;
      case '预警': return styles.statusWarn;
      case '缺货': return styles.statusOut;
      default: return styles.statusNormal;
    }
  };

  const goStockRecords = (itemId?: string) => {
    const url = itemId
      ? `/pages/stock-records/index?itemId=${itemId}`
      : '/pages/stock-records/index';
    Taro.navigateTo({ url });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View>
            <Text className={styles.title}>库存管理</Text>
            <Text className={styles.desc}>实时监控库存状态，及时补货避免缺货</Text>
          </View>
          <View className={styles.recordsBtn} onClick={() => goStockRecords()}>
            📋 出入库记录
          </View>
        </View>
      </View>

      <View className={styles.filterBar}>
        {filters.map(f => (
          <View
            key={f}
            className={classnames(styles.filterItem, activeFilter === f && styles.filterActive)}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </View>
        ))}
      </View>

      <View className={styles.searchWrap}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索商品名称、SKU..."
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.list}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <View
              key={item.id}
              className={classnames(styles.item, styles.clickable)}
              onClick={() => goStockRecords(item.id)}
            >
              <View className={styles.itemHeader}>
                <View className={styles.itemInfo}>
                  <Text className={styles.itemName}>{item.name}</Text>
                  <Text className={styles.itemMeta}>
                    {item.category} · SKU: {item.sku}
                  </Text>
                </View>
                <Text className={classnames(styles.statusBadge, getStatusClass(item.status))}>
                  {item.status}
                </Text>
              </View>

              <View className={styles.itemStats}>
                <View className={styles.statCol}>
                  <Text className={styles.statNum}>{item.stock}</Text>
                  <Text className={styles.statLabel}>当前库存（{item.unit}）</Text>
                </View>
                <View className={styles.statCol}>
                  <Text className={classnames(styles.statNum, styles.statNumIn)}>+{item.recentIn}</Text>
                  <Text className={styles.statLabel}>近7日入库</Text>
                </View>
                <View className={styles.statCol}>
                  <Text className={classnames(styles.statNum, styles.statNumOut)}>-{item.recentOut}</Text>
                  <Text className={styles.statLabel}>近7日出库</Text>
                </View>
              </View>

              <View className={styles.itemFooter}>
                <Text className={styles.location}>📍 {item.location}</Text>
                <Text className={styles.updateTime}>更新于 {item.lastUpdate}</Text>
              </View>

              <View className={styles.viewRecordsHint}>
                <Text>📋</Text>
                <Text>点击查看出入库记录 →</Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📦</Text>
            <Text className={styles.emptyText}>暂无符合条件的库存数据</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default InventoryDetailPage;
