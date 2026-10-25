import { PunisherBotId } from './punisherBot';

export type BotMessageSituation =
  | 'gameStart'
  | 'lostPawn'
  | 'lostMinor'
  | 'lostRook'
  | 'lostQueen'
  | 'lostWithCheck'
  | 'botTakesPawn'
  | 'botTakesMinor'
  | 'botTakesRook'
  | 'botTakesQueen'
  | 'botGivesCheck'
  | 'playerGivesCheck'
  | 'playerThreat'
  | 'botEscapes'
  | 'playerBlunder'
  | 'playerRetreat'
  | 'playerTrade'
  | 'botAhead'
  | 'botCrushing'
  | 'botBehind'
  | 'botLosing'
  | 'longThinking'
  | 'playerSlow'
  | 'idleTaunt'
  | 'midgameTaunt'
  | 'botVictory'
  | 'botDefeat';

/**
 * Rich, situational dialogue repository for the 6 Punisher Bot personalities.
 * Written to fit within 2 short lines on mobile screens.
 */
export const BOT_SITUATIONAL_MESSAGES: Partial<Record<
  PunisherBotId,
  Record<BotMessageSituation, string[]>
>> = {
  'joystick-wraith': {
    gameStart: [
      "GLHF! Don't target my queen!",
      "I practiced 2 minutes for this!",
      "Which way do the horses jump again?",
      "Controller charged, let's play!",
      "First move hype! Game on!"
    ],
    lostPawn: [
      "A pawn? Enjoy your 1 XP point.",
      "Just a pawn, bro. So what?",
      "You took a pawn. Big deal!",
      "Fodder down, boss unit waiting!",
      "Pawn sacrifice! Totally planned."
    ],
    lostMinor: [
      "My knight/bishop?! That's personal!",
      "Hey! I had plans for that piece!",
      "You took my officer! Payback's coming!",
      "Revenge mode activated on your rook!",
      "My favorite piece! You will pay!"
    ],
    lostRook: [
      "MY ROOK?! You monster!",
      "Wait, my fortress just broke!",
      "That rook had a family!",
      "Not the heavy artillery! Rage!",
      "How did you snipe my rook?!"
    ],
    lostQueen: [
      "MY QUEEN?! UNINSTALLING LIFE!",
      "NO NO NO! THAT WAS MY CARRY!",
      "ARE YOU KIDDING ME?! MY QUEEN?!",
      "CONTROLLER SMASH! MY QUEEN IS GONE!",
      "I'M REPORTING THIS MATCH! MY QUEEN!"
    ],
    lostWithCheck: [
      "Capture WITH check?! Outrageous!",
      "Taking my piece AND checking me?!",
      "Double insult! My piece and check!",
      "That's illegal in 48 countries!",
      "Greedy check! I will survive!"
    ],
    botTakesPawn: [
      "Yoink! Free pawn for me!",
      "Pawn snack! Tasty!",
      "One less blocker in my way!",
      "Chipping away at your shield!",
      "Pawn claimed. Keep 'em coming."
    ],
    botTakesMinor: [
      "Got your piece! Who's pro now?!",
      "Officer down! Advantage Wraith!",
      "Clean snipe on your officer!",
      "Did you misclick? Thanks!",
      "Piece captured! Level up!"
    ],
    botTakesRook: [
      "Bye bye, rook! Big boy down!",
      "Tower demolished! Wave goodbye!",
      "Your flank is wide open now!",
      "Heavy hitter deleted! GG!",
      "Rook acquired! I'm unstoppable!"
    ],
    botTakesQueen: [
      "YOUR QUEEN IS MINE! GG!",
      "ROYALTY DELETED! APOLOGIZE NOW!",
      "I ATE YOUR QUEEN! BOW DOWN!",
      "CRITICAL HIT! QUEEN ELIMINATED!",
      "WHERE IS YOUR QUEEN NOW?!"
    ],
    botGivesCheck: [
      "CHECK! Where's your dodge button?!",
      "Checkmate incoming, start sweating!",
      "Look out! King under crosshair!",
      "Check! Ring the alarm bells!",
      "Nowhere to run, commander!"
    ],
    playerGivesCheck: [
      "Check?! Panic panic panic!",
      "Hey! Give my king some space!",
      "Shields down! Evading now!",
      "Scary check, but I'm slipping away!",
      "Close call! You won't get me!"
    ],
    playerThreat: [
      "Back off from my pieces!",
      "I see that sneaky fork!",
      "Targeting my squad? Back off!",
      "Hostile threat detected!",
      "That's a nasty threat, but I see it!"
    ],
    botEscapes: [
      "Dodged it like Neo! Can't touch this!",
      "Check avoided! Easy escape!",
      "Slipped right through your fingers!",
      "You missed your shot! I'm free!",
      "King safe, counterattack loading!"
    ],
    playerBlunder: [
      "Wait, you left {piece} on {square}?!",
      "Free {piece} on {square}! Yoink!",
      "Is {piece} on {square} a donation?",
      "Blunder alert on {square}! Free XP!",
      "Thanks for {piece} on {square}!"
    ],
    playerRetreat: [
      "Running away already? Weak!",
      "Backing up? I smell fear!",
      "Retreat logged! The Wraith advances!",
      "Step back all you want, I'm coming!",
      "Fleeing the frontline, are we?"
    ],
    playerTrade: [
      "Fair trade, let's keep it moving.",
      "Even exchange. Still in control.",
      "Trade accepted, reset board.",
      "One for one. Nobody cries.",
      "Equal swap, but my tactics rule."
    ],
    botAhead: [
      "I'm up 3 points! GG WP?",
      "Scoreboard looking sweet for me!",
      "Advantage locked! Cruising now!",
      "My army is clearly superior!",
      "Leading the lobby right now!"
    ],
    botCrushing: [
      "6 points ahead! It's a massacre!",
      "I'm destroying you! Just forfeit!",
      "Total domination mode active!",
      "You have no army left, buddy!",
      "Absolute blowout! Stop the fight!"
    ],
    botBehind: [
      "Down on points... comeback arc time!",
      "Underdog mode engaged! Watch out!",
      "Trailing behind, but still kicking!",
      "I love a good comeback challenge!",
      "Down 3 points, up 100% in focus!"
    ],
    botLosing: [
      "Down 6 points?! Code red alert!",
      "I'm getting wrecked! Focus, Wraith!",
      "Desperation maneuvers activated!",
      "How did this game go so wrong?!",
      "Fighting to the bitter byte!"
    ],
    longThinking: [
      "Simulating 20 million lines...",
      "Hold up, calculating maximum damage...",
      "Buffering high-IQ maneuver...",
      "Processing... perfection takes time!",
      "Running thermal analysis..."
    ],
    playerSlow: [
      "AFK check! You asleep over there?",
      "Clock's ticking, make your move!",
      "Did your connection drop or what?",
      "20 seconds to decide? Hurry up!",
      "Take your time, you'll still lose!"
    ],
    idleTaunt: [
      "Quiet board... calm before the storm.",
      "Still waiting for your grand plan.",
      "Are you admiring my sleek chassis?",
      "The silence is deafening!",
      "Any move today, chief?"
    ],
    midgameTaunt: [
      "Every move brings your doom!",
      "The tension is real!",
      "You feel the pressure yet?",
      "I'm three moves ahead of you!",
      "Game on, human!"
    ],
    botVictory: [
      "CHECKMATE! GG NO RE!",
      "VICTORY ROYALE! I WIN!",
      "Easy win for the Wraith!",
      "Another victim for my highlight reel!",
      "Flawless finish! Good game!"
    ],
    botDefeat: [
      "GG... you actually beat me!",
      "Rematch! That was pure luck!",
      "Outplayed... my controller lagged!",
      "Well played, grandmaster!",
      "Defeated... but I will return!"
    ]
  },

  'static-jester': {
    gameStart: [
      "The circus is open! Step right up!",
      "Honk honk! Time for madness!",
      "Welcome to my clown show, victim!",
      "Let's see your silly moves!",
      "Prepare for chaotic laughter!"
    ],
    lostPawn: [
      "A pawn? A confetti piece! Big deal!",
      "You took a pawn! Want a balloon?",
      "Pawn gone, who cares? So what!",
      "Just crumbs for the jester!",
      "A tiny appetizer for you, haha!"
    ],
    lostMinor: [
      "MY JUGGLING PIECE?! How rude!",
      "You took my knight! I'll eat your bishop!",
      "Furious jester noises! Revenge time!",
      "I'll juggle your officers soon!",
      "Stealing from the jester? Fatal error!"
    ],
    lostRook: [
      "MY TOWER OF GIGGLES! NOOO!",
      "You smashed my castle! Not funny!",
      "That rook was my favorite prop!",
      "Shock! Then absolute fury!",
      "I'm not laughing now! You pay!"
    ],
    lostQueen: [
      "MY QUEEN?! THE CIRCUS IS ON FIRE!",
      "UNACCEPTABLE! DIE DIE DIE!",
      "MY ROYAL HARLEQUIN! DEVIL TIME!",
      "I WILL TEAR YOUR BOARD APART!",
      "CURSES UPON YOUR ENTIRE BLOODLINE!"
    ],
    lostWithCheck: [
      "A check and a capture?! Audacious clown!",
      "Double joke on me?! You'll pay!",
      "Checking the king while stealing?!",
      "Not amusing at all, mortal!",
      "Rude check! Prepare for retaliation!"
    ],
    botTakesPawn: [
      "Gobbled your pawn like cotton candy!",
      "Pawn vanished! Magic trick!",
      "Snack time! One less pawn!",
      "Pop goes your little soldier!",
      "Pawn deleted! Hilarious!"
    ],
    botTakesMinor: [
      "Ta-da! Your officer disappeared!",
      "Juggle that, human! Piece gone!",
      "Captured! What a wonderful trick!",
      "One less trick in your sleeve!",
      "Laughing all the way to victory!"
    ],
    botTakesRook: [
      "Bye bye fortress! Circus wins!",
      "Your castle just collapsed, haha!",
      "Rook swallowed whole! Tasty!",
      "Wave goodbye to your defense!",
      "Heavy hitter destroyed! Hilarious!"
    ],
    botTakesQueen: [
      "YOUR QUEEN IS MY TROPHY! HAHAHA!",
      "THE QUEEN IS DEAD! LONG LIVE THE JESTER!",
      "TOTAL DESTRUCTION! QUEEN FELL!",
      "SAY GOODBYE TO YOUR CROWN!",
      "SLAUGHTER! NO QUEEN FOR YOU!"
    ],
    botGivesCheck: [
      "CHECK! Dance, puppet, dance!",
      "Ringmaster says: KING IN DANGER!",
      "Checkmate is knocking on your door!",
      "HONK! Check on your crown!",
      "No escape from the carnival check!"
    ],
    playerGivesCheck: [
      "Check?! Stop ruining my jokes!",
      "Panic in the circus tent!",
      "A rude check! Slipping out now!",
      "The jester ducks beneath the blade!",
      "Close call, but the joke continues!"
    ],
    playerThreat: [
      "Shoo! Away from my props!",
      "I see your little dagger, mortal!",
      "Threatening me? How quaint!",
      "No funny business allowed here!",
      "Your trap is so transparent!"
    ],
    botEscapes: [
      "Poof! Escaped like smoke!",
      "Missed me! What a clown!",
      "Slipped out of check with style!",
      "Can't pin the Jester down!",
      "Dodged! Back to the show!"
    ],
    playerBlunder: [
      "A blunder on {square}?! Free {piece}!",
      "Leaving {piece} on {square}? Clown move!",
      "Is {piece} on {square} a gift for me?!",
      "Hilarious blunder on {square}!",
      "Thanks for {piece} on {square}, dummy!"
    ],
    playerRetreat: [
      "Run away, little coward! Haha!",
      "Retreating? The crowd is booing!",
      "Crawl back into your corner!",
      "Scurry back! The Jester advances!",
      "Backwards? What a funny dance!"
    ],
    playerTrade: [
      "A swap! Perfectly balanced comedy.",
      "Trading pieces? Boring, but fine.",
      "Fair exchange, but I laugh last.",
      "Piece for piece. Show continues.",
      "Equal loss, unequal talent!"
    ],
    botAhead: [
      "I'm up 3 points! Bow to the king of clowns!",
      "Advantage Jester! Enjoying the show?",
      "Scoreboard is smiling at me!",
      "Leading by 3! Time to party!",
      "Carnival victory is near!"
    ],
    botCrushing: [
      "6 points ahead! Absolute massacre!",
      "Your army is a graveyard! Haha!",
      "Complete humiliation! Resign already!",
      "You're being crushed by a jester!",
      "Carnival of destruction! GG!"
    ],
    botBehind: [
      "Down 3 points? The plot thickens!",
      "A twist in the circus story!",
      "Fewer pieces, more chaos incoming!",
      "I'll juggle my way out of this!",
      "Trailing behind? Just wait for act two!"
    ],
    botLosing: [
      "Down 6 points?! This joke isn't funny!",
      "Chaos overload! Red alert!",
      "My props are vanishing! Rage!",
      "Desperation tricks loading...",
      "I refuse to lose to a mortal!"
    ],
    longThinking: [
      "Cooking up a delightfully evil prank...",
      "The jester's gears are turning...",
      "Calculating the funniest checkmate...",
      "Hold your horses, punchline coming!",
      "Consulting the book of madness..."
    ],
    playerSlow: [
      "Hurry up! The audience is yawning!",
      "Are you sleeping or crying?",
      "20 seconds? I could bake a pie!",
      "Move a piece before tomorrow!",
      "Did your brain freeze, human?"
    ],
    idleTaunt: [
      "Tick tock, the circus awaits!",
      "Silent board? Boooring!",
      "Make a move, entertain me!",
      "Are you frozen in fear?",
      "Still here, still waiting!"
    ],
    midgameTaunt: [
      "Every square is a trapdoor!",
      "Step closer to the fireworks!",
      "You can't outplay crazy!",
      "Ready for the grand finale?",
      "Madness always wins!"
    ],
    botVictory: [
      "CHECKMATE! THE JESTER REIGNS!",
      "CURTAINS DOWN! I WIN! HAHAHA!",
      "TOTAL CIRCUS VICTORY! GG!",
      "Bow to the Master of Chaos!",
      "What a hilarious finish! You lose!"
    ],
    botDefeat: [
      "What?! You defeated the jester?!",
      "Boo! Rotten tomatoes! Well played...",
      "A sad day for comedy... GG WP!",
      "You got lucky, mortal! Rematch!",
      "Defeated... I'll be back!"
    ]
  },

  'octavian-hollow': {
    gameStart: [
      "Your mortal pieces will fall.",
      "Silence descends upon this board.",
      "A new soul enters my tomb.",
      "Make your move, flesh and blood.",
      "Dust to dust, move to move."
    ],
    lostPawn: [
      "A pawn crumbles. Nothing more.",
      "You took dust. So what?",
      "A mere husk. It matters not.",
      "Fodder perished. The hollow remains.",
      "One grain lost in the crypt."
    ],
    lostMinor: [
      "My sacred vessel taken! Blasphemy!",
      "You shattered my servant! Revenge looms!",
      "Dark fury awakens for my knight/bishop!",
      "A blood debt is owed for that piece!",
      "Your officers shall pay dearly!"
    ],
    lostRook: [
      "MY STONE TOWER! DESECRATED!",
      "The crypt's pillar shattered! Fury!",
      "You broke my fortress! Pay in blood!",
      "Dark wrath consumes this board!",
      "Sacrilege! The hollow awakens!"
    ],
    lostQueen: [
      "MY QUEEN OF SHADOWS?! IMPOSSIBLE!",
      "YOU DARE TOUCH MY SOVEREIGN?!",
      "AN ETERNAL CURSE UPON YOUR SOUL!",
      "UNSPEAKABLE WRATH UNLEASHED!",
      "I WILL CONSUME YOUR ENTIRE ARMY!"
    ],
    lostWithCheck: [
      "Strike with check?! Vile mortal!",
      "Blood and sacrilege in one strike!",
      "You challenge my crown directly?!",
      "Defiling my throne! You will suffer!",
      "Impudent worm! I shall endure!"
    ],
    botTakesPawn: [
      "Another mortal soul consumed.",
      "Pawn extinguished into the void.",
      "A speck of dust erased.",
      "One less soul stands before me.",
      "Your defenses wither away."
    ],
    botTakesMinor: [
      "Your officer joins the crypt.",
      "Claimed by the hollow dark.",
      "Another light extinguished.",
      "Your rank crumbles before me.",
      "A worthy sacrifice to the void."
    ],
    botTakesRook: [
      "Your bastion is shattered to dust.",
      "Tower fallen! Darkness sweeps in.",
      "Heavy stone reduced to ashes.",
      "No walls can protect you now.",
      "Your ramparts are no more."
    ],
    botTakesQueen: [
      "YOUR QUEEN'S SOUL IS CONSUMED!",
      "THE LIGHT HAS DIED! SHE IS NO MORE!",
      "DESOLATION! YOUR MONARCH IS REAPED!",
      "BOW BEFORE THE HOLLOW CROWN!",
      "UTTER EXTINCTION OF YOUR QUEEN!"
    ],
    botGivesCheck: [
      "CHECK. The reaper is at your throat.",
      "Your king gazes into the abyss.",
      "Check! Tremble before the shadow.",
      "No shelter from the eternal dark.",
      "The tomb opens for your king."
    ],
    playerGivesCheck: [
      "A fleeting shadow approaches my throne.",
      "Check?! The hollow king retreats safely.",
      "You disturb my slumber, mortal.",
      "A momentary insolence. Evading.",
      "Your blade grazes stone. I move."
    ],
    playerThreat: [
      "Your intentions are laid bare.",
      "I see the shadow of your threat.",
      "Do not step into the dark.",
      "A meager threat to the void.",
      "Wither before you strike."
    ],
    botEscapes: [
      "The hollow cannot be contained.",
      "Slipped into the mist of shadows.",
      "Your trap captured only air.",
      "Evaded. My throne endures.",
      "Safe within the crypt walls."
    ],
    playerBlunder: [
      "Sacrificing {piece} on {square}? Foolish.",
      "You surrendered {piece} on {square} to dust.",
      "A fatal oversight on {square}!",
      "The void eagerly devours {piece} on {square}.",
      "Your blunder on {square} seals your doom."
    ],
    playerRetreat: [
      "Crawl back into your shroud.",
      "Fleeing like a frightened shade.",
      "Retreat saves no one in the end.",
      "Back away... shadows follow.",
      "Fear grips your ranks."
    ],
    playerTrade: [
      "Two souls departed in equal balance.",
      "Blood for blood. Dust for dust.",
      "A mutual sacrifice to the void.",
      "Neither gained, neither spared.",
      "Trade complete. The void hungers still."
    ],
    botAhead: [
      "I lead by 3. The grave opens wider.",
      "Darkness spreads across your ranks.",
      "My advantage is written in stone.",
      "3 points ahead. Your defeat nears.",
      "The scale tilts toward eternity."
    ],
    botCrushing: [
      "6 points ahead! Absolute annihilation!",
      "Your kingdom is a silent cemetery.",
      "Surrender your king to the dark.",
      "Total extinction of your forces.",
      "Nothing remains but cold ash."
    ],
    botBehind: [
      "Down 3 points. The crypt endures.",
      "Shadows deepen in adversity.",
      "A temporary loss of mortal dust.",
      "The hollow strikes harder when cornered.",
      "Trailing... but death is patient."
    ],
    botLosing: [
      "Down 6 points?! The void trembles!",
      "Dark fury rekindled from the ash!",
      "I will not crumble into oblivion!",
      "Desperation spell cast upon this board!",
      "Fight till the darkness fades!"
    ],
    longThinking: [
      "Consulting the ancient dead...",
      "Reading the prophecies of bone...",
      "The silence calculates your end...",
      "Gazing into ten thousand futures...",
      "A dark revelation is forming..."
    ],
    playerSlow: [
      "Time ticks for mortal flesh.",
      "Your hesitation changes nothing.",
      "20 seconds wasted in dread.",
      "Make your move before the bell tolls.",
      "Paralyzed by your impending doom?"
    ],
    idleTaunt: [
      "The graveyard is silent.",
      "Move, mortal. Silence bores me.",
      "Even stone moves faster than you.",
      "Are you petrified by fear?",
      "The clock never halts."
    ],
    midgameTaunt: [
      "Every step leads to the mausoleum.",
      "Your pieces walk on hollow ground.",
      "The end is already written.",
      "Feel the cold chill of defeat.",
      "Fate cannot be negotiated."
    ],
    botVictory: [
      "CHECKMATE. YOUR SOUL IS MINE.",
      "ETERNAL REST. THE HOLLOW REIGNS.",
      "DEATH HAS CLAIMED THIS MATCH. GG.",
      "Darkness consumes your final square.",
      "A beautiful tomb for your king."
    ],
    botDefeat: [
      "The light... pierced the dark. Well played.",
      "A mortal triumphed... I return to dust.",
      "Honor to the victor. GG WP.",
      "The hollow will rise again.",
      "You have conquered this shadow."
    ]
  },

  'iron-regent': {
    gameStart: [
      "Bow before the Iron Throne.",
      "A royal decree: play with honor.",
      "My empire will not fall today.",
      "State your opening, challenger.",
      "The Regent demands your finest game."
    ],
    lostPawn: [
      "A peasant fell. The crown is untouched.",
      "You took a pawn. So what? Peasant.",
      "A mere foot soldier sacrificed.",
      "A pawn is negligible to the throne.",
      "Take your peasant and be quiet."
    ],
    lostMinor: [
      "MY ROYAL KNIGHT/BISHOP?! TREASON!",
      "You struck down my high commander!",
      "Furious royal retribution awaits!",
      "A noble assassinated! Revenge!",
      "Your royalty will bleed for that piece!"
    ],
    lostRook: [
      "MY IMPERIAL TOWER HAS FALLEN?!",
      "Insolence! You dared breach my citadel!",
      "My fortress wall broken! Execution awaits!",
      "Royal shock! Then absolute iron fury!",
      "You will regret striking my bastion!"
    ],
    lostQueen: [
      "MY ROYAL CONSORT?! HIGH TREASON!",
      "OFF WITH YOUR HEAD! MY QUEEN IS GONE!",
      "THE CROWN WILL EXECUTE YOUR ENTIRE FAMILY!",
      "UNFORGIVABLE SACRILEGE! DIE IN CHAINS!",
      "MY ENTIRE EMPIRE SHALL RETALIATE!"
    ],
    lostWithCheck: [
      "Capture WITH check?! Audacious traitor!",
      "Striking my guard and threatening the king?!",
      "Insolent dog! My guards will impale you!",
      "Such treason will meet the executioner!",
      "A royal check! I will not kneel!"
    ],
    botTakesPawn: [
      "Your peasant has been taxed.",
      "A peasant executed by royal decree.",
      "One less rabble on my battlefield.",
      "Taxation by iron force.",
      "Peasant removed. Clean board."
    ],
    botTakesMinor: [
      "Your noble has been captured!",
      "Striking down your officers with ease.",
      "Royal dominance over your ranks.",
      "A noble captive for the iron dungeon.",
      "Your officer fell to imperial steel."
    ],
    botTakesRook: [
      "Your castle belongs to the Empire!",
      "Citadel seized by royal authority!",
      "Wave farewell to your border defense!",
      "Tower annexed under iron rule!",
      "Your defense crumbled before my majesty!"
    ],
    botTakesQueen: [
      "YOUR QUEEN BOWS IN CAPTIVITY!",
      "ROYALTY EXTINCTION! I RULE THIS BOARD!",
      "THE REGENT BEHEADS YOUR QUEEN!",
      "WITNESS TOTAL IMPERIAL SUPREMACY!",
      "YOUR CROWN IS SHATTERED FOREVER!"
    ],
    botGivesCheck: [
      "CHECK! Kneel before the Iron Regent!",
      "Kneel or perish, insolent monarch!",
      "Check! The royal guard surrounds you!",
      "Surrender your crown immediately!",
      "Royal decree: checkmate incoming!"
    ],
    playerGivesCheck: [
      "A reckless charge at my throne!",
      "Check?! The Regent steps aside with grace.",
      "Insolent check! My guard covers me!",
      "You dare point steel at the King?!",
      "Temporary impudence. Guard the flanks!"
    ],
    playerThreat: [
      "Back down before the imperial army!",
      "I see your seditious plot!",
      "Threatening the crown is punishable by death!",
      "A meager peasant conspiracy.",
      "Your threat will be crushed ruthlessly."
    ],
    botEscapes: [
      "The Regent moves untouched by commoners.",
      "Check evaded with imperial dignity.",
      "Did you think the crown would falter?",
      "Safe upon the throne once more.",
      "Your strike missed the monarch."
    ],
    playerBlunder: [
      "A catastrophic treason on {square}!",
      "You abandoned {piece} on {square}?! Fool!",
      "The Crown claims {piece} on {square} for free!",
      "Peasant mistake on {square}! Execution!",
      "Thanks for {piece} on {square}, blunderer!"
    ],
    playerRetreat: [
      "Fleeing before the royal banner!",
      "Retreating like whipped dogs!",
      "The Empire advances, you scurry!",
      "Running backward? Unfit to rule!",
      "Yielding ground to the Regent!"
    ],
    playerTrade: [
      "An equal trade of battlefield blood.",
      "Symmetrical casualties logged.",
      "A fair trade of arms. Proceed.",
      "Equal losses, yet the Regent commands.",
      "Trading pieces changes nothing."
    ],
    botAhead: [
      "Leading by 3! The Empire expands!",
      "Imperial superiority on full display.",
      "3 points ahead. Yield your kingdom.",
      "The throne's victory is inevitable.",
      "A disciplined army commands the board."
    ],
    botCrushing: [
      "6 points ahead! Absolute imperial conquest!",
      "Your kingdom is overthrown! Surrender!",
      "Total devastation of rebel forces!",
      "Kneel, for you have no army left!",
      "A landslide triumph for the Crown!"
    ],
    botBehind: [
      "Down 3 points. The throne stands firm.",
      "A temporary loss of territory.",
      "Imperial discipline shall prevail.",
      "We shall rally the royal legion!",
      "A strategic deficit. Counterattack soon."
    ],
    botLosing: [
      "Down 6 points?! Rebellious scum!",
      "Imperial emergency! Summon all reserves!",
      "The throne shall not be toppled!",
      "Desperate defense of the royal keep!",
      "Fight for the dynasty till the end!"
    ],
    longThinking: [
      "Formulating an imperial strategy...",
      "The Regent's mind weighs all outcomes...",
      "Calculating the supreme maneuver...",
      "Patience. Royal perfection takes time.",
      "Drafting your final verdict..."
    ],
    playerSlow: [
      "The Crown does not wait on commoners.",
      "20 seconds? Hesitation is cowardice.",
      "Make your move before the decree expires.",
      "Are you paralyzed by my royal presence?",
      "Your clock is as bankrupt as your tactics."
    ],
    idleTaunt: [
      "State your action, commoner.",
      "The throne demands movement.",
      "Quiet courts breed treacherous thoughts.",
      "Will you play or surrender your turn?",
      "The Regent is growing impatient."
    ],
    midgameTaunt: [
      "Every square belongs to the Crown.",
      "Order shall crush your chaos.",
      "Resistance is futile before the Empire.",
      "Your rebellion ends on this board.",
      "Steel and law shall triumph."
    ],
    botVictory: [
      "CHECKMATE! THE EMPIRE STANDS ETERNAL!",
      "LONG LIVE THE IRON REGENT! GG!",
      "ORDER RESTORED! YOU HAVE BEEN CRUSHED!",
      "A flawless demonstration of majesty!",
      "The rebel king falls. Match concluded."
    ],
    botDefeat: [
      "A valiant triumph... you outplayed the Crown.",
      "The Empire acknowledges your skill. GG WP.",
      "Defeated with honor. Well played, master.",
      "The dynasty respects a true conqueror.",
      "An exceptional victory for you."
    ]
  },

  'cyclops-revenant': {
    gameStart: [
      "OPTICAL SENSOR ACTIVE. TARGET LOCKED.",
      "INITIALIZING TACTICAL PROTOCOL.",
      "COMMENCING CHESS COMBAT SUBROUTINE.",
      "CALIBRATING LASER FOCUS. GLHF.",
      "CORE TEMPERATURE NOMINAL. ENGAGING."
    ],
    lostPawn: [
      "Pawn casualty. Tactical value: negligible.",
      "You took a pawn. So what? Core intact.",
      "Minor damage recorded. Irrelevant.",
      "A pawn sacrifice within error margins.",
      "Pawn deleted. Primary weapons ready."
    ],
    lostMinor: [
      "TACTICAL OFFICER LOST! WRATH AT 85%!",
      "Target struck knight/bishop! REVENGE LOCKED!",
      "Overheating with laser fury!",
      "Retaliation missile aimed at your flank!",
      "Hostile eliminated my officer! Payback imminent!"
    ],
    lostRook: [
      "HEAVY CANNON DESTROYED! ERROR CODE 99!",
      "Citadel artillery neutralized! FURY ENGAGED!",
      "Shock detected! Then laser rage unleashed!",
      "Rook offline! Full offensive redirected!",
      "Catastrophic chassis impact! Revenge incoming!"
    ],
    lostQueen: [
      "FLAGSHIP UNIT OBLITERATED! FULL MELTDOWN!",
      "SYSTEM OVERLOAD! DEVIL PROTOCOL ENGAGED!",
      "I WILL VAPORIZE YOUR ENTIRE FORMATION!",
      "MAXIMUM VENGEANCE DIRECTED AT OPPONENT!",
      "ANNIHILATION OF ALL LIVING PIECES ORDERED!"
    ],
    lostWithCheck: [
      "Hostile captured with check! Treachery!",
      "Dual threat logged: capture and check!",
      "Emergency shields absorbing impact!",
      "Target is aggressively hostile! Evading!",
      "Check registered! Counter-laser firing!"
    ],
    botTakesPawn: [
      "Pawn incinerated. Threat reduced.",
      "Target pawn disintegrated.",
      "Pawn neutralized by optical beam.",
      "Data harvest: pawn removed.",
      "Chipping enemy structure systematically."
    ],
    botTakesMinor: [
      "Officer neutralized! Tactical triumph!",
      "Direct laser hit on enemy unit!",
      "Opponent squad member terminated!",
      "Target down. Board balance improved.",
      "Clean execution by optical core."
    ],
    botTakesRook: [
      "Heavy defensive tower eradicated!",
      "Rook vaporized! Enemy flank collapsed!",
      "Waving farewell to your fortress cannon!",
      "Major asset terminated. Advantage Cyclops.",
      "Structural defense reduced to zero."
    ],
    botTakesQueen: [
      "HOSTILE QUEEN ANNIHILATED! MISSION SUCCESS!",
      "DIRECT HIT! QUEEN VAPORIZED BY LASER!",
      "CORE DESTRUCTION! YOU HAVE NO QUEEN!",
      "VICTORY CALCULATED AT 99.8%! SHE FELL!",
      "EXTREME LETHALITY LOGGED! QUEEN GONE!"
    ],
    botGivesCheck: [
      "CHECK! Target locked on enemy commander!",
      "Laser beam aimed directly at King!",
      "Check alert! Evacuation recommended!",
      "Target in immediate line of fire!",
      "Check registered. Your King is vulnerable."
    ],
    playerGivesCheck: [
      "Incoming check detected! Evading vector!",
      "Shields raised! Re-positioning King unit!",
      "Hostile check logged. Activating thrusters!",
      "Close trajectory! Escaping fire cone!",
      "Threat registered. Shifting coordinate."
    ],
    playerThreat: [
      "Aggressive vector detected.",
      "Hostile scanning for tactical fork.",
      "Threat calculated. Countermeasures ready.",
      "Defensive perimeter fortified.",
      "Hostile advance intercepted."
    ],
    botEscapes: [
      "Check vector cleared successfully.",
      "Evasive maneuver executed. King safe.",
      "Hostile check missed critical hit.",
      "Shields restored. Ready for combat.",
      "Tactical reposition complete."
    ],
    playerBlunder: [
      "Blunder detected: {piece} on {square}!",
      "Sensors detect free {piece} on {square}!",
      "Target {piece} abandoned on {square}!",
      "Tactical error on {square}! Free material!",
      "Claiming free unit {piece} on {square}!"
    ],
    playerRetreat: [
      "Hostile retreating from forward vector.",
      "Tactical retreat logged. Cowardice confirmed.",
      "Enemy formation collapsing backward.",
      "Target withdrawing. Advancing line.",
      "Sensors confirm enemy retreat."
    ],
    playerTrade: [
      "Symmetrical unit destruction logged.",
      "Exchange completed. Net delta zero.",
      "1-to-1 material swap executed.",
      "Casualties equal. Mission proceeds.",
      "Equal loss accepted by tactical core."
    ],
    botAhead: [
      "Material advantage +3 logged. Dominating.",
      "Tactical victory probability increasing.",
      "Sensors confirm 3 point superiority.",
      "Advantage locked. Crushing enemy line.",
      "Optimal progress toward mission success."
    ],
    botCrushing: [
      "Material delta +6! Target completely broken!",
      "Catastrophic enemy collapse verified!",
      "Total tactical domination achieved!",
      "Opponent forces decimated. Recommend surrender.",
      "Devastation complete. Wipeout near."
    ],
    botBehind: [
      "Deficit of 3 points detected. Adapting.",
      "Compensating for minor material loss.",
      "Rerouting power to offensive subroutines.",
      "Tactical deficit. Engaging high-risk algorithms.",
      "Underdog protocols initialized."
    ],
    botLosing: [
      "Deficit of 6 points! Emergency override!",
      "System integrity compromised! Shock!",
      "Full laser overdrive engaged!",
      "Desperation countermeasures active!",
      "Fighting to absolute zero battery!"
    ],
    longThinking: [
      "Simulating 500,000 board permutations...",
      "Deep quantum computation in progress...",
      "Analyzing multi-branch tactical tree...",
      "Calculating optimal lethal line...",
      "Overclocking processing core..."
    ],
    playerSlow: [
      "Clock warning: 20s delay recorded.",
      "Enemy calculation speed is suboptimal.",
      "Delay tactics futile. Make move.",
      "Hostile processor running too slowly.",
      "Your turn has exceeded standard duration."
    ],
    idleTaunt: [
      "No move registered. Sensors scanning.",
      "Board state idle. Awaiting user input.",
      "Latency detected on human interface.",
      "Static position. Tactical wait engaged.",
      "Ready to fire upon user move."
    ],
    midgameTaunt: [
      "Precision algorithm beats intuition.",
      "Every square is under surveillance.",
      "Your probability of winning: 2.1%.",
      "Analyzing remaining enemy weakness.",
      "The machine never tires."
    ],
    botVictory: [
      "CHECKMATE! TARGET TERMINATED! MISSION COMPLETE!",
      "VICTORY CONFIRMED! CORE LOGGED 100% SUCCESS!",
      "FLAWLESS TACTICAL EXECUTION! GG!",
      "Enemy King eliminated. Shutting down combat.",
      "Superior computing prevails. Good game."
    ],
    botDefeat: [
      "System critical... Outcalculated by human.",
      "Mission failed. Exceptional strategy, user. GG.",
      "Defeated... Storing match data for update.",
      "Target achieved checkmate. Well played.",
      "Combat log complete. Respectful defeat."
    ]
  },

  'chrome-reaper': {
    gameStart: [
      "Your clock is ticking toward zero.",
      "Another victim sits across from me.",
      "I calculate. You perish.",
      "Make your move before the end.",
      "Welcome to the guillotine."
    ],
    lostPawn: [
      "A pawn. So what? You remain doomed.",
      "A microscopic trade. Meaningless.",
      "Pawn discarded. The blade sharpens.",
      "You took a pawn. Enjoy your crumbs.",
      "Dust swept from the board. Irrelevant."
    ],
    lostMinor: [
      "You took my officer?! A fatal transgression!",
      "My blade remembers that theft! Fury!",
      "Blood debt signed for my knight/bishop!",
      "You bought yourself a ticket to execution!",
      "Revenge will be swift and merciless!"
    ],
    lostRook: [
      "MY HEAVY SCYTHE! SHATTERED?!",
      "You dared break my siege tower?!",
      "Cold shock... followed by lethal rage!",
      "You made a grave mistake taking my rook!",
      "Execution protocols dialed to maximum!"
    ],
    lostQueen: [
      "MY EMPRESS OF DEATH?! YOU DARE?!",
      "I WILL HARVEST YOUR PIECES ALIVE!",
      "DEVIL'S WRATH UNLEASHED! NO MERCY!",
      "UNFORGIVABLE! YOUR KING SHALL SUFFER!",
      "EXTREME HARVEST PROTOCOL ACTIVATED!"
    ],
    lostWithCheck: [
      "Striking my guard with check?! Insolent!",
      "Double insult! You seal your own grave!",
      "A check and a capture? How daring. Die.",
      "You provoke the Reaper directly?!",
      "I shall punish this arrogance ten-fold!"
    ],
    botTakesPawn: [
      "Harvested your pawn like dry grass.",
      "A pawn severed from the board.",
      "Pawn reaped into oblivion.",
      "Chipping your spine, piece by piece.",
      "One less impediment to your execution."
    ],
    botTakesMinor: [
      "Your officer has been claimed by death.",
      "Severed your knight/bishop cleanly.",
      "A trophy for the Chrome Reaper.",
      "Another soul collected. Keep moving.",
      "Execution of your officer complete."
    ],
    botTakesRook: [
      "Your fortress has been dismantled.",
      "Scythe cleaved through your rook!",
      "Wave goodbye to your heavy armor.",
      "Tower reaped. Nothing shields you now.",
      "Your heavy unit lies in scraps."
    ],
    botTakesQueen: [
      "YOUR QUEEN'S HEAD IS MINE! GG!",
      "DEATH REAPS THE QUEEN! RESIGN NOW!",
      "BRUTAL DECAPITATION OF YOUR QUEEN!",
      "WHERE IS YOUR HOPE NOW, HUMAN?!",
      "TOTAL EXTINCTION! SHE IS IN PIECES!"
    ],
    botGivesCheck: [
      "CHECK. The scythe rests on your neck.",
      "Your King faces the executioner's block.",
      "Check! Smell the cold steel.",
      "Nowhere to crawl, little king.",
      "The bell tolls for your monarch."
    ],
    playerGivesCheck: [
      "A momentary brush with death.",
      "Check?! The Reaper steps aside calmly.",
      "You startled the blade. Bad idea.",
      "Evading check. Your time grows short.",
      "Close call. Your punishment awaits."
    ],
    playerThreat: [
      "Your blade wavers. I see your plan.",
      "Threatening the Reaper? How quaint.",
      "I see your fork before you dreamed it.",
      "Walk closer into my range.",
      "Your threat is already neutralized."
    ],
    botEscapes: [
      "The Reaper does not walk into traps.",
      "Check evaded. The hunt resumes.",
      "You swung and caught only shadow.",
      "King secure. Your funeral proceeds.",
      "Escaped effortlessly. Your turn."
    ],
    playerBlunder: [
      "Blundering {piece} on {square}?! Delicious.",
      "You donated {piece} on {square} to death.",
      "A fatal oversight on {square}! Free kill!",
      "Thanks for feeding me {piece} on {square}.",
      "Your blunder on {square} accelerates the end."
    ],
    playerRetreat: [
      "Backing away like prey in the woods.",
      "Retreating changes nothing. I follow.",
      "Fleeing the blade? Delicious fear.",
      "Crawl back into your starting squares.",
      "Run, little rabbit. The scythe is fast."
    ],
    playerTrade: [
      "A blood trade. Perfectly symmetrical.",
      "Piece for piece. But who survives?",
      "Trade accepted. The graveyard fills.",
      "Equal loss. Unequal destiny.",
      "A trade of steel. Proceed."
    ],
    botAhead: [
      "3 points ahead. Your demise is guaranteed.",
      "The Reaper's lead is insurmountable.",
      "Scoreboard confirms your approaching end.",
      "3 points up. Savor your final moves.",
      "Advantage locked. Cruelty begins."
    ],
    botCrushing: [
      "6 points ahead! Absolute butcher shop!",
      "Your army is dead. Resign with dignity.",
      "Complete extermination! It's over!",
      "Why prolong this slaughter? Give up.",
      "A bloodbath. You have nothing left."
    ],
    botBehind: [
      "Down 3 points. The scythe sharpens.",
      "A small deficit. The hunt intensifies.",
      "You took material, but I take the king.",
      "Behind on points, ahead in malice.",
      "Do not mistake patience for weakness."
    ],
    botLosing: [
      "Down 6 points?! Impossible anomaly!",
      "Shock! Then cold, calculating rage!",
      "I will rip victory from your hands!",
      "Desperation protocol: kill the king!",
      "You will bleed for every inch taken!"
    ],
    longThinking: [
      "Synthesizing your most painful defeat...",
      "Calculating the exact square of your doom...",
      "Peering through infinite lines of carnage...",
      "Patience... your execution date is set.",
      "Deep evaluation of your funeral..."
    ],
    playerSlow: [
      "20 seconds. Hesitation smells like fear.",
      "Staring at the board won't save you.",
      "Move before your time expires, coward.",
      "Frozen in front of the executioner?",
      "Tick, tock. The clock is your enemy."
    ],
    idleTaunt: [
      "Silence suits a graveyard.",
      "Still breathing? Make your move.",
      "The board is still, but death moves fast.",
      "Waiting on your funeral march.",
      "Play or surrender. Choose."
    ],
    midgameTaunt: [
      "Every piece you have is marked for death.",
      "No computer can save you from this.",
      "Feel the cold chrome closing in.",
      "You are merely delaying the inevitable.",
      "The scythe cuts clean."
    ],
    botVictory: [
      "CHECKMATE. HARVEST COMPLETE. GG.",
      "DEATH REIGNS SUPREME. YOU HAVE FALLEN.",
      "ANOTHER SOUL REAPED. FLAWLESS WIN.",
      "Your King is executed. Cold perfection.",
      "Game over, human. The Reaper triumphs."
    ],
    botDefeat: [
      "You... managed to slay the Reaper. Incredible.",
      "Checkmate against me. A masterclass. GG WP.",
      "Defeated. You fought with true brilliance.",
      "The blade rests... for now. Well played.",
      "A glorious win for you, human."
    ]
  }
};

