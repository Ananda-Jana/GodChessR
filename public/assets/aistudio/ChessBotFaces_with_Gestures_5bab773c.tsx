import React from "react";

/* ============================================================================
 * TYPES
 * ========================================================================== */

export type BotMood =
  | 'neutral'
  | 'thinking'
  | 'happy'
  | 'smug'
  | 'shocked'
  | 'worried'
  | 'angry'
  | 'victory'
  | 'defeat';

/**
 * Gestures are extra "body language" layers drawn on top of a bot's normal face.
 *  - none      : plain face, nothing added
 *  - smile     : a custom smile fitted to that bot's own face
 *  - rage      : steam + clenched shaking fists + angry glow
 *  - horns     : devil horns pop out of the head
 *  - hands     : both hands wave at the sides (greeting / mocking wave)
 *  - taunt     : smirk with tongue sticking out
 *  - celebrate : both hands raised high + sparkles
 *  - panic     : sweat drops + hands on the cheeks
 *
 * Use gesture="auto" (default) to derive the gesture from the mood, or pass an
 * explicit gesture (e.g. from pickGesture()) to trigger a specific one in-game.
 */
export type BotGesture =
  | 'none'
  | 'smile'
  | 'rage'
  | 'horns'
  | 'hands'
  | 'taunt'
  | 'celebrate'
  | 'panic';

export type BotFaceProps = {
  size?: number;
  className?: string;
  mood?: BotMood;
  gesture?: BotGesture | 'auto';
};

type FrameProps = Pick<BotFaceProps, 'size' | 'className'> & {
  label: string;
  children: React.ReactNode;
};

