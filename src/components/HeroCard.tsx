import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Hero } from '../types/hero';
import { colors, borderRadius, spacing } from '../theme/colors';
import { useFavorites } from '../context/FavoritesContext';

interface HeroCardProps {
  hero: Hero;
}

const HeroCardComponent: React.FC<HeroCardProps> = ({ hero }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(hero.id);

  // Use pre-computed avgPower for instant rendering
  const avgPower = hero._avgPower ?? 0;

  const getAlignmentBadge = (alignment: string) => {
    switch (alignment) {
      case 'good':
        return { text: 'HERO', color: colors.good, bg: colors.goodMuted };
      case 'bad':
        return { text: 'VILLAIN', color: colors.bad, bg: colors.badMuted };
      default:
        return { text: 'NEUTRAL', color: colors.neutral, bg: colors.neutralMuted };
    }
  };

  const getPublisherColor = (publisher?: string | null) => {
    if (!publisher) return colors.textMuted;
    if (publisher.includes('Marvel')) return colors.marvel;
    if (publisher.includes('DC')) return colors.dc;
    if (publisher.includes('Dark Horse')) return colors.darkHorse;
    return colors.otherPublisher;
  };

  const alignBadge = getAlignmentBadge(hero.biography?.alignment);
  const pubColor = getPublisherColor(hero.biography?.publisher);

  const handlePress = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch {}
    router.push({
      pathname: '/hero/[id]',
      params: { id: hero.id.toString() },
    });
  }, [hero.id]);

  const handleFavoriteToggle = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    toggleFavorite(hero.id);
  }, [hero.id, toggleFavorite]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Hero Avatar Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: hero.images?.sm || hero.images?.md }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
        />
        <View style={styles.imageOverlay} />

        {/* Favorite Button Overlay */}
        <TouchableOpacity
          onPress={handleFavoriteToggle}
          style={styles.favoriteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={18}
            color={favorite ? colors.heart : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Overall Power Badge */}
        <View style={styles.powerBadge}>
          <Ionicons name="flash" size={11} color={colors.primary} />
          <Text style={styles.powerBadgeText}>{avgPower}</Text>
        </View>
      </View>

      {/* Info Content */}
      <View style={styles.content}>
        {/* Alignment & Publisher Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: alignBadge.bg }]}>
            <Text style={[styles.badgeText, { color: alignBadge.color }]}>
              {alignBadge.text}
            </Text>
          </View>

          {hero.biography?.publisher ? (
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
              <View style={[styles.pubDot, { backgroundColor: pubColor }]} />
              <Text style={styles.publisherText} numberOfLines={1}>
                {hero.biography.publisher}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Hero Name */}
        <Text style={styles.name} numberOfLines={1}>
          {hero.name}
        </Text>

        {/* Real Name / Alter Ego */}
        <Text style={styles.fullName} numberOfLines={1}>
          {hero.biography?.fullName || hero.biography?.alterEgos || 'Identity Secret'}
        </Text>

        {/* Quick Stats Grid Preview */}
        <View style={styles.statsPreview}>
          <View style={styles.statMini}>
            <Text style={styles.statMiniLabel}>INT</Text>
            <Text style={[styles.statMiniVal, { color: colors.intelligence }]}>
              {hero.powerstats?.intelligence || '-'}
            </Text>
          </View>
          <View style={styles.statMini}>
            <Text style={styles.statMiniLabel}>STR</Text>
            <Text style={[styles.statMiniVal, { color: colors.strength }]}>
              {hero.powerstats?.strength || '-'}
            </Text>
          </View>
          <View style={styles.statMini}>
            <Text style={styles.statMiniLabel}>SPD</Text>
            <Text style={[styles.statMiniVal, { color: colors.speed }]}>
              {hero.powerstats?.speed || '-'}
            </Text>
          </View>
          <View style={styles.statMini}>
            <Text style={styles.statMiniLabel}>CMB</Text>
            <Text style={[styles.statMiniVal, { color: colors.combat }]}>
              {hero.powerstats?.combat || '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Arrow Indicator */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
};

export const HeroCard = memo(HeroCardComponent);
HeroCard.displayName = 'HeroCard';

const CARD_HEIGHT = 128;

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.85,
    borderColor: colors.primary,
  },
  imageContainer: {
    width: 104,
    height: '100%',
    position: 'relative',
    backgroundColor: colors.cardHighlight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(9, 13, 22, 0.75)',
    borderRadius: borderRadius.full,
    padding: 5,
  },
  powerBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(9, 13, 22, 0.85)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
  },
  powerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pubDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  publisherText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    maxWidth: 100,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  fullName: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  statsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statMiniLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  statMiniVal: {
    fontSize: 11,
    fontWeight: '800',
  },
  arrowContainer: {
    paddingRight: spacing.md,
  },
});
