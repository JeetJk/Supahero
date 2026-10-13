import { useState, useEffect, useCallback, useMemo, useDeferredValue } from 'react';
import * as Haptics from 'expo-haptics';
import { Hero, AlignmentFilter } from '../types/hero';
import { fetchAllHeroes } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';

export function useHeroes() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('all');
  const [selectedAlignment, setSelectedAlignment] = useState<AlignmentFilter>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Use deferred value for high-performance non-blocking search filtering
  const deferredQuery = useDeferredValue(searchQuery);

  const { isFavorite } = useFavorites();

  const loadHeroes = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics fallback
      }
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchAllHeroes();
      // Pre-compute search index and stats for blazing-fast filtering and rendering
      const indexed: Hero[] = data.map((hero) => {
        const stats = hero.powerstats;
        const vals = Object.values(stats || {}).filter((v) => typeof v === 'number');
        const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        const searchKey = `${hero.name} ${hero.biography?.fullName || ''} ${hero.biography?.publisher || ''} ${hero.biography?.alterEgos || ''}`.toLowerCase();
        return {
          ...hero,
          _searchKey: searchKey,
          _avgPower: avg,
        };
      });
      setHeroes(indexed);
    } catch (err: any) {
      setError(err?.message || 'Failed to load superheroes. Please check connection and try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHeroes(false);
  }, [loadHeroes]);

  const onRefresh = useCallback(() => {
    return loadHeroes(true);
  }, [loadHeroes]);

  const onRetry = useCallback(() => {
    return loadHeroes(false);
  }, [loadHeroes]);

  // Distinct publishers
  const publishers = useMemo(() => {
    const pubSet = new Set<string>();
    heroes.forEach((h) => {
      const pub = h.biography?.publisher;
      if (pub && pub.trim()) pubSet.add(pub.trim());
    });
    const top = ['Marvel Comics', 'DC Comics', 'Dark Horse Comics'];
    const rest = Array.from(pubSet).filter((p) => !top.includes(p)).sort();
    return ['all', ...top, ...rest];
  }, [heroes]);

  // Filtered heroes with pre-indexed search
  const filteredHeroes = useMemo(() => {
    const query = deferredQuery.trim().toLowerCase();
    const hasQuery = query.length > 0;
    const isCustomPublisher = selectedPublisher !== 'all';
    const isOtherPublisher = selectedPublisher === 'Other';
    const topPubs = ['Marvel Comics', 'DC Comics', 'Dark Horse Comics'];
    const isCustomAlignment = selectedAlignment !== 'all';

    return heroes.filter((hero) => {
      // 1. Instant Search using pre-indexed string
      if (hasQuery) {
        if (!hero._searchKey?.includes(query)) {
          return false;
        }
      }

      // 2. Publisher filter
      if (isCustomPublisher) {
        if (isOtherPublisher) {
          if (topPubs.includes(hero.biography?.publisher || '')) {
            return false;
          }
        } else if (hero.biography?.publisher !== selectedPublisher) {
          return false;
        }
      }

      // 3. Alignment filter
      if (isCustomAlignment) {
        if (hero.biography?.alignment !== selectedAlignment) {
          return false;
        }
      }

      // 4. Favorites Only
      if (showFavoritesOnly) {
        if (!isFavorite(hero.id)) {
          return false;
        }
      }

      return true;
    });
  }, [heroes, deferredQuery, selectedPublisher, selectedAlignment, showFavoritesOnly, isFavorite]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedPublisher('all');
    setSelectedAlignment('all');
    setShowFavoritesOnly(false);
  }, []);

  return {
    heroes,
    filteredHeroes,
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
    publishers,
    onRefresh,
    onRetry,
    resetFilters,
  };
}