const Frame: React.FC<FrameProps> = ({ size = 128, className, label, children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
    fillRule="evenodd"
    role="img"
    aria-label={label}
  >
    {children}
  </svg>
);

/* ============================================================================
 * MOOD -> GESTURE MAPPING
 * ========================================================================== */

/** Default gesture used when gesture="auto". */
const MOOD_TO_GESTURE: Record<BotMood, BotGesture> = {
  neutral: 'none',
  thinking: 'none',
  happy: 'smile',
  smug: 'taunt',
  shocked: 'panic',
  worried: 'panic',
  angry: 'rage',
  victory: 'celebrate',
  defeat: 'none',
};

const resolveGesture = (mood: BotMood, gesture: BotGesture | 'auto'): BotGesture =>
  gesture === 'auto' ? MOOD_TO_GESTURE[mood] : gesture;

/** Gestures that draw their own mouth, so the generic overlay mouth is hidden. */
const hasOwnMouth = (g: BotGesture) => g === 'smile' || g === 'taunt';

/* ============================================================================
 * EXPRESSION OVERLAY (unchanged look: eyes, eyebrows, mouths per mood)
 * ========================================================================== */

/**
 * Expression overlay renderer providing distinct facial expressions
 * for eyes, eyebrows, and mouths across all 9 mood states.
 * `hideMouth` is set when a gesture is drawing its own bot-specific mouth.
 */
const ExpressionOverlay: React.FC<{ mood?: BotMood; hideMouth?: boolean }> = ({
  mood = 'neutral',
  hideMouth = false,
}) => {
  if (mood === 'angry') {
    return (
      <g className="animate-pulse">
        {/* Slanted sharp angry eyebrows */}
        <path d="M50 72 L90 88 L85 92 L45 76 Z" fill="#ef4444" />
        <path d="M150 72 L110 88 L115 92 L155 76 Z" fill="#ef4444" />
        {/* Red fiery glare in sockets */}
        <circle cx="70" cy="98" r="5" fill="#ef4444" />
        <circle cx="130" cy="98" r="5" fill="#ef4444" />
      </g>
    );
  }

  if (mood === 'happy' || mood === 'smug' || mood === 'victory') {
    return (
      <g>
        {/* Triumphant arched eyebrows & glints */}
        <path d="M52 75 Q70 60 88 75 L85 79 Q70 66 55 79 Z" fill="#f59e0b" />
        <path d="M112 75 Q130 60 148 75 L145 79 Q130 66 115 79 Z" fill="#f59e0b" />
        <circle cx="70" cy="95" r="4" fill="#fbbf24" />
        <circle cx="130" cy="95" r="4" fill="#fbbf24" />
        {/* Smug smile accent */}
        {!hideMouth && (
          <path d="M80 140 Q100 158 120 140" stroke="#fbbf24" strokeWidth="4" fill="none" strokeLinecap="round" />
        )}
      </g>
    );
  }

  if (mood === 'shocked' || mood === 'worried') {
    return (
      <g>
        {/* Raised worried eyebrows */}
        <path d="M50 68 L88 76 L86 80 L48 72 Z" fill="#c084fc" />
        <path d="M150 68 L112 76 L114 80 L152 72 Z" fill="#c084fc" />
        {/* Wide shocked eye cutouts */}
        <circle cx="70" cy="96" r="7" fill="#c084fc" />
        <circle cx="130" cy="96" r="7" fill="#c084fc" />
        {/* O-shaped mouth or wavy worried mouth */}
        {!hideMouth && <ellipse cx="100" cy="144" rx="8" ry="12" fill="#c084fc" />}
      </g>
    );
  }

  if (mood === 'thinking') {
    return (
      <g>
        {/* Squinted analytical brow */}
        <path d="M52 78 L88 78 L88 82 L52 82 Z" fill="#2727F5" />
        <path d="M112 72 L148 80 L146 84 L110 76 Z" fill="#2727F5" />
        <circle cx="70" cy="96" r="3" fill="#67e8f9" />
        <circle cx="130" cy="96" r="5" fill="#67e8f9" />
      </g>
    );
  }

  if (mood === 'defeat') {
    return (
      <g opacity="0.8">
        {/* X-eyes for defeat */}
        <path d="M62 88 L78 104 M78 88 L62 104" stroke="#94a3b8" strokeWidth="4" />
        <path d="M122 88 L138 104 M138 88 L122 104" stroke="#94a3b8" strokeWidth="4" />
        {/* Downward sad mouth curve */}
        <path d="M80 152 Q100 136 120 152" stroke="#94a3b8" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    );
  }

  return null;
};

/* ============================================================================
 * GESTURE BUILDING BLOCKS (shared shapes, drawn in the same flat/sharp style)
 * ========================================================================== */

/** Open robotic hand (palm + 4 fingers + thumb). `wave` makes it swing. */
const Palm: React.FC<{ x: number; y: number; flip?: boolean; color: string; wave?: boolean; fast?: boolean }> = ({
  x, y, flip = false, color, wave = false, fast = false,
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} fill={color}>
    <g>
      {wave && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-14 0 8;14 0 8;-14 0 8"
          dur={fast ? "0.35s" : "0.7s"}
          repeatCount="indefinite"
        />
      )}
      {/* palm */}
      <rect x="-8" y="-6" width="16" height="14" />
      {/* fingers */}
      <rect x="-8" y="-15" width="3" height="9" />
      <rect x="-3.6" y="-19" width="3" height="13" />
      <rect x="0.8" y="-19" width="3" height="13" />
      <rect x="5.2" y="-15" width="3" height="9" />
      {/* thumb */}
      <rect x="-13" y="-3" width="5" height="3" />
    </g>
  </g>
);

/** Clenched fist that trembles with anger. */
const Fist: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g transform={`translate(${x} ${y})`}>
    <g fill={color}>
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 0;-2 1;2 -1;0 0"
        dur="0.18s"
        repeatCount="indefinite"
      />
      <rect x="-8" y="-7" width="16" height="14" />
      {/* knuckle lines */}
      <rect x="-4.5" y="-7" width="1.5" height="6" fill="#0f172a" />
      <rect x="-0.5" y="-7" width="1.5" height="6" fill="#0f172a" />
      <rect x="3.5" y="-7" width="1.5" height="6" fill="#0f172a" />
    </g>
  </g>
);

/** Two devil horns. x1/x2 are the base-left x positions of each horn, y is the base. */
const Horns: React.FC<{ x1: number; x2: number; y: number; color: string }> = ({ x1, x2, y, color }) => (
  <g fill={color}>
    <path d={`M${x1} ${y} Q${x1 - 10} ${y - 14} ${x1 - 4} ${y - 30} Q${x1 + 8} ${y - 18} ${x1 + 12} ${y} Z`} />
    <path d={`M${x2} ${y} Q${x2 + 10} ${y - 14} ${x2 + 4} ${y - 30} Q${x2 - 8} ${y - 18} ${x2 - 12} ${y} Z`} />
  </g>
);

