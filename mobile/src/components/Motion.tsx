import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

export function FadeSlide({
  children,
  delay = 0,
  offset = 14,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  offset?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offset)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, friction: 8, tension: 70, useNativeDriver: true }),
    ]).start();
  }, [delay, opacity, translateY]);

  return <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
}

export function ScalePress({
  children,
  onPress,
  style,
  scaleTo = 0.96,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const anim = (toValue: number) =>
    Animated.spring(scale, { toValue, friction: 6, tension: 180, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={() => anim(scaleTo)} onPressOut={() => anim(1)} style={style}>
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}

const BUBBLE_SPECS = [
  { left: '5%' as const, size: 16, duration: 5400, startPhase: 0.08, drift: 12, maxOpacity: 0.42 },
  { left: '12%' as const, size: 26, duration: 7200, startPhase: 0.45, drift: -16, maxOpacity: 0.28 },
  { left: '19%' as const, size: 13, duration: 4800, startPhase: 0.78, drift: 10, maxOpacity: 0.48 },
  { left: '26%' as const, size: 22, duration: 6500, startPhase: 0.22, drift: -14, maxOpacity: 0.34 },
  { left: '34%' as const, size: 28, duration: 7800, startPhase: 0.62, drift: 18, maxOpacity: 0.24 },
  { left: '41%' as const, size: 14, duration: 5000, startPhase: 0.91, drift: -9, maxOpacity: 0.46 },
  { left: '48%' as const, size: 20, duration: 6100, startPhase: 0.34, drift: 14, maxOpacity: 0.36 },
  { left: '55%' as const, size: 12, duration: 4600, startPhase: 0.14, drift: -10, maxOpacity: 0.5 },
  { left: '62%' as const, size: 25, duration: 7000, startPhase: 0.72, drift: 15, maxOpacity: 0.3 },
  { left: '69%' as const, size: 17, duration: 5700, startPhase: 0.51, drift: -12, maxOpacity: 0.4 },
  { left: '76%' as const, size: 24, duration: 6800, startPhase: 0.04, drift: 14, maxOpacity: 0.32 },
  { left: '83%' as const, size: 15, duration: 5200, startPhase: 0.85, drift: -11, maxOpacity: 0.44 },
  { left: '90%' as const, size: 21, duration: 6300, startPhase: 0.39, drift: 12, maxOpacity: 0.35 },
  { left: '16%' as const, size: 18, duration: 5900, startPhase: 0.58, drift: 13, maxOpacity: 0.38 },
  { left: '38%' as const, size: 15, duration: 5300, startPhase: 0.29, drift: -10, maxOpacity: 0.42 },
  { left: '59%' as const, size: 19, duration: 6000, startPhase: 0.82, drift: 11, maxOpacity: 0.36 },
  { left: '79%' as const, size: 27, duration: 7500, startPhase: 0.66, drift: -15, maxOpacity: 0.26 },
  { left: '93%' as const, size: 13, duration: 4900, startPhase: 0.19, drift: -8, maxOpacity: 0.48 },
];

function Bubble({ spec, height }: { spec: (typeof BUBBLE_SPECS)[number]; height: number }) {
  const progress = useRef(new Animated.Value(spec.startPhase)).current;

  useEffect(() => {
    let active = true;

    const run = (fromPhase: number) => {
      if (!active) return;
      progress.setValue(fromPhase);
      Animated.timing(progress, {
        toValue: 1,
        duration: Math.max(300, Math.round(spec.duration * (1 - fromPhase))),
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && active) {
          run(0);
        }
      });
    };

    run(spec.startPhase);

    return () => {
      active = false;
      progress.stopAnimation();
    };
  }, [progress, spec.duration, spec.startPhase]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height + spec.size, -spec.size * 2],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, spec.drift, 0, -spec.drift * 0.7, 0],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.1, 0.85, 1],
    outputRange: [0, spec.maxOpacity, spec.maxOpacity * 0.8, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.85, 1, 1.12],
  });

  const glossSize = Math.max(3, Math.round(spec.size * 0.28));

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: spec.left,
        top: 0,
        width: spec.size,
        height: spec.size,
        borderRadius: spec.size / 2,
        backgroundColor: '#CFA052',
        opacity,
        transform: [{ translateY }, { translateX }, { scale }],
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: Math.round(spec.size * 0.18),
          left: Math.round(spec.size * 0.2),
          width: glossSize,
          height: glossSize,
          borderRadius: glossSize / 2,
          backgroundColor: '#FFF4DC',
          opacity: 0.75,
        }}
      />
    </Animated.View>
  );
}

export function BeerBubbles() {
  const { height } = useWindowDimensions();
  const safeHeight = height || 800;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {BUBBLE_SPECS.map((spec, idx) => (
        <Bubble key={idx} spec={spec} height={safeHeight} />
      ))}
    </View>
  );
}
