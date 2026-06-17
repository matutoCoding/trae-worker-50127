import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store';
import { InventoryItem } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

const StockRecordsPage: React.FC = () => {
  const router = useRouter();
  const initialItemId = router.params.itemId;

  const stockRecords = useAppStore(s => s.stockRecords);
  const inventoryItems = useAppStore(s => s.inventoryItems);

  const [activeType, setActiveType] = useState<'all' | '入库' | '出库'>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(initialItemId || null);
  const [showItemModal, setShowItemModal] = useState(false);

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
    return result;
  }, [stockRecords, activeType, selectedItemId]);

  const stats = useMemo(() => {
    const records = selectedItemId
      ? stockRecords.filter(r => r.itemId === selectedItemId)
      : stockRecords;
    const totalIn = records.filter(r => r.type === '入库').reduce((s, r) => s + r.quantity, 0);
    const totalOut = records.filter(r => r.type === '出库').reduce((s, r) => s + r.quantity, 0);
    return { totalIn, totalOut };
  }, [stockRecords, selectedItemId]);

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

  const handleTypeChange = (type: 'all' | '入库' | '出库') => {
    setActiveType(type);
  };

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItemId(item.id === selectedItemId ? null : item.id);
    setShowItemModal(false);
  };

  const handleClearFilter = () => {
    setSelectedItemId(null);
    setActiveType('all');
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>📦 出入库记录</Text>
        <Text className={styles.headerDesc}>查看所有库存出入库登记记录</Text>
      </View>

      <View className={styles.filterBar}>
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

      {(selectedItemId || activeType !== 'all') && (
        <View style={{ padding: '0 32rpx 16rpx', display: 'flex', justifyContent: 'flex-end' }}>
          <View className={styles.clearBtn} onClick={handleClearFilter}>
            清除筛选
          </View>
        </View>
      )}

      <View className={styles.recordList}>
        {Object.keys(groupedRecords).length > 0 ? (
          Object.entries(groupedRecords).map(([date, records]) => (
            <View key={date} className={styles.dateGroup}>
              <Text className={styles.dateHeader}>{date}</Text>
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
              {inventoryItems.map(item => (
                <View
                  key={item.id}
                  className={classnames(styles.itemOption, item.id === selectedItemId && styles.active)}
                  onClick={() => handleSelectItem(item)}
                >
                  <View className={styles.itemOptionInfo}>
                    <Text className={styles.itemOptionName}>{item.name}</Text>
                    <Text className={styles.itemOptionStock}>
                      SKU: {item.sku} · 当前库存：{item.stock} {item.unit}
                    </Text>
                  </View>
                  <View className={styles.itemCheck}>✓</View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default StockRecordsPage;