/** Four-point sparkle star. */
const Sparkle: React.FC<{ x: number; y: number; s?: number; color: string }> = ({ x, y, s = 7, color }) => {
  const k = s * 0.3;
  return (
    <path
      className="animate-pulse"
      fill={color}
      d={`M${x} ${y - s} L${x + k} ${y - k} L${x + s} ${y} L${x + k} ${y + k} L${x} ${y + s} L${x - k} ${y + k} L${x - s} ${y} L${x - k} ${y - k} Z`}
    />
  );
};

/** Sweat drop for worry / panic. */
const Sweat: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <path
    className="animate-pulse"
    fill="#67e8f9"
    d={`M${x} ${y} Q${x + 6} ${y + 10} ${x} ${y + 14} Q${x - 6} ${y + 10} ${x} ${y} Z`}
  />
);

/** Zig-zag rage steam. */
const Steam: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <path
    className="animate-pulse"
    d={`M${x} ${y} l4 -8 l-8 -8 l8 -8`}
    stroke="#ef4444"
    strokeWidth="3"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

/** Little flame (used for angry crowns, etc.). */
const Flame: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = "#f97316" }) => (
  <path
    className="animate-pulse"
    fill={color}
    d={`M${x - 5} ${y} Q${x - 6} ${y - 10} ${x} ${y - 18} Q${x + 6} ${y - 10} ${x + 5} ${y} Z`}
  />
);

/** Tongue sticking out; (x, y) is the top-centre of the tongue. */
const Tongue: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path fill="#f472b6" d={`M${x - 8} ${y} h16 v12 q-8 10 -16 0 Z`} />
    <rect x={x - 0.75} y={y + 1} width="1.5" height="9" fill="#be185d" />
  </g>
);

/* ============================================================================
 * PER-BOT GESTURE CONFIG
 * Every bot gets its own positions, colour accent and unique extra details,
 * so the same gesture name looks different on each bot.
 * ========================================================================== */

type Pt = [number, number];

type GestureCfg = {
  accent: string;        // main gesture colour (hands, smile)
  smile: string;         // smile path fitted to this bot's mouth area
  hornsX: [number, number];
  hornsY: number;
  handL: Pt; handR: Pt;       // waving / cheek hands
  raiseL: Pt; raiseR: Pt;     // celebration hands
  fistL: Pt; fistR: Pt;       // rage fists
  steam: Pt[];
  tongue: Pt;
  sweat: Pt[];
  sparkles: Pt[];
  /** Unique, bot-specific extra details layered per gesture. */
  extras?: Partial<Record<BotGesture, React.ReactNode>>;
};

const RED = "#ef4444";
const DEVIL = "#dc2626";
const PANIC = "#c084fc";

const Gesture: React.FC<{ g: BotGesture; cfg: GestureCfg }> = ({ g, cfg }) => {
  if (g === 'none') return null;

  let body: React.ReactNode = null;

  switch (g) {
    case 'smile':
      body = (
        <>
          <path d={cfg.smile} stroke={cfg.accent} strokeWidth="4" fill="none" strokeLinecap="round" />
          <Sparkle x={cfg.sparkles[0][0]} y={cfg.sparkles[0][1]} s={6} color={cfg.accent} />
        </>
      );
      break;

    case 'rage':
      body = (
        <>
          {cfg.steam.map(([x, y], i) => <Steam key={i} x={x} y={y} />)}
          <Fist x={cfg.fistL[0]} y={cfg.fistL[1]} color={RED} />
          <Fist x={cfg.fistR[0]} y={cfg.fistR[1]} color={RED} />
        </>
      );
      break;

    case 'horns':
      body = <Horns x1={cfg.hornsX[0]} x2={cfg.hornsX[1]} y={cfg.hornsY} color={DEVIL} />;
      break;

    case 'hands':
      body = (
        <>
          <Palm x={cfg.handL[0]} y={cfg.handL[1]} color={cfg.accent} wave />
          <Palm x={cfg.handR[0]} y={cfg.handR[1]} color={cfg.accent} wave flip />
        </>
      );
      break;

    case 'taunt':
      body = (
        <>
          <path d={cfg.smile} stroke={cfg.accent} strokeWidth="4" fill="none" strokeLinecap="round" />
          <Tongue x={cfg.tongue[0]} y={cfg.tongue[1]} />
        </>
      );
      break;

    case 'celebrate':
      body = (
        <>
          <Palm x={cfg.raiseL[0]} y={cfg.raiseL[1]} color={cfg.accent} wave />
          <Palm x={cfg.raiseR[0]} y={cfg.raiseR[1]} color={cfg.accent} wave flip />
          {cfg.sparkles.map(([x, y], i) => <Sparkle key={i} x={x} y={y} color="#fde047" />)}
        </>
      );
      break;

    case 'panic':
      body = (
        <>
          {cfg.sweat.map(([x, y], i) => <Sweat key={i} x={x} y={y} />)}
          <Palm x={cfg.handL[0]} y={cfg.handL[1]} color={PANIC} wave fast />
          <Palm x={cfg.handR[0]} y={cfg.handR[1]} color={PANIC} wave fast flip />
        </>
      );
      break;
  }

  return (
    <g>
      {/* quick fade-in so gestures "pop" onto the face */}
      <animate attributeName="opacity" from="0" to="1" dur="0.25s" fill="freeze" />
      {body}
      {cfg.extras?.[g]}
    </g>
  );
};