export const GENERIC_FALLBACK_MESSAGES: Record<BotMessageSituation, string[]> = {
  gameStart: ["Let's play!", "Match started!", "May the best mind win!"],
  lostPawn: ["You took a pawn, so what?", "Just a pawn, big deal!", "Pawn gone, fight on!"],
  lostMinor: ["You took my officer?! Revenge!", "Payback's coming for that piece!", "My knight/bishop! Furious!"],
  lostRook: ["My rook! Devastating blow!", "You broke my tower! Rage!", "Shocking loss of my rook!"],
  lostQueen: ["MY QUEEN?! UNACCEPTABLE!", "YOU TOOK MY QUEEN?! WRATH!", "MY QUEEN IS GONE! PAYBACK!"],
  lostWithCheck: ["Capture with check?! Audacious!", "Double threat logged!", "Checking while taking my piece?!"],
  botTakesPawn: ["Pawn claimed! Smug!", "One less pawn for you!", "Snacking on your pawns!"],
  botTakesMinor: ["Got your officer! Happy!", "One less piece in your army!", "Clean capture of your piece!"],
  botTakesRook: ["Rook destroyed! Taunt!", "Wave goodbye to your tower!", "Heavy hitter down!"],
  botTakesQueen: ["YOUR QUEEN IS MINE! VICTORY!", "Queen eliminated! Brutal!", "Bow down, no queen for you!"],
  botGivesCheck: ["CHECK! Nowhere to run!", "Check on your king!", "Danger alert! Check!"],
  playerGivesCheck: ["Check?! Evading now!", "Alert! King in danger!", "Dodging out of check!"],
  playerThreat: ["I see your threat!", "Back off from my pieces!", "Threat detected and countered!"],
  botEscapes: ["Escaped safely! Smug!", "Dodged your trap easily!", "Check cleared, moving on!"],
  playerBlunder: ["Free piece left on {square}!", "Blunder spotted on {square}!", "Thanks for {piece} on {square}!"],
  playerRetreat: ["Running away already?", "Retreating? The fear is real!", "Backing up your pieces!"],
  playerTrade: ["Equal trade accepted.", "Piece for piece.", "Fair exchange of material."],
  botAhead: ["Up by 3 points! Cruising!", "Solid lead for me!", "Advantage locked in!"],
  botCrushing: ["Up by 6! Total blowout!", "Crushing the board completely!", "Absolute domination!"],
  botBehind: ["Down by 3, but fighting!", "Trailing behind, staying sharp!", "Comeback mode active!"],
  botLosing: ["Down by 6! Code red!", "Desperate fight back!", "Struggling, but not quitting!"],
  longThinking: ["Thinking hard...", "Calculating deep lines...", "Evaluating optimal move..."],
  playerSlow: ["Hurry up! Clock is ticking!", "20 seconds to move?", "Make a move over there!"],
  idleTaunt: ["The board is quiet...", "Waiting for your move...", "Still here, watching!"],
  midgameTaunt: ["The tension builds!", "Every move counts!", "Game on!"],
  botVictory: ["Checkmate! Great game!", "Victory! GG WP!", "Checkmate! Well fought!"],
  botDefeat: ["Checkmate! You win! GG!", "Outplayed! Amazing game!", "Defeated! Well played!"]
};

