import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, borderRadius, spacing } from '../theme/colors';

export const LoadingSkeleton: React.FC = () => {
  const [pulseAnim] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const items = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {items.map((key) => (
        <Animated.View
          key={key}
          style={[styles.skeletonCard, { opacity: pulseAnim }]}
        >
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonBadge} />
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSubtitle} />
            <View style={styles.skeletonStatsRow} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    height: 128,
  },
  skeletonImage: {
    width: 104,
    height: '100%',
    backgroundColor: colors.skeletonHighlight,
  },
  skeletonContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  skeletonBadge: {
    width: 70,
    height: 14,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.skeletonHighlight,
  },
  skeletonTitle: {
    width: '60%',
    height: 20,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.skeletonHighlight,
  },
  skeletonSubtitle: {
    width: '40%',
    height: 12,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.skeletonHighlight,
  },
  skeletonStatsRow: {
    width: '80%',
    height: 16,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.skeletonHighlight,
  },
});