/* ============================================================================
 * 1. JOYSTICK WRAITH  (retro console / pixel screen face)
 * ========================================================================== */

const WRAITH_CFG: GestureCfg = {
  accent: "#fbbf24",
  smile: "M66 108 Q100 124 134 108",
  hornsX: [58, 142], hornsY: 30,
  handL: [18, 110], handR: [182, 110],
  raiseL: [22, 56], raiseR: [178, 56],
  fistL: [20, 140], fistR: [180, 140],
  steam: [[60, 22], [140, 22]],
  tongue: [100, 112],
  sweat: [[170, 40], [32, 60]],
  sparkles: [[150, 60], [50, 60], [100, 14]],
  extras: {
    // Angry: red CRT scan-lines flicker across the pixel screen
    rage: (
      <g className="animate-pulse" fill={RED} opacity="0.55">
        <rect x="56" y="82" width="88" height="3" />
        <rect x="56" y="92" width="88" height="3" />
        <rect x="56" y="102" width="88" height="3" />
      </g>
    ),
    // Celebrate: pixel star on the screen
    celebrate: (
      <g fill="#fde047" className="animate-pulse">
        <rect x="97" y="86" width="6" height="6" />
        <rect x="91" y="92" width="18" height="6" />
        <rect x="97" y="98" width="6" height="6" />
      </g>
    ),
  },
};

export const JoystickWraith: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', ...props }) => {
  const g = resolveGesture(mood, gesture);
  return (
    <Frame {...props} label="Joystick Wraith">
      <path
        d="M50 40 L62 24 L84 24 L84 44 L116 44 L116 24 L138 24 L150 40
           L150 70 L164 78 L164 118 L150 126 L150 140 L140 150 L140 160
           L60 160 L60 150 L50 140 L50 126 L36 118 L36 78 L50 70 Z
           M56 76 H144 Q152 76 152 84 V110 Q152 118 144 118 H56 Q48 118 48 110 V84 Q48 76 56 76 Z
           M69 88 H75 V94 H81 V100 H75 V106 H69 V100 H63 V94 H69 Z
           M97 80 H103 V114 H97 Z
           M120 94 H138 V100 H120 Z
           M52 130 H64 V134 H52 Z
           M136 130 H148 V134 H136 Z
           M64 164 H72 V184 H64 Z
           M78 164 H86 V184 H78 Z
           M93 164 H107 V184 H93 Z
           M114 164 H122 V184 H114 Z
           M128 164 H136 V184 H128 Z"
      />
      <ExpressionOverlay mood={mood} hideMouth={hasOwnMouth(g)} />
      <Gesture g={g} cfg={WRAITH_CFG} />
    </Frame>
  );
};

/* ============================================================================
 * 2. CYCLOPS REVENANT  (single giant eye)
 * ========================================================================== */

const CYCLOPS_BRACKET = "M20 40 L36 22 L52 16 L52 24 L40 30 L28 44 Z";

