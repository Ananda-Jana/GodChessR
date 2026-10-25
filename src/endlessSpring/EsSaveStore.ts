import { ES_SAVE_KEY_PREFIX } from './EsConfig';
import { EsGameId, EsGameState } from './EsTypes';

export function esGetSaveKey(gameId: EsGameId): string {
  return `${ES_SAVE_KEY_PREFIX}${gameId}`;
}

export function esSaveGameState(state: EsGameState): boolean {
  try {
    const key = esGetSaveKey(state.gameId);
    const payload = JSON.stringify({
      version: 1,
      state,
      timestamp: Date.now(),
    });
    localStorage.setItem(key, payload);
    return true;
  } catch (err) {
    // Saving never throws
    return false;
  }
}

export function esLoadGameState(gameId: EsGameId): EsGameState | null {
  try {
    const key = esGetSaveKey(gameId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1 && parsed.state && parsed.state.gameId === gameId) {
      return parsed.state as EsGameState;
    }
  } catch (err) {
    // Invalid save silently ignored
  }
  return null;
}

export function esClearSave(gameId: EsGameId): void {
  try {
    const key = esGetSaveKey(gameId);
    localStorage.removeItem(key);
  } catch (err) {}
}

export function esHasSave(gameId: EsGameId): boolean {
  try {
    const key = esGetSaveKey(gameId);
    return !!localStorage.getItem(key);
  } catch {
    return false;
  }
}
