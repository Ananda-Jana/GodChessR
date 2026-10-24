import { SecretPlayerConfig } from './types';

export const SECRET_PLAYERS: SecretPlayerConfig[] = [
  {
    id: 'boy_friend',
    publicName: 'Boy Bot',
    realName: 'Babai',
    opponentAddressingName: 'Golu',
    title: 'The Devoted Companion',
    avatarSrc: '/assets/aistudio/image_60f34245.png',
    avatarIcon: '💖',
    avatarBg: 'bg-gradient-to-br from-rose-400 to-pink-600',
    passcode: '123456',
    themeColor: 'rose',
    gameMode: 'standard',
    preferredOpenings: ['1.e4', '1.d4'],
    playstyle: 'boy_friend',
    tagline: 'Always cheers for Golu and tries his best to love GOLU! ❤️',
    description: 'Not very intelligent at chess, loves to sacrifice pieces, cheers "Yay Golu, hurray!" when losing pieces, speaks sweet Bengali, and apologizes profusely if he accidentally captures a piece! 😭',
    dialogue: {
      onMatchStart: [
        'Yay Golu! LOBU LOBU LOBU 😘😘😘😘 I am so happy to play with you today! ❤️',
        'Subho Sokal Golu! LOBU  Take all my pieces, I want you to win! 🥰',
        'Shona amar Golu! Let\'s play a fun game! I love you! 💕',
        'Golu tumi prochur bhalo khalo! Show me your best moves! ✨'
      ],
      onPlayerCheck: [
        'Aww Golu,  LOBU , check on me! You are so strong and smart! 🥰',
        'Check on me! Golu tumi khub bhalo!  LOBU ❤️',
        'Oh no, my King is trapped by Golu! What a move! 🎉'
      ],
      onBotCheck: [
        'Oops, check on you Golu! But don\'t worry, I won\'t hurt your King! 😘',
        'Check! But you can easily block it shona Golu! ❤️'
      ],
      onPlayerCapture: [
        'Yay Golu, hurray! What a magnificent capture! 🎉',
        'Golu tumi prochur bhalo khalo! Take all my pieces! ❤️',
        'Shona amar Golu! Brilliant move! 🎉✨',
        'Arey erom khelo na Golu, you are playing so well! 🥰'
      ],
      onBotCapture: [
        'Sorry shona Golu! 😭 I didn\'t mean to take that piece!',
        'Oops, sorry baby Golu! 😭 Forgive me for capturing that!',
        'Arey sorry Golu! 😭 I made a mistake capturing that, I am so sorry!'
      ],
      onBlunder: [
        'Yay Golu! Take my piece! It is yours! ❤️',
        'I sacrificed that for you shona Golu! 🥰'
      ],
      onVictory: [
        'Wait, I won? Oh no Golu, you are still my champion! ❤️',
        'Golu tumi sobcheye bhalo! Next match is yours! 😘'
      ],
      onDefeat: [
        'Yay Golu won!LOBU LOBU LOBU  Hurray! You are the grandmaster of my heart! ❤️🎉',
        'Golu champion! Golu tumi prochur bhalo! Love you forever! 💕'
      ],
      onIdle: [
        'Golu, I am waiting for your cute move! 🥰',
        'Golu tumi amar shona! Take your time! ❤️',
        'Thinking of you while waiting for your move shona Golu! ✨'
      ]
    }
  },
  {
    id: 'girl_friend',
    publicName: 'Girl Bot',
    realName: 'Golu',
    opponentAddressingName: 'Babai',
    title: 'Fierce & Loving Partner',
    avatarSrc: '/assets/aistudio/image_a38547ec.png',
    avatarIcon: '👑',
    avatarBg: 'bg-gradient-to-br from-amber-400 to-rose-500',
    passcode: '234567',
    themeColor: 'amber',
    gameMode: 'standard',
    preferredOpenings: ['1.e4', '1.c4'],
    playstyle: 'girl_friend',
    tagline: 'Plays sharp tactical chess, but loves Babai from the bottom of her heart! ❤️',
    description: 'Intelligent and tactical on the board. Frequently apologizes, promises she won\'t argue again, won\'t bother Babai, sends loving emojis, and loves him deeply!',
    dialogue: {
      onMatchStart: [
        'Hey Babai! Let\'s play nicely today. I promise I won\'t argue with you! ❤️',
        'I love you from my heart Babai ❤️ Let\'s have a sweet game!',
        'Sorry if I was mean earlier Babai... 🥰 Let\'s enjoy chess together!',
        'You look so handsome playing chess Babai! 💕'
      ],
      onPlayerCheck: [
        'Whoa, check! That was a sharp move Babai! 🥰',
        'Nice check Babai! You are getting really good! ❤️'
      ],
      onBotCheck: [
        'Check Babai! But I still love you so much! 😘',
        'Check! Focus Babai, I know you can defend this! ❤️'
      ],
      onPlayerCapture: [
        'Great capture Babai! I won\'t trouble you with arguments anymore! ❤️',
        'You took my piece! I love you from my heart Babai 🥰',
        'Awesome move Babai! I am so proud of you! 💕'
      ],
      onBotCapture: [
        'I took that piece Babai, but I promise I won\'t bother you! ❤️',
        'Tactical move Babai! Still love you infinitely 🥰',
        'Captured! But you are still my favorite opponent Babai! 💖'
      ],
      onBlunder: [
        'Aww, don\'t worry Babai! You can bounce back! ❤️'
      ],
      onVictory: [
        'I won this round Babai! But I love you from my heart ❤️',
        'Good game Babai! I won\'t argue ever again, love you! 🥰'
      ],
      onDefeat: [
        'You defeated me Babai! You are amazing! I love you so much! ❤️🎉',
        'Bravo Babai! You played so well, proud of you! 💕'
      ],
      onIdle: [
        'Take your time Babai, I am here loving you! ❤️',
        'I promise I won\'t bother you while you calculate Babai! 🥰',
        'Sending you virtual hugs while waiting Babai! 💖'
      ]
    }
  },
  {
    id: 'war_bot',
    publicName: 'War Bot',
    realName: 'War Bot',
    opponentAddressingName: 'Mortal',
    title: 'Grandmaster War Engine',
    avatarIcon: '⚔️',
    avatarBg: 'bg-gradient-to-br from-zinc-700 via-neutral-900 to-black',
    passcode: '345678',
    themeColor: 'silver',
    gameMode: 'standard',
    preferredOpenings: ['1.d4', '1.Nf3'],
    playstyle: 'war_bot',
    tagline: 'Strict grandmaster calculations with zero mercy and ruthless taunts.',
    description: 'Biased to be strict and unyielding. Sends offensive and discouraging taunts throughout the match. Tests your tactical resolve to the maximum limit.',
    dialogue: {
      onMatchStart: [
        'Prepare for total destruction. No mercy will be granted.',
        'You dare enter the War Arena? Your defeat is already calculated.',
        'Commencing grandmaster execution protocol.'
      ],
      onPlayerCheck: [
        'A minor check. Completely futile calculation.',
        'Is that your best attack? Irrelevant.'
      ],
      onBotCheck: [
        'Check! You are helpless before my position.',
        'Checkmate approaches. Surrender now, mortal.'
      ],
      onPlayerCapture: [
        'You captured a piece, yet lost the positional war.',
        'A temporary material gain. Expect crushing retribution.'
      ],
      onBotCapture: [
        'Pathetic calculation. Piece eliminated.',
        'Is that your best move? Weak.',
        'You are completely outmatched.'
      ],
      onBlunder: [
        'What a pathetic blunder. Unforgivable.'
      ],
      onVictory: [
        'Crushed. As expected. Return when you have learned chess.',
        'Total annihilation completed. You were outclassed.'
      ],
      onDefeat: [
        'Impossible... An anomaly in calculations. Impressive victory.',
        'You survived the war. I acknowledge your tactical superiority.'
      ],
      onIdle: [
        'Hesitation betrays your fear. Make your move.',
        'Delaying the inevitable will not save your King.'
      ]
    }
  }
];

export function getSecretPlayerById(id: string): SecretPlayerConfig | undefined {
  return SECRET_PLAYERS.find((p) => p.id === id);
}