const CYCLOPS_CFG: GestureCfg = {
  accent: "#fbbf24",
  smile: "M84 134 Q104 150 124 134",
  hornsX: [72, 140], hornsY: 52,
  handL: [24, 110], handR: [178, 110],
  raiseL: [24, 70], raiseR: [176, 70],
  fistL: [24, 120], fistR: [176, 120],
  steam: [[46, 70], [170, 70]],
  tongue: [104, 144],
  sweat: [[160, 60], [60, 60]],
  sparkles: [[60, 50], [150, 50], [100, 30]],
  extras: {
    // Angry: the big eye fires a red laser beam to the side
    rage: (
      <g className="animate-pulse">
        <circle cx="128" cy="92" r="9" fill={RED} />
        <path d="M145 92 L200 80 L200 104 Z" fill={RED} opacity="0.6" />
      </g>
    ),
    // Celebrate: radiating energy ring around the eye
    celebrate: (
      <g className="animate-pulse" fill="none" stroke="#fde047" strokeWidth="3">
        <circle cx="128" cy="92" r="24" />
        <circle cx="128" cy="92" r="30" opacity="0.5" />
      </g>
    ),
    // Panic: the eye shrinks to a nervous pinpoint
    panic: <circle cx="128" cy="92" r="4" fill="#c084fc" />,
  },
};

export const CyclopsRevenant: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', ...props }) => {
  const g = resolveGesture(mood, gesture);
  return (
    <Frame {...props} label="Cyclops Revenant">
      <path d={CYCLOPS_BRACKET} />
      <path d={CYCLOPS_BRACKET} transform="matrix(-1 0 0 1 200 0)" />
      <path d={CYCLOPS_BRACKET} transform="matrix(1 0 0 -1 0 200)" />
      <path d={CYCLOPS_BRACKET} transform="matrix(-1 0 0 -1 200 200)" />
      <path
        d="M60 100 C54 62 78 38 104 40 L118 40 L126 50 C150 56 162 76 158 100
           C157 112 150 120 142 124 L140 146 L130 146 L128 160 L116 160
           L114 148 L106 148 L104 160 L92 160 L90 146 L80 146 L78 130
           C66 124 62 112 60 100 Z
           M70 98 L92 106 L88 118 L72 114 Z
           M111 92 A17 17 0 1 0 145 92 A17 17 0 1 0 111 92 Z
           M117 92 A11 11 0 1 1 139 92 A11 11 0 1 1 117 92 Z
           M126 83 H130 V90 H137 V94 H130 V101 H126 V94 H119 V90 H126 Z
           M94 126 L100 114 L106 126 Z
           M96 149 H99 V158 H96 Z
           M108 149 H111 V158 H108 Z"
      />
      <ExpressionOverlay mood={mood} hideMouth={hasOwnMouth(g)} />
      <Gesture g={g} cfg={CYCLOPS_CFG} />
    </Frame>
  );
};

/* ============================================================================
 * 3. CHROME REAPER  (skull-like death mask)
 * ========================================================================== */

const REAPER_CFG: GestureCfg = {
  accent: "#fbbf24",
  smile: "M80 144 Q100 166 120 144",
  hornsX: [70, 130], hornsY: 30,
  handL: [18, 120], handR: [182, 120],
  raiseL: [20, 70], raiseR: [180, 70],
  fistL: [18, 150], fistR: [182, 150],
  steam: [[50, 40], [150, 40]],
  tongue: [100, 160],
  sweat: [[160, 60], [40, 60]],
  sparkles: [[50, 70], [150, 70], [100, 12]],
  extras: {
    // Smile: bony grin teeth
    smile: (
      <g stroke="#fbbf24" strokeWidth="2">
        <path d="M88 148 V156 M96 151 V160 M104 151 V160 M112 148 V156" />
      </g>
    ),
    // Angry: sockets blaze red
    rage: (
      <g className="animate-pulse" fill={RED}>
        <circle cx="130" cy="126" r="8" />
        <circle cx="70" cy="126" r="8" />
      </g>
    ),
    // Taunt: same bony grin
    taunt: (
      <g stroke="#fbbf24" strokeWidth="2">
        <path d="M88 148 V156 M96 151 V158 M104 151 V158 M112 148 V156" />
      </g>
    ),
    // Celebrate: ghostly scythe-blade slash above the head
    celebrate: <path d="M60 14 Q100 -6 140 14 Q100 4 60 14 Z" fill="#fde047" className="animate-pulse" />,
  },
};

