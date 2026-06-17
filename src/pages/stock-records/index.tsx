import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Picker, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store';
import { InventoryItem } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

const FILTER_STORAGE_KEY = 'stock_records_filter_v1';

interface SavedFilter {
  activeType: 'all' | '入库' | '出库';
  selectedItemId: string | null;
  startDate: string;
  endDate: string;
  searchKeyword: string;
}

const loadFilter = (): SavedFilter | null => {
  try {
    const data = Taro.getStorageSync(FILTER_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return null;
};

const saveFilter = (filter: SavedFilter) => {
  try {
    Taro.setStorageSync(FILTER_STORAGE_KEY, JSON.stringify(filter));
  } catch (e) {}
};

const formatDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const StockRecordsPage: React.FC = () => {
  const router = useRouter();
  const initialItemId = router.params.itemId;

  const stockRecords = useAppStore(s => s.stockRecords);
  const inventoryItems = useAppStore(s => s.inventoryItems);

  const savedFilter = loadFilter();
  const fromInventoryDetail = !!initialItemId;

  const [activeType, setActiveType] = useState<'all' | '入库' | '出库'>(
    fromInventoryDetail ? 'all' : (savedFilter?.activeType || 'all')
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    initialItemId || (savedFilter?.selectedItemId ?? null)
  );
  const [startDate, setStartDate] = useState<string>(
    fromInventoryDetail ? '' : (savedFilter?.startDate || '')
  );
  const [endDate, setEndDate] = useState<string>(
    fromInventoryDetail ? '' : (savedFilter?.endDate || '')
  );
  const [activeShortcut, setActiveShortcut] = useState<string>('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState<string>(
    fromInventoryDetail ? '' : (savedFilter?.searchKeyword || '')
  );
  const [showAllRecords, setShowAllRecords] = useState(false);

  useEffect(() => {
    const filter: SavedFilter = { activeType, selectedItemId, startDate, endDate, searchKeyword };
    saveFilter(filter);
  }, [activeType, selectedItemId, startDate, endDate, searchKeyword]);

  const selectedItem = useMemo(() =>
    inventoryItems.find(i => i.id === selectedItemId),
    [inventoryItems, selectedItemId]
  );

  const filteredRecords = useMemo(() => {
    let result = stockRecords;
    if (activeType !== 'all') {
      result = result.filter(r => r.type === activeType);
    }
    if (selectedItemId) {
      result = result.filter(r => r.itemId === selectedItemId);
    }
    if (startDate) {
      result = result.filter(r => r.date.split(' ')[0] >= startDate);
    }
    if (endDate) {
      result = result.filter(r => r.date.split(' ')[0] <= endDate);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(r =>
        r.itemName.toLowerCase().includes(kw) ||
        (r.remark || '').toLowerCase().includes(kw) ||
        r.operator.toLowerCase().includes(kw)
      );
    }
    return result;
  }, [stockRecords, activeType, selectedItemId, startDate, endDate, searchKeyword]);

  const stats = useMemo(() => {
    const records = filteredRecords;
    const totalIn = records.filter(r => r.type === '入库').reduce((s, r) => s + r.quantity, 0);
    const totalOut = records.filter(r => r.type === '出库').reduce((s, r) => s + r.quantity, 0);
    return { totalIn, totalOut };
  }, [filteredRecords]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, typeof filteredRecords> = {};
    filteredRecords.forEach(record => {
      const date = record.date.split(' ')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
    });
    return groups;
  }, [filteredRecords]);

  const recentRecordsForItem = useMemo(() => {
    if (!selectedItemId) return [];
    return stockRecords
      .filter(r => r.itemId === selectedItemId)
      .slice(0, 5);
  }, [stockRecords, selectedItemId]);

  const hasFilter = activeType !== 'all' || !!selectedItemId || !!startDate || !!endDate || !!searchKeyword.trim();

  const handleTypeChange = (type: 'all' | '入库' | '出库') => {
    setActiveType(type);
  };

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItemId(item.id === selectedItemId ? null : item.id);
    setShowItemModal(false);
  };

  const handleClearFilter = () => {
    setActiveType('all');
    setSelectedItemId(null);
    setStartDate('');
    setEndDate('');
    setActiveShortcut('');
    setSearchKeyword('');
    setShowAllRecords(false);
  };

  const displayedRecords = useMemo(() => {
    if (fromInventoryDetail && selectedItemId && !showAllRecords) {
      return filteredRecords.slice(0, 5);
    }
    return filteredRecords;
  }, [filteredRecords, fromInventoryDetail, selectedItemId, showAllRecords]);

  const hasMore = fromInventoryDetail && selectedItemId && filteredRecords.length > 5 && !showAllRecords;

  const displayedGroupedRecords = useMemo(() => {
    const groups: Record<string, typeof displayedRecords> = {};
    displayedRecords.forEach(record => {
      const date = record.date.split(' ')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
    });
    return groups;
  }, [displayedRecords]);

  const applyShortcut = (days: number, label: string) => {
    const today = new Date();
    if (days === 0) {
      const d = formatDate(today);
      setStartDate(d);
      setEndDate(d);
    } else {
      setStartDate(formatDate(addDays(today, -days + 1)));
      setEndDate(formatDate(today));
    }
    setActiveShortcut(label);
  };

  const filteredInventoryItems = useMemo(() => {
    if (!searchKeyword.trim()) return inventoryItems;
    const kw = searchKeyword.trim().toLowerCase();
    return inventoryItems.filter(i =>
      i.name.toLowerCase().includes(kw) ||
      i.sku.toLowerCase().includes(kw) ||
      i.category.toLowerCase().includes(kw)
    );
  }, [inventoryItems, searchKeyword]);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>📦 出入库记录</Text>
        <Text className={styles.headerDesc}>
          {selectedItem ? `当前商品：${selectedItem.name}` : '查看所有库存出入库登记记录'}
        </Text>
      </View>

      {fromInventoryDetail && selectedItem && filteredRecords.length > 0 && (
        <View className={styles.recentTip}>
          <Text className={styles.recentTipIcon}>📋</Text>
          <View className={styles.recentTipText}>
            <Text className={styles.recentTipTitle}>「{selectedItem.name}」最近登记记录</Text>
            <Text>共 {filteredRecords.length} 条记录{!showAllRecords && filteredRecords.length > 5 ? `，默认显示最近 5 条` : ''}</Text>
          </View>
          {hasMore && (
            <View className={styles.expandBtn} onClick={() => setShowAllRecords(true)}>
              展开全部 ↓
            </View>
          )}
          {showAllRecords && filteredRecords.length > 5 && (
            <View className={styles.expandBtn} onClick={() => setShowAllRecords(false)}>
              收起 ↑
            </View>
          )}
        </View>
      )}

      <View className={styles.filterSection}>
        <View className={styles.filterRow}>
          <View className={styles.typeTabs}>
            <View
              className={classnames(styles.typeTab, activeType === 'all' && styles.activeIn)}
              onClick={() => handleTypeChange('all')}
            >
              全部
            </View>
            <View
              className={classnames(styles.typeTab, activeType === '入库' && styles.activeIn)}
              onClick={() => handleTypeChange('入库')}
            >
              入库
            </View>
            <View
              className={classnames(styles.typeTab, activeType === '出库' && styles.activeOut)}
              onClick={() => handleTypeChange('出库')}
            >
              出库
            </View>
          </View>

          <View className={styles.itemSelect}>
            <View className={styles.selectBtn} onClick={() => setShowItemModal(true)}>
              <Text className={selectedItem ? '' : styles.placeholder}>
                {selectedItem ? selectedItem.name : '选择商品'}
              </Text>
              <Text>▼</Text>
            </View>
          </View>
        </View>

        <View className={styles.shortcutBtns}>
          {[
            { label: '今天', days: 0 },
            { label: '近7天', days: 7 },
            { label: '近30天', days: 30 }
          ].map(sc => (
            <View
              key={sc.label}
              className={classnames(styles.shortcutBtn, activeShortcut === sc.label && styles.active)}
              onClick={() => applyShortcut(sc.days, sc.label)}
            >
              {sc.label}
            </View>
          ))}
        </View>

        <View className={styles.filterRow}>
          <View className={styles.dateRangeRow}>
            <Text className={styles.dateRangeLabel}>日期：</Text>
            <View className={styles.dateSelectWrap}>
              <Picker
                mode='date'
                value={startDate}
                onChange={(e) => { setStartDate(e.detail.value as string); setActiveShortcut(''); }}
              >
                <View className={classnames(styles.dateBtn, !startDate && styles.placeholder)}>
                  <Text>{startDate || '开始日期'}</Text>
                  <Text>📅</Text>
                </View>
              </Picker>
              <Text style={{ alignSelf: 'center', color: '#8A7A6A' }}>至</Text>
              <Picker
                mode='date'
                value={endDate}
                onChange={(e) => { setEndDate(e.detail.value as string); setActiveShortcut(''); }}
              >
                <View className={classnames(styles.dateBtn, !endDate && styles.placeholder)}>
                  <Text>{endDate || '结束日期'}</Text>
                  <Text>📅</Text>
                </View>
              </Picker>
            </View>
          </View>
        </View>

        <View className={styles.filterRow}>
          <View className={styles.searchBar}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchInput}
              placeholder='搜索商品名、备注、操作人...'
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
          </View>
        </View>
      </View>

      {hasFilter && (
        <View className={styles.currentFilterInfo}>
          <View className={styles.filterInfoText}>
            {activeType !== 'all' && <Text className={styles.filterInfoTag}>类型：{activeType}</Text>}
            {selectedItem && <Text className={styles.filterInfoTag}>商品：{selectedItem.name}</Text>}
            {startDate && <Text className={styles.filterInfoTag}>起始：{startDate}</Text>}
            {endDate && <Text className={styles.filterInfoTag}>结束：{endDate}</Text>}
            {searchKeyword.trim() && <Text className={styles.filterInfoTag}>搜索：{searchKeyword}</Text>}
            <Text style={{ fontSize: '22rpx', color: '#8A7A6A' }}>共 {filteredRecords.length} 条记录</Text>
          </View>
          <View className={styles.clearFilterBtn} onClick={handleClearFilter}>清除筛选</View>
        </View>
      )}

      <View className={styles.statRow}>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, 'in')}>+{stats.totalIn}</Text>
          <Text className={styles.statLabel}>累计入库</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, 'out')}>-{stats.totalOut}</Text>
          <Text className={styles.statLabel}>累计出库</Text>
        </View>
      </View>

      <View className={styles.recordList}>
        {Object.keys(displayedGroupedRecords).length > 0 ? (
          Object.entries(displayedGroupedRecords).map(([date, records]) => (
            <View key={date} className={styles.dateGroup}>
              <Text className={styles.dateHeader}>
                {date}
                <Text style={{ fontSize: '22rpx', color: '#8A7A6A', fontWeight: 'normal', marginLeft: '16rpx' }}>
                  {records.length} 条
                </Text>
              </Text>
              {records.map(record => (
                <View key={record.id} className={styles.recordItem}>
                  <View className={styles.recordHeader}>
                    <View className={styles.recordInfo}>
                      <View className={classnames(styles.typeBadge, record.type === '入库' ? 'in' : 'out')}>
                        {record.type === '入库' ? '📥' : '📤'}
                      </View>
                      <View className={styles.recordDetail}>
                        <Text className={styles.recordItemName}>{record.itemName}</Text>
                        <Text className={styles.recordMeta}>
                          {record.type === '入库' ? '入库登记' : '出库登记'}
                        </Text>
                      </View>
                    </View>
                    <Text className={classnames(styles.recordQuantity, record.type === '入库' ? 'in' : 'out')}>
                      {record.type === '入库' ? '+' : '-'}{record.quantity}
                    </Text>
                  </View>
                  {record.remark && (
                    <View className={styles.recordRemark}>备注：{record.remark}</View>
                  )}
                  <View className={styles.recordFooter}>
                    <Text className={styles.recordOperator}>操作人：{record.operator}</Text>
                    <Text className={styles.recordTime}>{record.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无符合条件的记录</Text>
            {hasFilter && (
              <Text style={{ fontSize: '24rpx', color: '#8A7A6A', marginTop: '16rpx' }}>
                试试调整筛选条件看看？
              </Text>
            )}
          </View>
        )}
      </View>

      {showItemModal && (
        <View className={styles.modalMask} onClick={() => setShowItemModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择商品</Text>
              <Text className={styles.modalClose} onClick={() => setShowItemModal(false)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              {filteredInventoryItems.length > 0 ? (
                filteredInventoryItems.map(item => (
                  <View
                    key={item.id}
                    className={classnames(styles.itemOption, item.id === selectedItemId && styles.active)}
                    onClick={() => handleSelectItem(item)}
                  >
                    <View className={styles.itemOptionInfo}>
                      <Text className={styles.itemOptionName}>{item.name}</Text>
                      <Text className={styles.itemOptionStock}>
                        {item.category} · SKU: {item.sku} · 当前库存：{item.stock} {item.unit}
                      </Text>
                    </View>
                    <View className={styles.itemCheck}>✓</View>
                  </View>
                ))
              ) : (
                <View style={{ padding: '60rpx 0', textAlign: 'center' }}>
                  <Text style={{ fontSize: '40rpx', opacity: 0.3 }}>🔍</Text>
                  <Text style={{ fontSize: '24rpx', color: '#8A7A6A', marginTop: '16rpx' }}>没有匹配的商品</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default StockRecordsPage;
