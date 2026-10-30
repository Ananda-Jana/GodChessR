import { CollectibleHeroCard } from '../types/cardTypes';

const DB_NAME = 'HeroDuelCardsDB';
const DB_VERSION = 1;
const STORE_NAME = 'hero_cards';
const LOCAL_STORAGE_KEY = 'mugen_hero_duel_cards';

let idbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (idbPromise) return idbPromise;

  idbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'code' });
        store.createIndex('heroId', 'heroId', { unique: false });
        store.createIndex('rarity', 'rarity', { unique: false });
        store.createIndex('mintedAt', 'mintedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return idbPromise;
}

/**
 * Saves card to IndexedDB and syncs to localStorage backup
 */
export async function saveCardToCollection(card: CollectibleHeroCard): Promise<void> {
  // Sync to localStorage
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const list: CollectibleHeroCard[] = existingRaw ? JSON.parse(existingRaw) : [];
    if (!list.some((c) => c.code === card.code)) {
      list.unshift(card);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
    }
  } catch {}

  // Save to IndexedDB
  try {
    const db = await getDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(card);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {}
}

/**
 * Retrieves all earned cards
 */
export async function getCardCollection(): Promise<CollectibleHeroCard[]> {
  try {
    const db = await getDb();
    const cards = await new Promise<CollectibleHeroCard[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (cards.length > 0) {
      return cards.sort((a, b) => b.mintedAt - a.mintedAt);
    }
  } catch {}

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed: CollectibleHeroCard[] = JSON.parse(raw);
      return parsed.sort((a, b) => b.mintedAt - a.mintedAt);
    }
  } catch {}

  return [];
}

/**
 * Exports collection as JSON string
 */
export async function exportCollectionAsJson(): Promise<string> {
  const cards = await getCardCollection();
  return JSON.stringify(
    {
      app: 'MugenChessX - Hero Duel',
      version: 1,
      exportedAt: Date.now(),
      cardsCount: cards.length,
      cards,
    },
    null,
    2
  );
}

/**
 * Imports cards from JSON string
 */
export async function importCollectionFromJson(jsonString: string): Promise<number> {
  try {
    const data = JSON.parse(jsonString);
    const cards: CollectibleHeroCard[] = Array.isArray(data.cards) ? data.cards : [];
    let count = 0;
    for (const card of cards) {
      if (card.code && card.heroId && card.rarity) {
        await saveCardToCollection(card);
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}