export const ChromeReaper: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', ...props }) => {
  const g = resolveGesture(mood, gesture);
  return (
    <Frame {...props} label="Chrome Reaper">
      <path
        d="M84 20 H116 L144 30 L158 56 L160 100 L170 126 L164 150 L152 156
           L148 172 L136 184 L134 196 H118 L116 188 H106 L104 196 H96
           L94 188 H84 L82 196 H66 L64 184 L52 172 L48 156 L36 150
           L30 126 L40 100 L42 56 L56 30 Z
           M112 112 L142 106 L156 120 L150 138 L134 146 L116 138 Z
           M88 112 L58 106 L44 120 L50 138 L66 146 L84 138 Z
           M120 118 L138 114 L142 126 L130 132 Z
           M80 118 L62 114 L58 126 L70 132 Z
           M100 40 L124 54 V62 L100 48 L76 62 V54 Z
           M100 58 L124 72 V80 L100 66 L76 80 V72 Z
           M92 140 L108 140 L100 162 Z
           M72 30 H75 V46 H72 Z
           M125 30 H128 V46 H125 Z
           M87 172 H90 V186 H87 Z
           M110 172 H113 V186 H110 Z"
      />
      <ExpressionOverlay mood={mood} hideMouth={hasOwnMouth(g)} />
      <Gesture g={g} cfg={REAPER_CFG} />
    </Frame>
  );
};

/* ============================================================================
 * 4. OCTAVIAN HOLLOW  (hooded / crowned hollow-eyed knight)
 * ========================================================================== */

const OCTAVIAN_CFG: GestureCfg = {
  accent: "#fbbf24",
  smile: "M82 134 Q100 148 118 134",
  hornsX: [80, 120], hornsY: 40,
  handL: [30, 100], handR: [170, 100],
  raiseL: [28, 60], raiseR: [172, 60],
  fistL: [30, 106], fistR: [170, 106],
  steam: [[60, 50], [140, 50]],
  tongue: [100, 146],
  sweat: [[58, 70], [142, 70]],
  sparkles: [[56, 60], [144, 60], [100, 4]],
  extras: {
    // Angry: hollow eyes glow red
    rage: (
      <g className="animate-pulse" fill={RED}>
        <circle cx="80" cy="88" r="6" />
        <circle cx="120" cy="88" r="6" />
      </g>
    ),
    // Celebrate: golden halo above the crown
    celebrate: (
      <ellipse cx="100" cy="8" rx="24" ry="5" fill="none" stroke="#fde047" strokeWidth="3" className="animate-pulse" />
    ),
    // Smile: hollow eyes light up warmly
    smile: (
      <g fill="#fbbf24">
        <circle cx="80" cy="88" r="3" />
        <circle cx="120" cy="88" r="3" />
      </g>
    ),
  },
};

export const OctavianHollow: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', ...props }) => {
  const g = resolveGesture(mood, gesture);
  return (
    <Frame {...props} label="Octavian Hollow">
      <path d="M82 24 L90 14 H110 L118 24 H110 L104 18 H96 L90 24 Z" />
      <path d="M22 118 H36 V150 H58 V164 H22 Z" />
      <path d="M178 118 H164 V150 H142 V164 H178 Z" />
      <path
        d="M80 40 H120 L148 66 V112 L130 128 V146 H116 V164 L108 170 H92
           L84 164 V146 H70 V128 L52 112 V66 Z
           M70 82 L76 76 H84 L90 82 V94 L84 100 H76 L70 94 Z
           M110 82 L116 76 H124 L130 82 V94 L124 100 H116 L110 94 Z
           M96 108 H104 V122 H96 Z
           M88 148 H91 V162 H88 Z
           M109 148 H112 V162 H109 Z"
      />
      <ExpressionOverlay mood={mood} hideMouth={hasOwnMouth(g)} />
      <Gesture g={g} cfg={OCTAVIAN_CFG} />
    </Frame>
  );
};

/* ============================================================================
 * 5. IRON REGENT  (crowned armoured king)
 * ========================================================================== */

