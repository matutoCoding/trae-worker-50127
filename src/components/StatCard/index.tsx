import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;
  style?: React.CSSProperties;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, trend, style }) => {
  return (
    <View className={styles.card} style={style}>
      <Text className={styles.label}>{label}</Text>
      <View className={styles.valueRow}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {trend !== undefined && (
        <Text className={classnames(styles.trend, trend >= 0 ? styles.trendUp : styles.trendDown)}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </Text>
      )}
    </View>
  );
};

export default StatCard;
