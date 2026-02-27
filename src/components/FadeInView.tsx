import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, ViewStyle } from 'react-native';

type FadeInViewProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  fromOpacity?: number;
  fromTranslateY?: number;
};

export function FadeInView({
  children,
  delay = 0,
  duration = 400,
  style,
  fromOpacity = 0,
  fromTranslateY = 12,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(fromOpacity)).current;
  const translateY = useRef(new Animated.Value(fromTranslateY)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        delay,
        duration,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        delay,
        duration,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [opacity, translateY, delay, duration]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