const REGENT_CFG: GestureCfg = {
  accent: "#fbbf24",
  smile: "M80 146 Q100 164 120 146",
  hornsX: [52, 148], hornsY: 64,
  handL: [24, 110], handR: [176, 110],
  raiseL: [24, 60], raiseR: [176, 60],
  fistL: [26, 140], fistR: [174, 140],
  steam: [[36, 80], [164, 80]],
  tongue: [100, 164],
  sweat: [[150, 70], [48, 70]],
  sparkles: [[46, 50], [154, 50], [100, 4]],
  extras: {
    // Angry: the crown catches fire
    rage: (
      <g>
        <Flame x={60} y={22} />
        <Flame x={100} y={14} color="#fb923c" />
        <Flame x={140} y={22} />
      </g>
    ),
    // Celebrate: royal rays burst above the crown
    celebrate: (
      <g stroke="#fde047" strokeWidth="3" strokeLinecap="round" className="animate-pulse">
        <path d="M100 4 V-2 M76 10 L70 4 M124 10 L130 4" />
      </g>
    ),
    // Smile: crown jewel glints
    smile: <circle cx="100" cy="58" r="3" fill="#fde047" className="animate-pulse" />,
  },
};

export const IronRegent: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', ...props }) => {
  const g = resolveGesture(mood, gesture);
  return (
    <Frame {...props} label="Iron Regent">
      <path
        d="M52 60 L60 22 L80 46 L100 14 L120 46 L140 22 L148 60 L156 64
           V132 L144 156 L128 172 V186 H72 V172 L56 156 L44 132 V64 Z
           M96 54 H104 V62 H112 V68 H104 V76 H96 V68 H88 V62 H96 Z
           M58 84 H142 V100 H112 V132 H88 V100 H58 Z
           M60 120 H74 V124 H60 Z
           M60 128 H74 V132 H60 Z
           M60 136 H74 V140 H60 Z
           M126 120 H140 V124 H126 Z
           M126 128 H140 V132 H126 Z
           M126 136 H140 V140 H126 Z
           M92 150 H108 V154 H92 Z
           M95 160 H105 V164 H95 Z"
      />
      <ExpressionOverlay mood={mood} hideMouth={hasOwnMouth(g)} />
      <Gesture g={g} cfg={REGENT_CFG} />
    </Frame>
  );
};

/* ============================================================================
 * 6. STATIC JESTER  (bells, visor, grille teeth)
 * ========================================================================== */

const JESTER_CFG: GestureCfg = {
  accent: "#fbbf24",
  smile: "M60 132 Q100 160 140 132",
  hornsX: [80, 120], hornsY: 58,
  handL: [22, 150], handR: [178, 150],
  raiseL: [20, 60], raiseR: [180, 60],
  fistL: [22, 150], fistR: [178, 150],
  steam: [[50, 50], [150, 50]],
  tongue: [100, 150],
  sweat: [[150, 50], [50, 50]],
  sparkles: [[46, 50], [154, 50], [100, 20]],
  extras: {
    // Celebrate: confetti pops all around
    celebrate: (
      <g className="animate-pulse">
        <rect x="40" y="30" width="5" height="5" fill="#f472b6" />
        <rect x="156" y="36" width="5" height="5" fill="#67e8f9" />
        <rect x="26" y="70" width="5" height="5" fill="#fde047" />
        <rect x="168" y="66" width="5" height="5" fill="#a3e635" />
        <rect x="100" y="8" width="5" height="5" fill="#fb923c" />
      </g>
    ),
    // Angry: the jester's bells turn red
    rage: (
      <g fill={RED}>
        <circle cx="65" cy="24" r="7" />
        <circle cx="135" cy="24" r="7" />
      </g>
    ),
    // Taunt: visor flashes pink
    taunt: <path d="M50 88 L86 98 L82 116 L54 108 Z M150 88 L114 98 L118 116 L146 108 Z" fill="#f472b6" opacity="0.5" className="animate-pulse" />,
  },
};

export const StaticJester: React.FC<BotFaceProps> = ({ mood = 'neutral', gesture = 'auto', ...props }) => {
  const g = resolveGesture(mood, gesture);
  return (
    <Frame {...props} label="Static Jester">
      <path d="M66 56 L62 32 H68 L74 56 Z" />
      <path d="M134 56 L138 32 H132 L126 56 Z" />
      <path d="M58 24 A7 7 0 1 0 72 24 A7 7 0 1 0 58 24 Z" />
      <path d="M128 24 A7 7 0 1 0 142 24 A7 7 0 1 0 128 24 Z" />
      <path d="M14 84 H28 V120 H14 Z" />
      <path d="M172 84 H186 V120 H172 Z" />
      <path
        d="M54 56 H146 Q164 56 164 74 V128 Q164 162 130 162 H70 Q36 162 36 128 V74 Q36 56 54 56 Z
           M100 64 L108 72 L100 80 L92 72 Z
           M50 88 L86 98 L82 116 L54 108 Z
           M150 88 L114 98 L118 116 L146 108 Z
           M62 100 L76 103 L74 110 L64 107 Z
           M138 100 L124 103 L126 110 L136 107 Z
           M56 128 H144 V150 H56 Z
           M67 131 H73 V147 H67 Z
           M79 131 H85 V147 H79 Z
           M91 131 H97 V147 H91 Z
           M103 131 H109 V147 H103 Z
           M115 131 H121 V147 H115 Z
           M127 131 H133 V147 H127 Z"
      />
      <ExpressionOverlay mood={mood} hideMouth={hasOwnMouth(g)} />
      <Gesture g={g} cfg={JESTER_CFG} />
    </Frame>
  );
};

