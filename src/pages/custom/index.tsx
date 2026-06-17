import React, { useState, useMemo } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { products } from '@/data/products';
import { materials, materialCategories } from '@/data/materials';
import { taboosList } from '@/data/products';
import { useAppStore } from '@/store';
import { formatPrice } from '@/utils';
import SectionHeader from '@/components/SectionHeader';
import Tag from '@/components/Tag';
import classnames from 'classnames';
import styles from './index.module.scss';

type TabType = 'size' | 'material' | 'match' | 'taboo';

const CustomPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('size');
  const [materialCategory, setMaterialCategory] = useState('全部');

  const sizeRecord = useAppStore(state => state.sizeRecord);
  const setSizeRecord = useAppStore(state => state.setSizeRecord);
  const selectedMaterialIds = useAppStore(state => state.selectedMaterialIds);
  const toggleMaterialId = useAppStore(state => state.toggleMaterialId);

  const filteredMaterials = useMemo(() => {
    if (materialCategory === '全部') return materials;
    return materials.filter(m => m.category === materialCategory);
  }, [materialCategory]);

  const totalMaterialPrice = useMemo(() => {
    return materials
      .filter(m => selectedMaterialIds.includes(m.id))
      .reduce((sum, m) => sum + m.price, 0);
  }, [selectedMaterialIds]);

  const handleSizeChange = (field: string, value: string) => {
    setSizeRecord({ [field]: Number(value) || 0 });
  };

  const handleGenderChange = (gender: '男' | '女') => {
    setSizeRecord({ gender });
  };

  const handleSubmit = () => {
    Taro.showModal({
      title: '提交定制单',
      content: '确认提交当前定制信息吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '定制单已提交', icon: 'success' });
        }
      }
    });
  };

  const sizeFields = [
    { key: 'height', label: '身高', unit: 'cm' },
    { key: 'weight', label: '体重', unit: 'kg' },
    { key: 'shoulder', label: '肩宽', unit: 'cm' },
    { key: 'chest', label: '胸围', unit: 'cm' },
    { key: 'waist', label: '腰围', unit: 'cm' },
    { key: 'hip', label: '臀围', unit: 'cm' },
    { key: 'sleeve', label: '袖长', unit: 'cm' },
    { key: 'pants', label: '裤长', unit: 'cm' },
    { key: 'shoeSize', label: '鞋码', unit: '码' }
  ];

  const tabs = [
    { key: 'size', label: '尺寸登记' },
    { key: 'material', label: '材质选择' },
    { key: 'match', label: '套装搭配' },
    { key: 'taboo', label: '避讳习俗' }
  ] as const;

  return (
    <View className={styles.page}>
      <View className={styles.tabBar}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.tabActive)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.content}>
        {activeTab === 'size' && (
          <>
            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>📏</Text>
                <Text>逝者性别</Text>
              </View>
              <View className={styles.genderRow}>
                <View
                  className={classnames(styles.genderOption, sizeRecord.gender === '男' && styles.genderActive)}
                  onClick={() => handleGenderChange('男')}
                >
                  男款
                </View>
                <View
                  className={classnames(styles.genderOption, sizeRecord.gender === '女' && styles.genderActive)}
                  onClick={() => handleGenderChange('女')}
                >
                  女款
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>📐</Text>
                <Text>尺寸登记</Text>
              </View>
              <View className={styles.tipCard}>
                <View className={styles.tipTitle}>
                  <Text>⚠️</Text>
                  <Text>温馨提示</Text>
                </View>
                <Text className={styles.tipContent}>
                  请准确测量各项尺寸，如有不确定可联系门店师傅上门量体。
                  定制尺寸恕不退换，请谨慎填写。
                </Text>
              </View>
              <View className={styles.sizeGrid}>
                {sizeFields.map(field => (
                  <View key={field.key} className={styles.sizeItem}>
                    <Text className={styles.sizeLabel}>{field.label}</Text>
                    <View className={styles.sizeInput}>
                      <Input
                        type="digit"
                        placeholder={`请输入${field.label}`}
                        value={sizeRecord[field.key as keyof typeof sizeRecord]?.toString() || ''}
                        onInput={(e) => handleSizeChange(field.key, e.detail.value)}
                      />
                      <Text className={styles.sizeUnit}>{field.unit}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {activeTab === 'material' && (
          <>
            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>🧵</Text>
                <Text>材质分类</Text>
              </View>
              <View className={styles.materialCategory}>
                {materialCategories.map(cat => (
                  <View
                    key={cat}
                    className={classnames(styles.materialCatItem, materialCategory === cat && styles.materialCatActive)}
                    onClick={() => setMaterialCategory(cat)}
                  >
                    {cat}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>✨</Text>
                <Text>材质列表（可多选）</Text>
              </View>
              <View className={styles.materialList}>
                {filteredMaterials.map(material => (
                  <View
                    key={material.id}
                    className={classnames(styles.materialCard, selectedMaterialIds.includes(material.id) && styles.materialSelected)}
                    onClick={() => toggleMaterialId(material.id)}
                  >
                    <Image className={styles.materialImage} src={material.image} mode="aspectFill" />
                    <View className={styles.materialInfo}>
                      <View>
                        <Text className={styles.materialName}>{material.name}</Text>
                        <Text className={styles.materialDesc}>{material.description}</Text>
                        <View className={styles.featureList}>
                          {material.features.slice(0, 2).map((f, i) => (
                            <Text key={i} className={styles.featureTag}>{f}</Text>
                          ))}
                        </View>
                      </View>
                      <View className={styles.materialBottom}>
                        <Text className={styles.materialPrice}>
                          {formatPrice(material.price)}/{material.unit}
                        </Text>
                        <Text className={styles.materialStock}>库存 {material.stock}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {selectedMaterialIds.length > 0 && (
              <View className={styles.section}>
                <View className={styles.sectionTitle}>
                  <Text className={styles.sectionIcon}>✅</Text>
                  <Text>已选材质（{selectedMaterialIds.length}）</Text>
                </View>
                <View className={styles.selectedList}>
                  {materials
                    .filter(m => selectedMaterialIds.includes(m.id))
                    .map(m => (
                      <View key={m.id} className={styles.selectedItem}>
                        <Text className={styles.selectedName}>{m.name}</Text>
                        <Text className={styles.selectedPrice}>{formatPrice(m.price)}/{m.unit}</Text>
                        <Text className={styles.selectedRemove} onClick={() => toggleMaterialId(m.id)}>移除</Text>
                      </View>
                    ))}
                </View>
              </View>
            )}
          </>
        )}

        {activeTab === 'match' && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>🎁</Text>
              <Text>套装搭配推荐</Text>
            </View>
            <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24rpx' }}>
              {products.filter(p => p.category === '套装').map(product => (
                <View
                  key={product.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16rpx',
                    padding: '24rpx',
                    boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.06)'
                  }}
                  onClick={() => Taro.navigateTo({ url: `/pages/style-detail/index?id=${product.id}` })}
                >
                  <Image
                    src={product.image}
                    mode="aspectFill"
                    style={{ width: '100%', height: '200rpx', borderRadius: '12rpx', marginBottom: '16rpx' }}
                  />
                  <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#2E1F14', display: 'block', marginBottom: '8rpx' }}>
                    {product.name}
                  </Text>
                  <Text style={{ fontSize: '24rpx', color: '#8A7A6A', display: 'block', marginBottom: '12rpx' }}>
                    {product.subCategory}
                  </Text>
                  <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8rpx', marginBottom: '12rpx' }}>
                    {product.materials.slice(0, 2).map((m, i) => (
                      <Tag key={i} text={m} type="outline" />
                    ))}
                  </View>
                  <Text style={{ fontSize: '32rpx', fontWeight: 700, color: '#4A3728' }}>
                    {formatPrice(product.price)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'taboo' && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📜</Text>
              <Text>避讳习俗提示</Text>
            </View>
            {taboosList.map((item, idx) => (
              <View key={idx} className={styles.tipCard}>
                <View className={styles.tipTitle}>
                  <Text>⚠️</Text>
                  <Text>{item.title}</Text>
                </View>
                <Text className={styles.tipContent}>{item.content}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.priceInfo}>
          <Text className={styles.priceLabel}>预估定制费用</Text>
          <Text className={styles.priceValue}>{formatPrice(totalMaterialPrice + 500)}</Text>
        </View>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          提交定制单
        </View>
      </View>
    </View>
  );
};

export default CustomPage;
