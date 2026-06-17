import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { products, categories, taboosList } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/SectionHeader';
import Tag from '@/components/Tag';
import classnames from 'classnames';
import styles from './index.module.scss';

const StylesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchText, setSearchText] = useState('');

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== '全部') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword) ||
        p.tags.some(t => t.toLowerCase().includes(keyword))
      );
    }
    return result;
  }, [activeCategory, searchText]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
  };

  const handleRefresh = () => {
    Taro.showToast({ title: '刷新成功', icon: 'success' });
    setTimeout(() => Taro.stopPullDownRefresh(), 500);
  };

  React.useEffect(() => {
    Taro.eventCenter.on('__taroPullDownRefresh', handleRefresh);
    return () => {
      Taro.eventCenter.off('__taroPullDownRefresh', handleRefresh);
    };
  }, []);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>福寿缘定制</Text>
        <Text className={styles.subtitle}>传承礼制 · 敬祖尽孝</Text>
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索款式、材质、标签..."
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
          confirmType="search"
        />
      </View>

      <ScrollView
        className={styles.categoryScroll}
        scrollX
        enhanced
        showScrollbar={false}
      >
        <View className={styles.categoryList}>
          {categories.map(cat => (
            <View
              key={cat}
              className={classnames(styles.categoryItem, activeCategory === cat && styles.categoryActive)}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </View>
          ))}
        </View>
      </ScrollView>

      <View className={styles.hotSection}>
        <View className={styles.bannerCard}>
          <Text className={styles.bannerTitle}>传统形制 · 匠心传承</Text>
          <Text className={styles.bannerDesc}>
            遵循古制 "五领三腰" 之礼，精选真丝、云锦等名贵面料，
            手工刺绣福寿纹样，让逝者尊荣往生，福佑后代子孙。
          </Text>
        </View>
      </View>

      <View className={styles.tradSection}>
        <SectionHeader title="避讳习俗" subtitle="传统礼制" />
        {taboosList.map((item, idx) => (
          <View key={idx} className={styles.tradCard}>
            <View className={styles.tradTitle}>
              <Text className={styles.tradTitleIcon}>📜</Text>
              <Text>{item.title}</Text>
            </View>
            <Text className={styles.tradContent}>{item.content}</Text>
          </View>
        ))}
      </View>

      <View className={styles.productGrid}>
        <SectionHeader title="款式精选" subtitle={`共 ${filteredProducts.length} 款`} />
        {filteredProducts.length > 0 ? (
          <View className={styles.grid}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无符合条件的款式</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default StylesPage;