/* ============================================================================
 * BOT REGISTRY
 * ========================================================================== */

export const CHESS_BOTS = [
  { id: "joystick-wraith", name: "Joystick Wraith", Face: JoystickWraith },
  { id: "static-jester", name: "Static Jester", Face: StaticJester },
  { id: "octavian-hollow", name: "Octavian Hollow", Face: OctavianHollow },
  { id: "iron-regent", name: "Iron Regent", Face: IronRegent },
  { id: "cyclops-revenant", name: "Cyclops Revenant", Face: CyclopsRevenant },
  { id: "chrome-reaper", name: "Chrome Reaper", Face: ChromeReaper },
] as const;

export type ChessBotId = (typeof CHESS_BOTS)[number]["id"];

/* ============================================================================
 * IN-GAME GESTURE PICKER
 * Each bot has its own personality: which gestures it uses for each mood.
 * Call pickGesture(botId, mood) when the mood changes and pass the result to
 * the face:  <Face mood={mood} gesture={pickGesture(botId, mood)} />
 * ========================================================================== */

type GestureSet = Partial<Record<BotMood, BotGesture[]>>;

const DEFAULT_GESTURES: GestureSet = {
  neutral: ['none'],
  thinking: ['none'],
  happy: ['smile', 'hands'],
  smug: ['taunt', 'smile'],
  shocked: ['panic'],
  worried: ['panic'],
  angry: ['rage', 'horns'],
  victory: ['celebrate', 'taunt'],
  defeat: ['none'],
};

export const BOT_GESTURE_SETS: Record<ChessBotId, GestureSet> = {
  "joystick-wraith": { ...DEFAULT_GESTURES, angry: ['rage'], happy: ['smile', 'hands'], victory: ['celebrate', 'hands'] },
  "static-jester": { ...DEFAULT_GESTURES, angry: ['horns', 'rage'], smug: ['taunt', 'hands'], victory: ['celebrate', 'taunt'] },
  "octavian-hollow": { ...DEFAULT_GESTURES, angry: ['rage', 'horns'], smug: ['smile', 'taunt'], victory: ['celebrate'] },
  "iron-regent": { ...DEFAULT_GESTURES, angry: ['rage'], smug: ['smile'], happy: ['smile'], victory: ['celebrate', 'smile'] },
  "cyclops-revenant": { ...DEFAULT_GESTURES, angry: ['rage', 'horns'], happy: ['smile'], victory: ['celebrate'] },
  "chrome-reaper": { ...DEFAULT_GESTURES, angry: ['horns', 'rage'], smug: ['taunt', 'smile'], victory: ['celebrate', 'taunt'] },
};

/** Returns a random gesture suited to this bot's personality and current mood. */
export const pickGesture = (botId: ChessBotId, mood: BotMood): BotGesture => {
  const pool = BOT_GESTURE_SETS[botId]?.[mood] ?? DEFAULT_GESTURES[mood] ?? ['none'];
  return pool[Math.floor(Math.random() * pool.length)];
};

/* ============================================================================
 * LINEUP (preview of all bots)
 * ========================================================================== */

export const ChessBotLineup: React.FC<{ size?: number; className?: string }> = ({
  size = 120,
  className,
}) => (
  <div
    className={className}
    style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: 24, justifyItems: "center" }}
  >
    {CHESS_BOTS.map(({ id, name, Face }) => (
      <figure key={id} style={{ margin: 0, textAlign: "center" }}>
        <Face size={size} />
        <figcaption style={{ marginTop: 8 }}>{name}</figcaption>
      </figure>
    ))}
  </div>
);

export default ChessBotLineup;
