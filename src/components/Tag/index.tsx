import React from 'react';
import { Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface TagProps {
  text: string;
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'hot' | 'new' | 'gold' | 'outline';
  style?: React.CSSProperties;
}

const Tag: React.FC<TagProps> = ({ text, type = 'primary', style }) => {
  return (
    <Text
      className={classnames(styles.tag, styles[type])}
      style={style}
    >
      {text}
    </Text>
  );
};

export default Tag;
