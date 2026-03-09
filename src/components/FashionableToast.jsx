import React from 'react';
import { Text, View } from 'react-native';
import { getToastTypeConfig, styles } from './FashionableToast.styles';

export function FashionableToast({ text1, text2, type, ...rest }) {
  const config = getToastTypeConfig(type);
  return (
    <View style={[styles.wrap, { backgroundColor: config.bg }]} {...rest}>
      <View style={[styles.strip, { backgroundColor: config.color }]} />
      <View style={styles.body}>
        <View style={[styles.iconCircle, { backgroundColor: config.soft, borderColor: config.color }]}>
          <Text style={[styles.iconText, { color: config.color }]}>{config.icon}</Text>
        </View>
        <View style={styles.content}>
          {text1 ? <Text style={styles.text1} numberOfLines={1}>{text1}</Text> : null}
          {text2 ? <Text style={styles.text2} numberOfLines={2}>{text2}</Text> : null}
        </View>
      </View>
    </View>
  );
}
