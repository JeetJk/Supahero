import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHeroes } from '../hooks/useHeroes';
import { useFavorites } from '../context/FavoritesContext';
import { HeroCard } from '../components/HeroCard';
import { SearchBar } from '../components/SearchBar';
import { FilterChips } from '../components/FilterChips';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorView } from '../components/ErrorView';
import { colors, spacing, borderRadius } from '../theme/colors';
import { Hero } from '../types/hero';

const ITEM_HEIGHT = 140; // 128px card + 12px margin

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    filteredHeroes,
    heroes,
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    selectedPublisher,
    setSelectedPublisher,
    selectedAlignment,
    setSelectedAlignment,
    showFavoritesOnly,
    setShowFavoritesOnly,
    onRefresh,
    onRetry,
    resetFilters,
  } = useHeroes();

  const { favorites } = useFavorites();

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  const handleToggleFavorites = useCallback(() => {
    setShowFavoritesOnly((prev) => !prev);
  }, [setShowFavoritesOnly]);

  const renderItem = useCallback(({ item }: { item: Hero }) => {
    return <HeroCard hero={item} />;
  }, []);

  const keyExtractor = useCallback((item: Hero) => item.id.toString(), []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return <ErrorView message={error} onRetry={onRetry} />;
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="search-outline" size={40} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>No Heroes Found</Text>
        <Text style={styles.emptySubtitle}>
          We could not find any superheroes matching your active filters.
        </Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <Text style={styles.resetButtonText}>Reset All Filters</Text>
        </TouchableOpacity>
      </View>
    );
  }, [isLoading, error, onRetry, resetFilters]);

  return (
    <View style={styles.container}>
      {/* Fixed Top Header: Won't jump or remount during search */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + spacing.sm }]}>
        {/* Brand Bar */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.brandTitle}>SUPERHERO HQ</Text>
              <Text style={styles.brandSubtitle}>
                Explore universe bios, powerstats & origins
              </Text>
            </View>
          </View>

          {/* Real-time Result Counter */}
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {isLoading ? '...' : `${filteredHeroes.length} / ${heroes.length}`}
            </Text>
          </View>
        </View>

        {/* High-performance Search Bar */}
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
          />
        </View>

        {/* Filter Pills */}
        <FilterChips
          selectedPublisher={selectedPublisher}
          onSelectPublisher={setSelectedPublisher}
          selectedAlignment={selectedAlignment}
          onSelectAlignment={setSelectedAlignment}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={handleToggleFavorites}
          favoritesCount={favorites.length}
        />
      </View>

      {/* Hero Cards List */}
      <FlatList
        data={isLoading || error ? [] : filteredHeroes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={filteredHeroes.length > 0 ? getItemLayout : undefined}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.card}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 1.1,
  },
  brandSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  counterBadge: {
    backgroundColor: colors.cardHighlight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.hero * 1.5,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cardHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  resetButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    backgroundColor: colors.cardHighlight,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  resetButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
