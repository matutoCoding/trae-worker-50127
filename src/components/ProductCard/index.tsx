import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Product } from '@/types';
import Tag from '@/components/Tag';
import { formatPrice } from '@/utils';
import styles from './index.module.scss';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/style-detail/index?id=${product.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.imageWrap}>
        <Image
          className={styles.image}
          src={product.image}
          mode="aspectFill"
        />
        <View className={styles.tagWrap}>
          {product.isHot && <Tag text="热销" type="hot" />}
          {product.isNew && <Tag text="新品" type="new" />}
        </View>
      </View>
      <View className={styles.content}>
        <Text className={styles.name}>{product.name}</Text>
        <Text className={styles.desc}>{product.description}</Text>
        <View className={styles.tagList}>
          {product.tags.slice(0, 2).map((tag, idx) => (
            <Tag key={idx} text={tag} type="outline" />
          ))}
        </View>
        <View className={styles.bottom}>
          <View className={styles.priceWrap}>
            <Text className={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && (
              <Text className={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            )}
          </View>
          <Text className={styles.stock}>库存 {product.stock}</Text>
        </View>
      </View>
    </View>
  );
};

export default ProductCard;
