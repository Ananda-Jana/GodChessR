import { EsGameMeta } from './EsTypes';

// TODO: The author/owner can replace this with the direct novel URL on Scribble Hub
export const ES_SCRIBBLE_HUB_URL = 'https://www.scribblehub.com/';

export const ES_SAVE_KEY_PREFIX = 'endless_spring_save_v1_g';

export const ES_GAME_METADATA: Record<number, EsGameMeta> = {
  1: {
    id: 1,
    title: 'Light and Shadow Kingdom',
    arcName: 'Commemoration-Fractures Arc',
    chapterRange: 'Chapters 1-6',
    durationEstimate: '~15 min',
    spoilerWarning: 'Contains events from chapters 1-6',
    boardDescription: '8×8 board split by an advancing shadow line',
  },
  2: {
    id: 2,
    title: 'The Investigator',
    arcName: 'Commemoration-Fractures Arc',
    chapterRange: 'Chapters 7-12',
    durationEstimate: '~15 min',
    spoilerWarning: 'Contains events from chapters 7-12',
    boardDescription: '9×5 corridor with void chambers and exit gate',
  },
  3: {
    id: 3,
    title: 'No Way Back',
    arcName: 'The Anomalies Arc',
    chapterRange: 'Chapters 13-17',
    durationEstimate: '~15 min',
    spoilerWarning: 'Contains events from chapters 13-17',
    boardDescription: '3-stage escape: toroidal sea, rising ruins, fair gate',
  },
  4: {
    id: 4,
    title: 'The Fair and the Hotel',
    arcName: 'The Anomalies Arc',
    chapterRange: 'Chapters 18-24',
    durationEstimate: '~15 min',
    spoilerWarning: 'Contains events from chapters 18-24',
    boardDescription: '3 acts: flowing crowd, scarecrow flee puzzle, red door',
  },
  5: {
    id: 5,
    title: 'State One',
    arcName: 'State One Arc',
    chapterRange: 'Chapters 25-29',
    durationEstimate: '~15 min',
    spoilerWarning: 'Contains events from chapters 25-29',
    boardDescription: '3 phases: kin deception, library archive, odd-round boss',
  },
};
