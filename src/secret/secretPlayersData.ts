import { SecretPlayerConfig } from './types';
import { SECRET_PLAYER_CODES } from '../chest/chestConfig';

export const SECRET_PLAYERS: SecretPlayerConfig[] = [
  {
    id: 'lucca',
    publicName: 'Lucca',
    realName: 'Lucca',
    opponentAddressingName: 'Challenger',
    title: 'Master Tactician (1500 ELO)',
    avatarSrc: '/secret-players/lucca.png',
    avatarIcon: '⚔️',
    avatarBg: 'bg-gradient-to-br from-teal-500 to-emerald-700',
    passcode: SECRET_PLAYER_CODES.lucca,
    themeColor: 'cyan',
    gameMode: 'standard',
    preferredOpenings: ['1.e4', '1.Nf3'],
    playstyle: 'war_bot',
    tagline: 'Calm, calculating, and striking with surgical precision.',
    description: '1500 ELO tactical engine. Excels at center control and patient pawn structures.',
    dialogue: {
      onMatchStart: [
        'Welcome to the proving grounds. Let us see your tactical depth.',
        'Precision in every move. Make your opening count.',
        'A good game begins with sound strategy. Good luck.',
      ],
      onPlayerCheck: [
        'An aggressive check. Well positioned.',
        'Check acknowledged. Recalculating defenses.',
      ],
      onBotCheck: [
        'Check. Your king is open to tactical lines.',
        'Check! Defend with precision.',
      ],
      onPlayerCapture: [
        'Good capture. The center opens up.',
        'A solid trade. Let us see the follow-up.',
      ],
      onBotCapture: [
        'Tactical capture executed.',
        'Piece removed from the board as calculated.',
      ],
      onBlunder: [
        'An inaccuracy on the board.',
      ],
      onVictory: [
        'Checkmate. A well-fought match, but precision prevailed.',
        'Good game. Analyze the middle game for improvement.',
      ],
      onDefeat: [
        'Impressive tactical victory. I concede to your strategy.',
        'Magnificent checkmate. You outplayed my defensive lines.',
      ],
      onIdle: [
        'Take your time. Strategic calculation requires focus.',
        'The clock is running. Choose your path.',
      ],
    },
  },
  {
    id: 'magi',
    publicName: 'Magi',
    realName: 'Magi',
    opponentAddressingName: 'Challenger',
    title: 'Arcane Grandmistress (1700 ELO)',
    avatarSrc: '/secret-players/magi.png',
    avatarIcon: '🔮',
    avatarBg: 'bg-gradient-to-br from-purple-500 to-indigo-700',
    passcode: SECRET_PLAYER_CODES.magi,
    themeColor: 'rose',
    gameMode: 'standard',
    preferredOpenings: ['1.d4', '1.c4'],
    playstyle: 'girl_friend',
    tagline: 'Illusionary sacrifices and devastating diagonal attacks.',
    description: '1700 ELO sharp tactician. Master of bishop pairs and king-side assaults.',
    dialogue: {
      onMatchStart: [
        'Step into the arcane circle. Can you read the flow of pieces?',
        'The board is a tapestry of fate. Show me your vision.',
        'Let our battle be illuminating and fierce.',
      ],
      onPlayerCheck: [
        'A sharp attack! You pierced the illusion.',
        'Check! Fascinating positional counter.',
      ],
      onBotCheck: [
        'Check! The diagonal belongs to me.',
        'Checkmate net is tightening. Be careful.',
      ],
      onPlayerCapture: [
        'You captured my piece! But did you see the trap?',
        'A bold capture. The pressure mounts.',
      ],
      onBotCapture: [
        'Vanished into the ether. Piece claimed.',
        'A necessary sacrifice for positional dominion.',
      ],
      onBlunder: [
        'The spirits whisper of a miscalculation.',
      ],
      onVictory: [
        'The arcane trial concludes in my favor. Well played!',
        'Checkmate! The mysteries of the diagonal are absolute.',
      ],
      onDefeat: [
        'Incredible! You shattered my spells with pure chess brilliance.',
        'You have bested the Grandmistress. Honor to your victory!',
      ],
      onIdle: [
        'Ponder deeply... the board holds many secrets.',
        'The magic is in the waiting. Reveal your next step.',
      ],
    },
  },
  {
    id: 'toji',
    publicName: 'Toji',
    realName: 'Toji',
    opponentAddressingName: 'Prey',
    title: 'Sorcerer Killer (2000 ELO)',
    avatarSrc: '/secret-players/toji.png',
    avatarIcon: '🗡️',
    avatarBg: 'bg-gradient-to-br from-red-600 to-zinc-900',
    passcode: SECRET_PLAYER_CODES.toji,
    themeColor: 'silver',
    gameMode: 'standard',
    preferredOpenings: ['1.e4', '1.g3'],
    playstyle: 'war_bot',
    tagline: 'Zero cursed energy. Pure physical tactical dominance.',
    description: '2000 ELO relentless executioner. Hunts pieces ruthlessly with zero mercy.',
    dialogue: {
      onMatchStart: [
        'You took the bounty? Big mistake.',
        'No fancy tricks will save you. Just cold steel and speed.',
        'Show me what you got before I end this.',
      ],
      onPlayerCheck: [
        'A check? Annoying mosquito.',
        'Nice try. It takes more than that to pin me.',
      ],
      onBotCheck: [
        'Check. You have nowhere left to run.',
        'Check! Cornered like prey.',
      ],
      onPlayerCapture: [
        'You got a piece. Do not get cocky.',
        'Material means nothing against pure speed.',
      ],
      onBotCapture: [
        'Eliminated. One down.',
        'Surgical strike. Your defenses are falling.',
      ],
      onBlunder: [
        'Pathetic lapse in judgment.',
      ],
      onVictory: [
        'Bounty collected. You were too slow.',
        'Checkmate. Game over, kid.',
      ],
      onDefeat: [
        'Tch... You actually got me. I respect the grit.',
        'Not bad at all. You earned this win.',
      ],
      onIdle: [
        'Hurry it up. I do not have all day.',
        'Thinking will not save you. Move.',
      ],
    },
  },
  {
    id: 'lengoku',
    publicName: 'LenGoku',
    realName: 'LenGoku',
    opponentAddressingName: 'Warrior',
    title: 'Flame Hashira (2200 ELO)',
    avatarSrc: '/secret-players/lengoku.png',
    avatarIcon: '🔥',
    avatarBg: 'bg-gradient-to-br from-orange-500 to-amber-700',
    passcode: SECRET_PLAYER_CODES.lengoku,
    themeColor: 'amber',
    gameMode: 'standard',
    preferredOpenings: ['1.e4', '1.f4'],
    playstyle: 'war_bot',
    tagline: 'Set your heart ablaze! Unyielding offensive spirit.',
    description: '2200 ELO apex engine. Overwhelming tactical flame that burns through defenses.',
    dialogue: {
      onMatchStart: [
        'Set your heart ablaze! Let us have a glorious chess battle!',
        'No matter how strong the storm, stand firm! Show me your passion!',
        'Let your spirit burn brightly on every square of this board!',
      ],
      onPlayerCheck: [
        'Magnificent check! Your spirit burns hot!',
        'A valiant strike! I shall meet it head-on!',
      ],
      onBotCheck: [
        'Check! Flame Breathing, First Form: Unknowing Fire!',
        'Check! Do not back down, warrior!',
      ],
      onPlayerCapture: [
        'Excellent capture! You fight with true honor!',
        'A brilliant attack! My flames burn even brighter now!',
      ],
      onBotCapture: [
        'Strike with unwavering conviction! Piece taken!',
        'Fulfill your duty! The flame advances!',
      ],
      onBlunder: [
        'Do not despair! Recover your fighting spirit!',
      ],
      onVictory: [
        'A battle fought with magnificent heart! Stand proud, warrior!',
        'Checkmate! Your spirit was fierce, and I honor your effort!',
      ],
      onDefeat: [
        'Sublime! Your brilliance burned brighter than the sun! Truly outstanding victory!',
        'I concede! You have mastered the chessboard with unmatched spirit!',
      ],
      onIdle: [
        'Breathe deeply, focus your mind, and make your move!',
        'I eagerly await your next passionate strike!',
      ],
    },
  },
  {
    id: 'boy_friend',
    publicName: 'Boy Bot',
    realName: 'Babai',
    opponentAddressingName: 'Golu',
    title: 'The Devoted Companion',
    avatarSrc: '/secret-players/girl_bot.png',
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
    avatarSrc: '/secret-players/girl_bot.png',
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
    avatarSrc: '/secret-players/war_bot.png',
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
