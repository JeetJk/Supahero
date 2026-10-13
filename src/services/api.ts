import { Hero } from '../types/hero';

const API_BASE = 'https://akabab.github.io/superhero-api/api';
const TIMEOUT_MS = 10000;

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Fetch all superheroes from the public API
 */
export async function fetchAllHeroes(): Promise<Hero[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/all.json`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(`Failed to fetch superheroes (${response.status} ${response.statusText})`, response.status);
    }

    const data: Hero[] = await response.json();
    if (!Array.isArray(data)) {
      throw new ApiError('Unexpected response format received from server');
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('Network request timed out. Please check your internet connection.');
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err?.message || 'Unable to load superheroes. Please check your connection.');
  }
}

/**
 * Fetch a single hero by ID
 */
export async function fetchHeroById(id: number | string): Promise<Hero> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/id/${id}.json`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(`Failed to fetch hero details (${response.status})`, response.status);
    }

    const hero: Hero = await response.json();
    return hero;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out while fetching superhero details.');
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err?.message || 'Unable to fetch superhero details.');
  }
}
