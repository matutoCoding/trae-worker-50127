import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { products } from '@/data/products';
import Tag from '@/components/Tag';
import { formatPrice } from '@/utils';
import { useAppStore } from '@/store';
import classnames from 'classnames';
import styles from './index.module.scss';

const StyleDetailPage: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState('');
  const addCustomItem = useAppStore(state => state.addCustomItem);
  const customList = useAppStore(state => state.customList);

  const productId = Taro.getCurrentInstance().router?.params?.id || '';

  const product = useMemo(() => {
    return products.find(p => p.id === productId) || products[0];
  }, [productId]);

  const currentCustomCount = useMemo(() => {
    return customList
      .filter(c => c.productId === product.id)
      .reduce((sum, c) => sum + c.quantity, 0);
  }, [customList, product.id]);

  const handleAddToOrder = () => {
    if (!selectedSize && product.sizes.length > 0) {
      Taro.showToast({ title: '请选择尺寸', icon: 'none' });
      return;
    }
    addCustomItem(product, selectedSize || undefined);
    Taro.showToast({
      title: `已加入定制清单（${currentCustomCount + 1}件）`,
      icon: 'success'
    });
  };

  const handleCustom = () => {
    Taro.switchTab({ url: '/pages/custom/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.imageSection}>
        <Image className={styles.productImage} src={product.image} mode="aspectFill" />
        <View className={styles.tagWrap}>
          {product.isHot && <Tag text="热销" type="hot" />}
          {product.isNew && <Tag text="新品" type="new" />}
          <Tag text={product.category} type="gold" />
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.productName}>{product.name}</Text>
        <View className={styles.priceRow}>
          <Text className={styles.price}>{formatPrice(product.price)}</Text>
          {product.originalPrice && (
            <Text className={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
          )}
        </View>
        <Text className={styles.stockInfo}>
          分类：{product.subCategory} · 库存：{product.stock} 件
          {currentCustomCount > 0 && ` · 已选：${currentCustomCount}件`}
        </Text>
        <View className={styles.tagList} style={{ marginTop: '24rpx' }}>
          {product.tags.map((tag, idx) => (
            <Tag key={idx} text={tag} type="outline" />
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📋</Text>
          商品描述
        </Text>
        <Text className={styles.descText}>{product.description}</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📜</Text>
          传统形制介绍
        </Text>
        <View className={styles.tradCard}>
          <View className={styles.tradTitle}>
            <Text>🎋</Text>
            <Text>传统工艺</Text>
          </View>
          <Text className={styles.tradContent}>{product.traditionalIntro}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🧵</Text>
          材质说明
        </Text>
        <View className={styles.specList}>
          <View className={styles.specItem}>
            <Text className={styles.specLabel}>面料材质</Text>
            <View className={styles.specValue}>
              {product.materials.map((m, idx) => (
                <Text key={idx} className={styles.materialTag}>{m}</Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📐</Text>
          尺寸选择
        </Text>
        <View className={styles.specList}>
          <View className={styles.specItem}>
            <Text className={styles.specLabel}>可选规格</Text>
            <View className={styles.specValue}>
              {product.sizes.map((size, idx) => (
                <Text
                  key={idx}
                  className={classnames(styles.sizeTag, selectedSize === size && styles.sizeTagActive)}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.secondaryBtn} onClick={handleCustom}>
          查看定制清单（{customList.length}）
        </View>
        <View className={styles.primaryBtn} onClick={handleAddToOrder}>
          加入定制清单
        </View>
      </View>
    </View>
  );
};

export default StyleDetailPage;
