import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing } from '../theme/colors';
import { AlignmentFilter } from '../types/hero';

interface FilterChipsProps {
  selectedPublisher: string;
  onSelectPublisher: (pub: string) => void;
  selectedAlignment: AlignmentFilter;
  onSelectAlignment: (align: AlignmentFilter) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  favoritesCount: number;
}

const PUBLISHERS = [
  { label: 'All Publishers', value: 'all' },
  { label: 'Marvel', value: 'Marvel Comics' },
  { label: 'DC', value: 'DC Comics' },
  { label: 'Dark Horse', value: 'Dark Horse Comics' },
  { label: 'Other', value: 'Other' },
];

const ALIGNMENTS: { label: string; value: AlignmentFilter; color?: string }[] = [
  { label: 'All Alignments', value: 'all' },
  { label: 'Heroes', value: 'good', color: colors.good },
  { label: 'Villains', value: 'bad', color: colors.bad },
  { label: 'Neutral', value: 'neutral', color: colors.neutral },
];

export const FilterChips: React.FC<FilterChipsProps> = ({
  selectedPublisher,
  onSelectPublisher,
  selectedAlignment,
  onSelectAlignment,
  showFavoritesOnly,
  onToggleFavorites,
  favoritesCount,
}) => {
  const triggerHaptic = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
  };

  return (
    <View style={styles.container}>
      {/* Primary Row: Publishers & Favorites */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Favorites Chip */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            triggerHaptic();
            onToggleFavorites();
          }}
          style={[
            styles.chip,
            showFavoritesOnly && styles.chipActiveFavorites,
          ]}
        >
          <Ionicons
            name={showFavoritesOnly ? 'heart' : 'heart-outline'}
            size={14}
            color={showFavoritesOnly ? '#FFFFFF' : colors.heart}
            style={styles.chipIcon}
          />
          <Text
            style={[
              styles.chipText,
              showFavoritesOnly && styles.chipTextActive,
            ]}
          >
            Favorites {favoritesCount > 0 ? `(${favoritesCount})` : ''}
          </Text>
        </TouchableOpacity>

        {PUBLISHERS.map((item) => {
          const isActive = selectedPublisher === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic();
                onSelectPublisher(item.value);
              }}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Secondary Row: Alignment Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subScrollContent}
      >
        {ALIGNMENTS.map((item) => {
          const isActive = selectedAlignment === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic();
                onSelectAlignment(item.value);
              }}
              style={[
                styles.subChip,
                isActive && {
                  backgroundColor: item.color || colors.primary,
                  borderColor: item.color || colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.subChipText,
                  isActive && styles.subChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  subScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipActiveFavorites: {
    backgroundColor: colors.heart,
    borderColor: colors.heart,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#0A0D14',
    fontWeight: '700',
  },
  subChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  subChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  subChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
