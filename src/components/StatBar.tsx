import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, borderRadius } from '../theme/colors';

interface StatBarProps {
  label: string;
  value: number;
  color?: string;
  icon?: string;
  showBar?: boolean;
}

export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  color = colors.primary,
  showBar = true,
}) => {
  const [animatedWidth] = useState(() => new Animated.Value(0));
  const safeValue = Math.min(Math.max(value || 0, 0), 100);

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: safeValue,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [safeValue, animatedWidth]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{safeValue}</Text>
      </View>
      {showBar && (
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              {
                width: widthInterpolation,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  value: {
    fontSize: 13,
    fontWeight: '800',
  },
  track: {
    height: 7,
    backgroundColor: colors.cardHighlight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
