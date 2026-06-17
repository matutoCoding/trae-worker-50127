import React, { useState, useMemo } from 'react';
import { View, Text, Input, Image, ScrollView, Textarea } from '@tarojs/components';
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

type TabType = 'list' | 'size' | 'material' | 'match' | 'taboo' | 'info';

const CustomPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [materialCategory, setMaterialCategory] = useState('全部');

  const customList = useAppStore(state => state.customList);
  const removeCustomItem = useAppStore(state => state.removeCustomItem);
  const updateCustomItemQuantity = useAppStore(state => state.updateCustomItemQuantity);
  const sizeRecord = useAppStore(state => state.sizeRecord);
  const setSizeRecord = useAppStore(state => state.setSizeRecord);
  const selectedMaterialIds = useAppStore(state => state.selectedMaterialIds);
  const toggleMaterialId = useAppStore(state => state.toggleMaterialId);
  const submitCustomOrder = useAppStore(state => state.submitCustomOrder);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [funeralHome, setFuneralHome] = useState('');
  const [remark, setRemark] = useState('');
  const [taboos, setTaboos] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const filteredMaterials = useMemo(() => {
    if (materialCategory === '全部') return materials;
    return materials.filter(m => m.category === materialCategory);
  }, [materialCategory]);

  const selectedMaterials = useMemo(() => {
    return materials.filter(m => selectedMaterialIds.includes(m.id));
  }, [selectedMaterialIds]);

  const totalMaterialPrice = useMemo(() => {
    return selectedMaterials.reduce((sum, m) => sum + m.price, 0);
  }, [selectedMaterials]);

  const totalItemsPrice = useMemo(() => {
    return customList.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);
  }, [customList]);

  const customServiceFee = 500;
  const urgentFee = isUrgent ? 300 : 0;
  const totalAmount = totalItemsPrice + totalMaterialPrice + customServiceFee + urgentFee;
  const totalCustomItems = customList.reduce((sum, ci) => sum + ci.quantity, 0);

  const handleSizeChange = (field: string, value: string) => {
    setSizeRecord({ [field]: Number(value) || 0 });
  };

  const handleGenderChange = (gender: '男' | '女') => {
    setSizeRecord({ gender });
  };

  const handleSubmit = () => {
    if (customList.length === 0) {
      Taro.showToast({ title: '请先添加定制商品', icon: 'none' });
      return;
    }
    if (!customerName.trim()) {
      Taro.showToast({ title: '请输入联系人姓名', icon: 'none' });
      return;
    }
    if (!customerPhone.trim()) {
      Taro.showToast({ title: '请输入联系电话', icon: 'none' });
      return;
    }
    if (!address.trim()) {
      Taro.showToast({ title: '请输入配送地址', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '提交定制单',
      content: `确认提交当前定制单？\n商品 ${totalCustomItems} 件\n预估金额：${formatPrice(totalAmount)}`,
      success: (res) => {
        if (res.confirm) {
          const newOrder = submitCustomOrder({
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            address: address.trim(),
            funeralHome: funeralHome.trim() || undefined,
            isUrgent,
            urgentFee,
            remark: remark.trim() || undefined,
            taboos: taboos.trim() || undefined,
            customItems: customList,
            sizeInfo: sizeRecord,
            materialNames: selectedMaterials.map(m => m.name),
            materialPrice: totalMaterialPrice
          });

          Taro.showToast({ title: '定制单已提交', icon: 'success' });

          setCustomerName('');
          setCustomerPhone('');
          setAddress('');
          setFuneralHome('');
          setRemark('');
          setTaboos('');
          setIsUrgent(false);
          useAppStore.getState().clearCustomList();

          setTimeout(() => {
            Taro.switchTab({ url: '/pages/orders/index' });
          }, 800);
        }
      }
    });
  };

  const goBrowse = () => {
    Taro.switchTab({ url: '/pages/styles/index' });
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
    { key: 'list', label: `清单(${totalCustomItems})` },
    { key: 'size', label: '尺寸' },
    { key: 'material', label: '材质' },
    { key: 'match', label: '套装' },
    { key: 'taboo', label: '习俗' },
    { key: 'info', label: '信息' }
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
        {activeTab === 'list' && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>🛒</Text>
              <Text>待定制清单（{customList.length}种，{totalCustomItems}件）</Text>
            </View>
            {customList.length > 0 ? (
              <View className={styles.customList}>
                {customList.map(item => (
                  <View key={item.id} className={styles.customItem}>
                    <Image className={styles.customItemImg} src={item.productImage} mode="aspectFill" />
                    <View className={styles.customItemInfo}>
                      <View>
                        <Text className={styles.customItemName}>{item.productName}</Text>
                        <Text className={styles.customItemMeta}>
                          {item.selectedSize ? `规格：${item.selectedSize}` : '标准规格'}
                          {' · '}加入于 {item.addedAt.split(' ')[0]}
                        </Text>
                      </View>
                      <View className={styles.customItemBottom}>
                        <Text className={styles.customItemPrice}>{formatPrice(item.price)}</Text>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '24rpx' }}>
                          <View className={styles.qtyControl}>
                            <View
                              className={styles.qtyBtn}
                              onClick={() => updateCustomItemQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </View>
                            <Text className={styles.qtyValue}>{item.quantity}</Text>
                            <View
                              className={styles.qtyBtn}
                              onClick={() => updateCustomItemQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </View>
                          </View>
                          <Text className={styles.removeBtn} onClick={() => removeCustomItem(item.id)}>
                            移除
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.emptyCustom}>
                <Text className={styles.emptyCustomIcon}>🛒</Text>
                <Text className={styles.emptyCustomText}>暂无待定制商品，快去挑选款式吧</Text>
                <View className={styles.browseBtn} onClick={goBrowse}>
                  去挑选款式
                </View>
              </View>
            )}
            {customList.length > 0 && (
              <View className={styles.priceBreakdown} style={{ marginTop: '32rpx' }}>
                <View className={styles.priceLine}>
                  <Text>商品小计</Text>
                  <Text>{formatPrice(totalItemsPrice)}</Text>
                </View>
                {selectedMaterials.length > 0 && (
                  <View className={styles.priceLine}>
                    <Text>材质费用（{selectedMaterials.length}种）</Text>
                    <Text>{formatPrice(totalMaterialPrice)}</Text>
                  </View>
                )}
                <View className={styles.priceLine}>
                  <Text>定制服务费</Text>
                  <Text>{formatPrice(customServiceFee)}</Text>
                </View>
                {isUrgent && (
                  <View className={styles.priceLine}>
                    <Text>加急费用</Text>
                    <Text style={{ color: '#A33D3D' }}>{formatPrice(urgentFee)}</Text>
                  </View>
                )}
                <View className={classnames(styles.priceLine, styles.priceLineTotal)}>
                  <Text>预估总金额</Text>
                  <Text>{formatPrice(totalAmount)}</Text>
                </View>
              </View>
            )}
          </View>
        )}

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

            {selectedMaterials.length > 0 && (
              <View className={styles.section}>
                <View className={styles.sectionTitle}>
                  <Text className={styles.sectionIcon}>✅</Text>
                  <Text>已选材质（{selectedMaterials.length}）</Text>
                </View>
                <View className={styles.selectedList}>
                  {selectedMaterials.map(m => (
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

        {activeTab === 'info' && (
          <>
            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>🚨</Text>
                <Text>加急处理</Text>
              </View>
              <View className={styles.urgentRow}>
                <View className={styles.urgentInfo}>
                  <View>
                    <Text className={styles.urgentText}>⚡ 加急配送</Text>
                    <Text className={styles.urgentDesc}>开启后24小时内完成，加急费{formatPrice(300)}</Text>
                  </View>
                </View>
                <View
                  className={classnames(styles.switchWrap, isUrgent && styles.switchWrapActive)}
                  onClick={() => setIsUrgent(!isUrgent)}
                >
                  <View className={classnames(styles.switchDot, isUrgent && styles.switchDotActive)} />
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>👤</Text>
                <Text>联系人信息</Text>
              </View>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>联系人姓名 *</Text>
                <View className={styles.formInput}>
                  <Input
                    placeholder="请输入联系人姓名"
                    value={customerName}
                    onInput={(e) => setCustomerName(e.detail.value)}
                  />
                </View>
              </View>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>联系电话 *</Text>
                <View className={styles.formInput}>
                  <Input
                    type="phone"
                    placeholder="请输入联系电话"
                    value={customerPhone}
                    onInput={(e) => setCustomerPhone(e.detail.value)}
                  />
                </View>
              </View>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>配送地址 *</Text>
                <View className={styles.formTextarea}>
                  <Textarea
                    placeholder="请输入详细配送地址"
                    value={address}
                    onInput={(e) => setAddress(e.detail.value)}
                  />
                </View>
              </View>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>殡仪馆（选填）</Text>
                <View className={styles.formInput}>
                  <Input
                    placeholder="如配送至殡仪馆请填写名称"
                    value={funeralHome}
                    onInput={(e) => setFuneralHome(e.detail.value)}
                  />
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>📝</Text>
                <Text>备注与避讳</Text>
              </View>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>特殊要求（选填）</Text>
                <View className={styles.formTextarea}>
                  <Textarea
                    placeholder="如有特殊要求请备注"
                    value={remark}
                    onInput={(e) => setRemark(e.detail.value)}
                  />
                </View>
              </View>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>避讳习俗（选填）</Text>
                <View className={styles.formTextarea}>
                  <Textarea
                    placeholder="如避讳某些颜色、材质、图案等"
                    value={taboos}
                    onInput={(e) => setTaboos(e.detail.value)}
                  />
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>💰</Text>
                <Text>费用明细</Text>
              </View>
              <View className={styles.priceBreakdown}>
                <View className={styles.priceLine}>
                  <Text>商品（{totalCustomItems}件）</Text>
                  <Text>{formatPrice(totalItemsPrice)}</Text>
                </View>
                {selectedMaterials.length > 0 && (
                  <View className={styles.priceLine}>
                    <Text>材质（{selectedMaterials.length}种）</Text>
                    <Text>{formatPrice(totalMaterialPrice)}</Text>
                  </View>
                )}
                <View className={styles.priceLine}>
                  <Text>定制服务费</Text>
                  <Text>{formatPrice(customServiceFee)}</Text>
                </View>
                {isUrgent && (
                  <View className={styles.priceLine}>
                    <Text>加急费</Text>
                    <Text style={{ color: '#A33D3D' }}>{formatPrice(urgentFee)}</Text>
                  </View>
                )}
                <View className={classnames(styles.priceLine, styles.priceLineTotal)}>
                  <Text>预估总金额</Text>
                  <Text>{formatPrice(totalAmount)}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.priceInfo}>
          <Text className={styles.priceLabel}>预估定制费用</Text>
          <Text className={styles.priceValue}>{formatPrice(totalAmount)}</Text>
        </View>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          提交定制单
        </View>
      </View>
    </View>
  );
};

export default CustomPage;
