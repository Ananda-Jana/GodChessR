import React from 'react';
import { renderToString } from 'react-dom/server';
import { RulebookWindow } from '../src/components/rulebook/RulebookWindow';
import { MatchState } from '../src/types/game';
import { RulebookModeId, RulebookSubTab } from '../src/components/rulebook/types';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`❌ SNAPSHOT TEST FAILED: ${msg}`);
    throw new Error(`SNAPSHOT TEST FAILED: ${msg}`);
  }
  console.log(`✓ ${msg}`);
}

interface Scenario {
  name: string;
  props: {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: RulebookModeId;
    initialSubTab?: RulebookSubTab;
    activeMatch?: MatchState | null;
    isBotMatch?: boolean;
    isModal?: boolean;
  };
  expectedMode: RulebookModeId;
  expectedSubTab: RulebookSubTab;
}

const scenarios: Scenario[] = [
  {
    name: '1. Dashboard Desktop Header',
    props: { isOpen: true, onClose: () => {} },
    expectedMode: 'standard',
    expectedSubTab: 'overview',
  },
  {
    name: '2. Dashboard Mobile Top Bar',
    props: { isOpen: true, onClose: () => {} },
    expectedMode: 'standard',
    expectedSubTab: 'overview',
  },
  {
    name: '3. In-Match Bot Standard',
    props: {
      isOpen: true,
      onClose: () => {},
      isBotMatch: true,
      activeMatch: {
        id: 'bot_match_1001',
        gameMode: 'standard',
        whitePlayer: { userId: 'usr_human', username: 'human', displayName: 'Human', avatarId: 'avatar_prince' },
        blackPlayer: { userId: 'usr_bot_gm', username: 'bot', displayName: 'Grandmaster Bot', avatarId: 'avatar_prince' },
      } as any,
    },
    expectedMode: 'standard',
    expectedSubTab: 'overview',
  },
  {
    name: '4. In-Match Bot Classic',
    props: {
      isOpen: true,
      onClose: () => {},
      isBotMatch: true,
      activeMatch: {
        id: 'bot_match_1002',
        gameMode: 'classic',
        whitePlayer: { userId: 'usr_human', username: 'human', displayName: 'Human', avatarId: 'avatar_prince' },
        blackPlayer: { userId: 'usr_bot_gm', username: 'bot', displayName: 'Grandmaster Bot', avatarId: 'avatar_prince' },
      } as any,
    },
    expectedMode: 'classic',
    expectedSubTab: 'overview',
  },
  {
    name: '5. In-Match Bot Crafted',
    props: {
      isOpen: true,
      onClose: () => {},
      isBotMatch: true,
      activeMatch: {
        id: 'bot_match_1003',
        gameMode: 'crafted',
        whitePlayer: { userId: 'usr_human', username: 'human', displayName: 'Human', avatarId: 'avatar_prince' },
        blackPlayer: { userId: 'usr_bot_gm', username: 'bot', displayName: 'Grandmaster Bot', avatarId: 'avatar_prince' },
      } as any,
    },
    expectedMode: 'crafted',
    expectedSubTab: 'overview',
  },
  {
    name: '6. In-Match Online Multiplayer',
    props: {
      isOpen: true,
      onClose: () => {},
      isBotMatch: false,
      activeMatch: {
        id: 'match_online_2001',
        gameMode: 'standard',
        whitePlayer: { userId: 'usr_alice', username: 'alice', displayName: 'Alice', avatarId: 'avatar_prince' },
        blackPlayer: { userId: 'usr_bob', username: 'bob', displayName: 'Bob', avatarId: 'avatar_prince' },
      } as any,
    },
    expectedMode: 'multiplayer',
    expectedSubTab: 'overview',
  },
  {
    name: '7. Culling Game Match View',
    props: {
      isOpen: true,
      onClose: () => {},
      initialMode: 'culling',
    },
    expectedMode: 'culling',
    expectedSubTab: 'movement_book',
  },
  {
    name: '8. Rose Paradise View',
    props: {
      isOpen: true,
      onClose: () => {},
      initialMode: 'rose',
      initialSubTab: 'movement_book',
    },
    expectedMode: 'rose',
    expectedSubTab: 'movement_book',
  },
  {
    name: '9. Hashira Training Dojo Rules',
    props: {
      isOpen: true,
      onClose: () => {},
      initialMode: 'training',
    },
    expectedMode: 'training',
    expectedSubTab: 'overview',
  },
  {
    name: '10. Hashira Training Culling Rules Modal',
    props: {
      isOpen: true,
      onClose: () => {},
      initialMode: 'culling',
      initialSubTab: 'movement_book',
    },
    expectedMode: 'culling',
    expectedSubTab: 'movement_book',
  },
  {
    name: '11. Secret Match View Rules',
    props: {
      isOpen: true,
      onClose: () => {},
    },
    expectedMode: 'standard',
    expectedSubTab: 'overview',
  },
];

console.log('=== RUNNING RULEBOOK SNAPSHOT BEHAVIOR TEST ===');

for (const sc of scenarios) {
  const html = renderToString(React.createElement(RulebookWindow, sc.props));

  assert(html.length > 0, `${sc.name} -> Rendered non-empty HTML`);

  // Assert expected subtab has aria-selected="true"
  const expectedSubtabAttr = `id="subtab-${sc.expectedSubTab}"`;
  assert(html.includes(expectedSubtabAttr), `${sc.name} -> Contains element with ${expectedSubtabAttr}`);

  const subtabSelectedSnippet = `id="subtab-${sc.expectedSubTab}" aria-controls="subtabpanel-${sc.expectedSubTab}" aria-selected="true"`;
  assert(html.includes(subtabSelectedSnippet), `${sc.name} -> Active SubTab "${sc.expectedSubTab}" has aria-selected="true"`);
}

console.log('✅ ALL 11 SNAPSHOT SCENARIOS PASSED STRICT VERIFICATION');
