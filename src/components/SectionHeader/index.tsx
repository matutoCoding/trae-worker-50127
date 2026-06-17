import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showMore?: boolean;
  moreText?: string;
  onMore?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  showMore = false,
  moreText = '更多',
  onMore
}) => {
  const handleMore = () => {
    if (onMore) {
      onMore();
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.titleWrap}>
        <View className={styles.decoration} />
        <Text className={styles.title}>{title}</Text>
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      </View>
      {showMore && (
        <View className={styles.more} onClick={handleMore}>
          <Text className={styles.moreText}>{moreText}</Text>
          <Text className={styles.arrow}>›</Text>
        </View>
      )}
    </View>
  );
};

export default SectionHeader;