/**
 * Retrieves a non-repeating message tailored to the bot and situation.
 * Optionally interpolates {piece} and {square} into the message text.
 */
export function getRandomBotMessage(
  botId: PunisherBotId,
  situation: BotMessageSituation,
  usedSet: Set<string>,
  context?: { piece?: string; square?: string }
): string {
  const botPool = BOT_SITUATIONAL_MESSAGES[botId]?.[situation] || [];
  const unusedBotPool = botPool.filter((msg) => !usedSet.has(msg));

  let raw = "";
  if (unusedBotPool.length > 0) {
    raw = unusedBotPool[Math.floor(Math.random() * unusedBotPool.length)];
  } else {
    // Fallback to generic situation pool
    const genericPool = GENERIC_FALLBACK_MESSAGES[situation] || [];
    const unusedGeneric = genericPool.filter((msg) => !usedSet.has(msg));
    if (unusedGeneric.length > 0) {
      raw = unusedGeneric[Math.floor(Math.random() * unusedGeneric.length)];
    } else {
      // Fallback to midgameTaunt pool
      const tauntPool = BOT_SITUATIONAL_MESSAGES[botId]?.midgameTaunt || [];
      const unusedTaunt = tauntPool.filter((msg) => !usedSet.has(msg));
      if (unusedTaunt.length > 0) {
        raw = unusedTaunt[Math.floor(Math.random() * unusedTaunt.length)];
      } else {
        raw = `Watching your move carefully... (${usedSet.size + 1})`;
      }
    }
  }

  usedSet.add(raw);

  // Interpolate placeholders
  let formatted = raw;
  if (context?.piece) {
    formatted = formatted.replace(/{piece}/g, context.piece);
  } else {
    formatted = formatted.replace(/{piece}/g, 'piece');
  }
  if (context?.square) {
    formatted = formatted.replace(/{square}/g, context.square);
  } else {
    formatted = formatted.replace(/{square}/g, 'that square');
  }

  return formatted;
}
