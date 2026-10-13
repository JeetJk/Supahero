import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Hero } from '../../types/hero';
import { fetchHeroById } from '../../services/api';
import { useFavorites } from '../../context/FavoritesContext';
import { StatBar } from '../../components/StatBar';
import { colors, spacing, borderRadius } from '../../theme/colors';

export default function HeroDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [hero, setHero] = useState<Hero | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const favorite = hero ? isFavorite(hero.id) : false;

  const loadHeroDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHeroById(id);
      setHero(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load superhero details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadHeroDetails();
  }, [loadHeroDetails]);

  const handleToggleFavorite = () => {
    if (!hero) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    toggleFavorite(hero.id);
  };

  const handleShare = async () => {
    if (!hero) return;
    try {
      await Share.share({
        message: `Check out ${hero.name} (${hero.biography?.fullName || 'Superhero'}) on SuperheroHQ!`,
      });
    } catch {}
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Accessing hero database...</Text>
      </View>
    );
  }

  if (error || !hero) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={54} color={colors.bad} />
        <Text style={styles.errorTitle}>Classified Hero Not Found</Text>
        <Text style={styles.errorText}>{error || 'Could not find details for this character.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadHeroDetails}>
          <Text style={styles.retryBtnText}>Retry Connection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtnFallback} onPress={() => router.back()}>
          <Text style={styles.backBtnFallbackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { powerstats, appearance, biography, work, connections } = hero;

  // Calculate overall rating
  const statValues = Object.values(powerstats || {}).filter((v) => typeof v === 'number');
  const powerAvg = statValues.length > 0
    ? Math.round(statValues.reduce((a, b) => a + b, 0) / statValues.length)
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.hero }}
      >
        {/* Hero Visual Header Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: hero.images?.lg || hero.images?.md }}
            style={styles.bannerImage}
            contentFit="cover"
            priority="high"
          />
          <LinearGradient
            colors={['transparent', 'rgba(9, 13, 22, 0.4)', colors.background]}
            style={styles.gradient}
          />

          {/* Floating Navigation Controls */}
          <View style={[styles.headerActions, { top: insets.top + 8 }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.actionCircle}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.rightActions}>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.actionCircle}
                activeOpacity={0.8}
              >
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleToggleFavorite}
                style={styles.actionCircle}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={favorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={favorite ? colors.heart : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Header Title & Badges */}
          <View style={styles.heroHeaderInfo}>
            <View style={styles.badgeRow}>
              {biography?.publisher && (
                <View style={styles.publisherBadge}>
                  <Text style={styles.publisherBadgeText}>{biography.publisher}</Text>
                </View>
              )}
              <View
                style={[
                  styles.alignmentBadge,
                  {
                    backgroundColor:
                      biography?.alignment === 'good'
                        ? colors.goodMuted
                        : biography?.alignment === 'bad'
                        ? colors.badMuted
                        : colors.neutralMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.alignmentBadgeText,
                    {
                      color:
                        biography?.alignment === 'good'
                          ? colors.good
                          : biography?.alignment === 'bad'
                          ? colors.bad
                          : colors.neutral,
                    },
                  ]}
                >
                  {(biography?.alignment || 'UNKNOWN').toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.heroName}>{hero.name}</Text>
            {biography?.fullName ? (
              <Text style={styles.heroRealName}>{biography.fullName}</Text>
            ) : null}
          </View>
        </View>

        {/* Overall Power Level Banner */}
        <View style={styles.sectionCard}>
          <View style={styles.powerIndexRow}>
            <View>
              <Text style={styles.powerIndexLabel}>OVERALL COMBAT RATING</Text>
              <Text style={styles.powerIndexSub}>Composite power rating scale</Text>
            </View>
            <View style={styles.powerIndexScoreBox}>
              <Ionicons name="flash" size={18} color={colors.primary} />
              <Text style={styles.powerIndexScore}>{powerAvg}</Text>
              <Text style={styles.powerIndexMax}>/100</Text>
            </View>
          </View>
        </View>

        {/* Detailed Powerstats Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Power Attributes</Text>
          </View>
          <View style={styles.statsList}>
            <StatBar
              label="Intelligence"
              value={powerstats?.intelligence}
              color={colors.intelligence}
            />
            <StatBar
              label="Strength"
              value={powerstats?.strength}
              color={colors.strength}
            />
            <StatBar
              label="Speed"
              value={powerstats?.speed}
              color={colors.speed}
            />
            <StatBar
              label="Durability"
              value={powerstats?.durability}
              color={colors.durability}
            />
            <StatBar
              label="Energy Power"
              value={powerstats?.power}
              color={colors.power}
            />
            <StatBar
              label="Combat Proficiency"
              value={powerstats?.combat}
              color={colors.combat}
            />
          </View>
        </View>

        {/* Biographical Dossier */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={18} color={colors.accent} />
            <Text style={styles.sectionTitle}>Biographical Dossier</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alter Egos</Text>
            <Text style={styles.infoValue}>{biography?.alterEgos || 'None'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Place of Birth</Text>
            <Text style={styles.infoValue}>{biography?.placeOfBirth || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>First Appearance</Text>
            <Text style={styles.infoValue}>{biography?.firstAppearance || '-'}</Text>
          </View>

          {biography?.aliases && biography.aliases.length > 0 && (
            <View style={styles.aliasesContainer}>
              <Text style={styles.infoLabel}>Known Aliases</Text>
              <View style={styles.aliasChips}>
                {biography.aliases.map((alias, idx) => (
                  <View key={idx} style={styles.aliasChip}>
                    <Text style={styles.aliasText}>{alias}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Appearance & Physical Traits */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="body-outline" size={18} color="#34D399" />
            <Text style={styles.sectionTitle}>Physical Attributes</Text>
          </View>

          <View style={styles.grid2x2}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Gender</Text>
              <Text style={styles.gridValue}>{appearance?.gender || '-'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Race</Text>
              <Text style={styles.gridValue}>{appearance?.race || '-'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Height</Text>
              <Text style={styles.gridValue}>
                {appearance?.height?.filter((h) => h !== '-').join(' / ') || '-'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Weight</Text>
              <Text style={styles.gridValue}>
                {appearance?.weight?.filter((w) => w !== '-').join(' / ') || '-'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Eye Color</Text>
              <Text style={styles.gridValue}>{appearance?.eyeColor || '-'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Hair Color</Text>
              <Text style={styles.gridValue}>{appearance?.hairColor || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Work & Affiliation */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase-outline" size={18} color="#FBBF24" />
            <Text style={styles.sectionTitle}>Work & Connections</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Occupation</Text>
            <Text style={styles.infoValue}>{work?.occupation || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Operational Base</Text>
            <Text style={styles.infoValue}>{work?.base || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Group Affiliation</Text>
            <Text style={styles.infoValue}>{connections?.groupAffiliation || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Relatives</Text>
            <Text style={styles.infoValue}>{connections?.relatives || '-'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.md,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  retryBtnText: {
    color: '#0A0D14',
    fontWeight: '700',
  },
  backBtnFallback: {
    padding: spacing.sm,
  },
  backBtnFallbackText: {
    color: colors.textSecondary,
  },
  bannerContainer: {
    height: 380,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  headerActions: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  rightActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(9, 13, 22, 0.75)',
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeaderInfo: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  publisherBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  publisherBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  alignmentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  alignmentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  heroName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heroRealName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  powerIndexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  powerIndexLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  powerIndexSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  powerIndexScoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.cardHighlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  powerIndexScore: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    marginLeft: 4,
  },
  powerIndexMax: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginLeft: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  statsList: {
    gap: spacing.xs,
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  aliasesContainer: {
    marginTop: 2,
  },
  aliasChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  aliasChip: {
    backgroundColor: colors.cardHighlight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  aliasText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: '47%',
    backgroundColor: colors.cardHighlight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
});
