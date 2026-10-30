/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import JSZip from "jszip";
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  FileCode,
  Download,
  Copy,
  Check,
  Smartphone,
  Terminal,
  Shield,
  Zap,
  Key,
  Compass,
  AlertTriangle,
  Github,
  Maximize2,
  Eye,
  Crosshair,
  Settings,
  Globe,
  Sliders,
  X,
  Gauge,
  Sparkles,
  Layers,
  Flame,
  Music,
  Trophy,
} from "lucide-react";
import { PROJECT_FILES, ProjectFile } from "./filesData";
import { soundEngine } from "./audio";
import { particleEngine } from "./particles";
import { getLevelConfig, LevelConfig, LEVELS } from "./levels";

// --- Dungeon Constants ---
const GRID_SIZE = 20;
const TILE_SIZE = 56; // Enlarged tile size for broader, more detailed view
const TACTICAL_TILE_SIZE = 24; // Tile size for full map view

// Colors & Palettes (Realistic 3D Dungeon Top-Down Theme)
const COLOR_FLOOR = "#131622";
const COLOR_FLOOR_LINE = "#1a1e2d";
const COLOR_WALL_TOP = "#2f384c";
const COLOR_WALL_FACE = "#1a202d";
const COLOR_WALL_BORDER = "#4a5775";
const COLOR_EXIT_PORTAL = "#10b981";
const COLOR_KEY = "#f59e0b";

export type Language = "en" | "ar";
export type Difficulty = "EASY" | "NORMAL" | "HARD";

export interface DifficultyConfig {
  speed: number;
  recalcInterval: number;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    speed: 1.65,
    recalcInterval: 48,
    labelEn: "Easy",
    labelAr: "سهل",
    descEn: "Slower beast (1.65x speed), relaxed 48-frame A* updates.",
    descAr: "وحش أبطأ (1.65x)، وتحديث مسار A* كل 48 إطاراً.",
    badgeBg: "bg-emerald-950/60",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/40",
  },
  NORMAL: {
    speed: 2.2,
    recalcInterval: 30,
    labelEn: "Normal",
    labelAr: "متوسط",
    descEn: "Standard beast (2.2x speed), balanced 30-frame A* pathfinding.",
    descAr: "سرعة قياسية (2.2x)، وتحديث مسار A* كل 30 إطاراً.",
    badgeBg: "bg-cyan-950/60",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/40",
  },
  HARD: {
    speed: 2.75,
    recalcInterval: 16,
    labelEn: "Hard",
    labelAr: "صعب",
    descEn: "Relentless aggressive beast (2.75x speed), rapid 16-frame A* updates.",
    descAr: "وحش مفترس وسريع (2.75x)، وتحديث مسار A* فائق كل 16 إطاراً.",
    badgeBg: "bg-red-950/60",
    badgeText: "text-red-400",
    badgeBorder: "border-red-500/40",
  },
};

export const TRANSLATIONS = {
  en: {
    appTitle: "Top-Down Dungeon Chase",
    perspectiveBadge: "Top-Down View",
    tabPlay: "Play",
    tabCode: "Python",
    tabGuide: "APK Guide",
    zipBtn: "ZIP",
    zipping: "Packaging...",
    settings: "Settings",
    language: "Language",
    langName: "English",
    difficulty: "Difficulty",
    beastSpeed: "Beast Speed",
    recalcRate: "A* Interval",

    // HUD
    hp: "HP",
    sp: "SP",
    keys: "KEYS",
    score: "SCORE",
    beastDist: "BEAST DIST",
    fullMapView: "Full Map View",
    followView: "Follow View",
    mapToggleHint: "Press [M] to toggle",
    radarTitle: "RADAR 20x20",
    controlsHint: "DRAG JOYSTICK OR USE WASD • SHIFT OR RUN BUTTON TO SPRINT",
    analogStick: "360° ANALOG",
    runBtn: "RUN",
    holdRun: "HOLD SPRINT",
    pauseKeyHint: "[Esc] Pause Game",

    // Menu
    menuTitle: "Dungeon Chase 2D",
    menuSubtitle: "20x20 Labyrinth • Pygame Android Engine",
    menuDesc: "Navigate the 20x20 top-down dungeon maze. Collect all 3 golden runes and reach the emerald portal before the A* chasing shadow beast catches you!",
    startBtn: "Start Dungeon Run (Tap Here)",
    highScore: "High Score",
    difficultyLabel: "Difficulty",
    featTopDownTitle: "Top-Down View",
    featTopDownDesc: "360° spatial awareness with smooth camera follow.",
    featAiTitle: "Adaptive A* AI",
    featAiDesc: "Beast hunts you relentlessly through the corridors.",
    featZeroFontTitle: "Zero-Font UI",
    featZeroFontDesc: "Pure vector geometry prevents Android crashes.",

    // Pause
    pauseTitle: "Game Paused",
    pauseDesc: "The shadow beast is stalking through the dark halls.",
    resumeBtn: "Resume Chase",
    openSettings: "Game Settings",
    quitBtn: "Quit to Title",

    // Game Over
    caughtTitle: "You Were Caught!",
    caughtDesc: "The beast cornered you in the labyrinth.",
    finalScore: "Final Score",
    survived: "Survived",
    keysFound: "Keys Found",
    retryBtn: "Try Again (Tap Here)",

    // Victory
    escapedTitle: "Dungeon Escaped!",
    escapedDesc: "You gathered all runes and escaped through the portal.",
    escapeTime: "Escape Time",
    runesRetrieved: "Runes Retrieved",
    nextRunBtn: "Advance to Next Level",
    replayLevelBtn: "Replay Level",
    levelCompleteTitle: "Level Escaped!",
    level: "Level",
    nextLevel: "Next Level",
    levelSelect: "Level Select",
    beastSpecie: "Beast Specie",
    particlesAtmosphere: "Particles & Motes",
    bgmMusic: "Dungeon BGM",

    // Settings Modal
    settingsTitle: "Game Settings & Options",
    settingsDifficultyHeading: "Beast Difficulty Level",
    settingsDifficultyDesc: "Select the challenge level. Affects beast movement speed and A* pathfinding recalculation frequency.",
    settingsLevelHeading: "Starting Dungeon Level",
    settingsLevelDesc: "Select which environmental biome to begin your escape in.",
    settingsLanguageHeading: "Interface Language",
    settingsLanguageDesc: "Choose interface language.",
    applyClose: "Apply & Continue",
  },
  ar: {
    appTitle: "مطاردة المتاهة من الأعلى",
    perspectiveBadge: "منظر من الأعلى",
    tabPlay: "لعب",
    tabCode: "أكواد بايثون",
    tabGuide: "دليل بناء APK",
    zipBtn: "تحميل ZIP",
    zipping: "جاري الضغط...",
    settings: "الإعدادات",
    language: "اللغة",
    langName: "العربية",
    difficulty: "مستوى الصعوبة",
    beastSpeed: "سرعة الوحش",
    recalcRate: "تحديث مسار A*",

    // HUD
    hp: "الحياة",
    sp: "الطاقة",
    keys: "المفاتيح",
    score: "النقاط",
    beastDist: "مسافة الوحش",
    fullMapView: "خريطة كاملة",
    followView: "كاميرا التتبع",
    mapToggleHint: "اضغط [M] للتبديل",
    radarTitle: "رادار 20×20",
    controlsHint: "اسحب عصا التحكم أو استخدم WASD • زر الجري للركض السريع",
    analogStick: "عصا 360°",
    runBtn: "ركض",
    holdRun: "اضغط للركض",
    pauseKeyHint: "[Esc] إيقاف مؤقت",

    // Menu
    menuTitle: "مطاردة المتاهة",
    menuSubtitle: "متاهة صخرية 20×20 • محرك بايثون وأندرويد",
    menuDesc: "تحكم في اللاعب داخل متاهة صخرية 20×20 مجسمة. اجمع كل تمائم الآثار واعبر البوابة قبل أن يقبض عليك وحش الظلال الذكي!",
    startBtn: "بدء الهروب من المتاهة (اضغط هنا)",
    highScore: "أعلى نتيجة",
    difficultyLabel: "الصعوبة",
    featTopDownTitle: "منظور علوي شامل",
    featTopDownDesc: "رؤية كاملة 360° مع كاميرا تتبع سلسة ومريحة.",
    featAiTitle: "ذكاء اصطناعي A*",
    featAiDesc: "وحش يقتفي أثرك عبر ممرات المتاهة بدون توقف.",
    featZeroFontTitle: "رسم شعاعي نقي",
    featZeroFontDesc: "بدون خطوط نظام لمنع أي انهيار على أندرويد.",

    // Pause
    pauseTitle: "اللعبة متوقفة مؤقتاً",
    pauseDesc: "وحش الظلال يتربص بك في الممرات المظلمة...",
    resumeBtn: "استئناف الهروب",
    openSettings: "إعدادات اللعبة والصعوبة",
    quitBtn: "العودة للقائمة الرئيسية",

    // Game Over
    caughtTitle: "تم الإمساك بك!",
    caughtDesc: "حاصرك وحش الظلال في ممرات المتاهة المظلمة.",
    finalScore: "النتيجة النهائية",
    survived: "زمن النجاة",
    keysFound: "التمائم التي جمعتها",
    retryBtn: "إعادة المحاولة (اضغط هنا)",

    // Victory
    escapedTitle: "تم اجتياز المستوى بنجاح!",
    escapedDesc: "جمعت كل التمائم وعبرت البوابة بسلام!",
    escapeTime: "وقت الهروب",
    runesRetrieved: "التمائم المسترجعة",
    nextRunBtn: "الانتقال للمستوى التالي",
    replayLevelBtn: "إعادة نفس المستوى",
    levelCompleteTitle: "اكتمل الهروب من المستوى!",
    level: "المستوى",
    nextLevel: "المستوى التالي",
    levelSelect: "اختيار المستوى",
    beastSpecie: "فصيلة الوحش",
    particlesAtmosphere: "نظام الجزيئات الحية",
    bgmMusic: "موسيقى تفاعلية BGM",

    // Settings Modal
    settingsTitle: "إعدادات اللعبة وخيارات الصعوبة",
    settingsDifficultyHeading: "مستوى صعوبة الوحش",
    settingsDifficultyDesc: "اختر مستوى التحدي. يؤثر على سرعة حركة الوحش وتكرار حساب مسار الذكاء الاصطناعي A*.",
    settingsLevelHeading: "المستوى البدائي للعب",
    settingsLevelDesc: "اختر البيئة والمتاهة التي تريد بدء المغامرة منها.",
    settingsLanguageHeading: "لغة اللعبة",
    settingsLanguageDesc: "اختر لغة واجهة اللعبة.",
    applyClose: "تطبيق ومتابعة اللعب",
  },
};

type GameState = "MENU" | "PLAYING" | "PAUSED" | "GAMEOVER" | "VICTORY";
type CameraMode = "FOLLOW" | "FULL_MAP";

interface KeyItem {
  id: number;
  x: number;
  y: number;
}

export default function App() {
  // Navigation / View modes
  const [activeTab, setActiveTab] = useState<"simulator" | "code" | "guide">("simulator");
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>("FOLLOW");

  // Language & Difficulty settings
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return (localStorage.getItem("dungeon_lang") as Language) || "ar";
    } catch {
      return "ar";
    }
  });

  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    try {
      return (localStorage.getItem("dungeon_diff") as Difficulty) || "NORMAL";
    } catch {
      return "NORMAL";
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const t = TRANSLATIONS[language];

  // High score tracking (mirrors local JSON persistence in Python)
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem("dungeon_high_score") || "0", 10);
    } catch {
      return 0;
    }
  });

  // Level Progression state
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem("dungeon_current_level") || "1", 10) || 1;
    } catch {
      return 1;
    }
  });

  // Game HUD state
  const [gameState, setGameState] = useState<GameState>("MENU");
  const [health, setHealth] = useState<number>(100);
  const [stamina, setStamina] = useState<number>(100);
  const [keysCollected, setKeysCollected] = useState<number>(0);
  const [totalKeys, setTotalKeys] = useState<number>(() => getLevelConfig(1).keyCount);
  const [gameScore, setGameScore] = useState<number>(0);
  const [surviveTime, setSurviveTime] = useState<number>(0);
  const [enemyDist, setEnemyDist] = useState<number>(15);
  const [isSprintingUI, setIsSprintingUI] = useState<boolean>(false);

  // Virtual Joystick Visual State
  const [stickPos, setStickPos] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game Loop State Ref (bypasses React re-renders for true 60fps simulation)
  const simRef = useRef({
    state: "MENU" as GameState,
    difficulty: difficulty as Difficulty,
    level: currentLevel,
    cameraMode: "FOLLOW" as CameraMode,
    camera: { x: 1.5 * TILE_SIZE, y: 1.5 * TILE_SIZE },
    grid: [] as number[][],
    player: {
      x: 1.5,
      y: 1.5,
      angle: 0.0,
      radius: 0.32,
      health: 100,
      stamina: 100,
      isSprinting: false,
      score: 0,
      time: 0,
    },
    enemy: {
      x: 18.5,
      y: 18.5,
      angle: 0.0,
      speed: DIFFICULTY_SETTINGS[difficulty].speed,
      dist: 999,
      path: [] as [number, number][],
      recalcTimer: 0,
      pulse: 0,
    },
    exitPos: { x: 18.5, y: 1.5 },
    keys: [] as KeyItem[],
    keysCollected: 0,
    keysTotal: 3,
    heartbeatTimer: 0,
    footstepTimer: 0,
    ambientTimer: 0,
    keysPressed: {
      w: false,
      s: false,
      a: false,
      d: false,
      shift: false,
    },
    virtualStick: {
      dx: 0,
      dy: 0,
    },
    isSprintingTouch: false,
  });

  const changeDifficulty = (newDiff: Difficulty) => {
    setDifficulty(newDiff);
    simRef.current.difficulty = newDiff;
    if (simRef.current.enemy) {
      simRef.current.enemy.speed = DIFFICULTY_SETTINGS[newDiff].speed;
    }
    try {
      localStorage.setItem("dungeon_diff", newDiff);
    } catch {
      // ignore
    }
  };

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem("dungeon_lang", newLang);
    } catch {
      // ignore
    }
  };

  // Keep cameraMode & difficulty ref in sync
  useEffect(() => {
    simRef.current.cameraMode = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    simRef.current.difficulty = difficulty;
    if (simRef.current.enemy) {
      simRef.current.enemy.speed = DIFFICULTY_SETTINGS[difficulty].speed;
    }
  }, [difficulty]);

  // Procedural 20x20 Maze Generation with distinct level architectures & chambers
  const generateMaze = useCallback((levelNum: number = 1) => {
    const levelConfig = getLevelConfig(levelNum);
    const grid: number[][] = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => 1)
    );

    // Randomized DFS recursive carving
    const stack: [number, number][] = [[1, 1]];
    grid[1][1] = 0;
    const dirs = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ];

    while (stack.length > 0) {
      const [cx, cy] = stack[stack.length - 1];
      const neighbors: [number, number, number, number][] = [];

      for (const [dx, dy] of dirs) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx > 0 && nx < GRID_SIZE - 1 && ny > 0 && ny < GRID_SIZE - 1) {
          if (grid[ny][nx] === 1) {
            neighbors.push([nx, ny, dx, dy]);
          }
        }
      }

      if (neighbors.length > 0) {
        const [nx, ny, dx, dy] = neighbors[Math.floor(Math.random() * neighbors.length)];
        grid[cy + dy / 2][cx + dx / 2] = 0;
        grid[ny][nx] = 0;
        stack.push([nx, ny]);
      } else {
        stack.pop();
      }
    }

    // Add corridor loops according to level complexity
    const loopChance = levelConfig.maze.corridorLoopChance;
    for (let y = 2; y < GRID_SIZE - 2; y++) {
      for (let x = 2; x < GRID_SIZE - 2; x++) {
        if (grid[y][x] === 1) {
          if (grid[y][x - 1] === 0 && grid[y][x + 1] === 0 && Math.random() < loopChance) {
            grid[y][x] = 0;
          } else if (grid[y - 1][x] === 0 && grid[y + 1][x] === 0 && Math.random() < loopChance) {
            grid[y][x] = 0;
          }
        }
      }
    }

    // Open thematic chambers based on level layout
    const layout = levelConfig.maze.chamberLayout;
    if (layout === "center") {
      for (let cy = 8; cy < 12; cy++) {
        for (let cx = 8; cx < 12; cx++) grid[cy][cx] = 0;
      }
    } else if (layout === "split") {
      // Twin arenas
      for (let cy = 4; cy < 8; cy++) {
        for (let cx = 4; cx < 8; cx++) grid[cy][cx] = 0;
      }
      for (let cy = 12; cy < 16; cy++) {
        for (let cx = 12; cx < 16; cx++) grid[cy][cx] = 0;
      }
    } else if (layout === "quads") {
      // 4 corner halls
      const rooms = [
        [3, 3],
        [14, 3],
        [3, 14],
        [14, 14],
      ];
      for (const [rx, ry] of rooms) {
        for (let dy = 0; dy < 3; dy++) {
          for (let dx = 0; dx < 3; dx++) grid[ry + dy][rx + dx] = 0;
        }
      }
    } else if (layout === "cross") {
      // Cruciform cross intersection halls
      for (let i = 4; i < 16; i++) {
        grid[10][i] = 0;
        grid[i][10] = 0;
      }
    } else {
      // Open pillars web
      for (let cy = 6; cy < 14; cy += 2) {
        for (let cx = 6; cx < 14; cx += 2) grid[cy][cx] = 0;
      }
    }

    // Enforce solid outer border
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[0][x] = 1;
      grid[GRID_SIZE - 1][x] = 1;
    }
    for (let y = 0; y < GRID_SIZE; y++) {
      grid[y][0] = 1;
      grid[y][GRID_SIZE - 1] = 1;
    }

    // Find open corridor tiles with connectivity
    const openTiles: { x: number; y: number; openNeighbors: number }[] = [];
    for (let y = 1; y < GRID_SIZE - 1; y++) {
      for (let x = 1; x < GRID_SIZE - 1; x++) {
        if (grid[y][x] === 0) {
          let openNeighbors = 0;
          if (grid[y - 1][x] === 0) openNeighbors++;
          if (grid[y + 1][x] === 0) openNeighbors++;
          if (grid[y][x - 1] === 0) openNeighbors++;
          if (grid[y][x + 1] === 0) openNeighbors++;
          openTiles.push({ x: x + 0.5, y: y + 0.5, openNeighbors });
        }
      }
    }

    // Pick player spawn in top-left quadrant
    const validPlayerTiles = openTiles.filter(
      (t) => t.x < 7 && t.y < 7 && t.openNeighbors >= 2
    );
    const chosenPlayer =
      validPlayerTiles.length > 0
        ? validPlayerTiles[Math.floor(Math.random() * validPlayerTiles.length)]
        : openTiles.find((t) => t.x < 7 && t.y < 7) ||
          openTiles[0] || { x: 1.5, y: 1.5, openNeighbors: 2 };
    const playerSpawn: [number, number] = [chosenPlayer.x, chosenPlayer.y];

    // Enemy spawn in far bottom-right quadrant
    const enemySpawnTile =
      openTiles
        .slice()
        .reverse()
        .find((t) => t.x > 12 && t.y > 12) || {
        x: 18.5,
        y: 18.5,
        openNeighbors: 2,
      };
    const enemySpawn: [number, number] = [enemySpawnTile.x, enemySpawnTile.y];

    // Exit spawn in top-right or bottom-left
    const exitTile =
      openTiles.find((t) => t.x > 13 && t.y < 7) ||
      openTiles[Math.floor(openTiles.length / 2)];
    const exitPos: [number, number] = [exitTile.x, exitTile.y];

    // Pick random key items matching levelConfig.keyCount
    const candidates = openTiles.filter(
      (t) =>
        (t.x !== playerSpawn[0] || t.y !== playerSpawn[1]) &&
        (t.x !== enemySpawn[0] || t.y !== enemySpawn[1]) &&
        (t.x !== exitPos[0] || t.y !== exitPos[1])
    );
    candidates.sort(() => Math.random() - 0.5);
    const keys: KeyItem[] = candidates
      .slice(0, levelConfig.keyCount)
      .map((t, i) => ({ id: i, x: t.x, y: t.y }));

    return { grid, playerSpawn, enemySpawn, exitPos, keys };
  }, []);

  // Optimized A* Algorithm on 20x20 grid (Recalculated periodically)
  const aStarSearch = useCallback(
    (
      start: [number, number],
      goal: [number, number],
      grid: number[][]
    ): [number, number][] => {
      if (start[0] === goal[0] && start[1] === goal[1]) return [start];

      const keyOf = (x: number, y: number) => `${x},${y}`;
      const openSet: [number, number, number][] = [[0, start[0], start[1]]];
      const cameFrom = new Map<string, [number, number]>();
      const gScore = new Map<string, number>();
      gScore.set(keyOf(start[0], start[1]), 0);

      const h = (ax: number, ay: number, bx: number, by: number) =>
        Math.abs(ax - bx) + Math.abs(ay - by);

      while (openSet.length > 0) {
        openSet.sort((a, b) => a[0] - b[0]);
        const [, cx, cy] = openSet.shift()!;

        if (cx === goal[0] && cy === goal[1]) {
          const path: [number, number][] = [[cx, cy]];
          let currKey = keyOf(cx, cy);
          while (cameFrom.has(currKey)) {
            const prev = cameFrom.get(currKey)!;
            path.push(prev);
            currKey = keyOf(prev[0], prev[1]);
          }
          return path.reverse();
        }

        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1],
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && grid[ny][nx] === 0) {
            const tentG = (gScore.get(keyOf(cx, cy)) ?? Infinity) + 1;
            const nKey = keyOf(nx, ny);
            if (tentG < (gScore.get(nKey) ?? Infinity)) {
              cameFrom.set(nKey, [cx, cy]);
              gScore.set(nKey, tentG);
              const fScore = tentG + h(nx, ny, goal[0], goal[1]);
              openSet.push([fScore, nx, ny]);
            }
          }
        }
      }
      return [start];
    },
    []
  );

  // Initialize a fresh game session for target level
  const startNewGame = useCallback(
    (targetLevel: number = currentLevel) => {
      const levelConfig = getLevelConfig(targetLevel);
      setCurrentLevel(targetLevel);
      setTotalKeys(levelConfig.keyCount);
      try {
        localStorage.setItem("dungeon_current_level", targetLevel.toString());
      } catch {
        // ignore
      }

      // Initialize background music and clear particle pool
      particleEngine.clear();
      soundEngine.startBGM(levelConfig.bgmMood);

      const mazeData = generateMaze(targetLevel);
      const sim = simRef.current;

      sim.level = targetLevel;
      sim.grid = mazeData.grid;
      sim.player = {
        x: mazeData.playerSpawn[0],
        y: mazeData.playerSpawn[1],
        angle: 0.0,
        radius: 0.32,
        health: 100,
        stamina: 100,
        isSprinting: false,
        score: targetLevel > 1 && sim.state === "VICTORY" ? sim.player.score : 0,
        time: 0,
      };
      sim.camera = {
        x: mazeData.playerSpawn[0] * TILE_SIZE,
        y: mazeData.playerSpawn[1] * TILE_SIZE,
      };
      sim.difficulty = difficulty;
      sim.enemy = {
        x: mazeData.enemySpawn[0],
        y: mazeData.enemySpawn[1],
        angle: 0.0,
        speed: DIFFICULTY_SETTINGS[difficulty].speed,
        dist: 999,
        path: [],
        recalcTimer: 0,
        pulse: 0,
      };
      sim.exitPos = { x: mazeData.exitPos[0], y: mazeData.exitPos[1] };
      sim.keys = mazeData.keys;
      sim.keysCollected = 0;
      sim.keysTotal = levelConfig.keyCount;
      sim.virtualStick.dx = 0;
      sim.virtualStick.dy = 0;
      sim.ambientTimer = 0;
      sim.state = "PLAYING";

      setStickPos({ x: 0, y: 0, active: false });
      setGameState("PLAYING");
      setHealth(100);
      setStamina(100);
      setKeysCollected(0);
      setGameScore(sim.player.score);
      setSurviveTime(0);
      setIsSprintingUI(false);
    },
    [generateMaze, difficulty, currentLevel]
  );

  // Touch Virtual Joystick Pointer Handlers
  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    updateJoystick(e.clientX, e.clientY, centerX, centerY);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stickPos.active && e.buttons === 0) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    updateJoystick(e.clientX, e.clientY, centerX, centerY);
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setStickPos({ x: 0, y: 0, active: false });
    simRef.current.virtualStick.dx = 0;
    simRef.current.virtualStick.dy = 0;
  };

  const updateJoystick = (clientX: number, clientY: number, centerX: number, centerY: number) => {
    const maxRadius = 30; // Compact bounds matching phone-friendly shrunk joystick
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setStickPos({ x: dx, y: dy, active: true });

    // Map direct 2D analog motion vector: -1.0 to +1.0
    simRef.current.virtualStick.dx = dx / maxRadius;
    simRef.current.virtualStick.dy = dy / maxRadius;
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const sim = simRef.current;
      const key = e.key.toLowerCase();

      if (key === "escape" || e.code === "Escape") {
        if (sim.state === "PLAYING") {
          sim.state = "PAUSED";
          setGameState("PAUSED");
        } else if (sim.state === "PAUSED") {
          sim.state = "PLAYING";
          setGameState("PLAYING");
        }
        return;
      }

      if (sim.state === "MENU" || sim.state === "GAMEOVER" || sim.state === "VICTORY") {
        if (key === " " || key === "enter") {
          startNewGame();
          return;
        }
      }

      // Camera toggle shortcut
      if (key === "m") {
        setCameraMode((prev) => (prev === "FOLLOW" ? "FULL_MAP" : "FOLLOW"));
      }

      if (key === "w" || e.key === "ArrowUp") sim.keysPressed.w = true;
      if (key === "s" || e.key === "ArrowDown") sim.keysPressed.s = true;
      if (key === "a" || e.key === "ArrowLeft") sim.keysPressed.a = true;
      if (key === "d" || e.key === "ArrowRight") sim.keysPressed.d = true;
      if (key === "shift") {
        sim.keysPressed.shift = true;
        setIsSprintingUI(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const sim = simRef.current;
      const key = e.key.toLowerCase();
      if (key === "w" || e.key === "ArrowUp") sim.keysPressed.w = false;
      if (key === "s" || e.key === "ArrowDown") sim.keysPressed.s = false;
      if (key === "a" || e.key === "ArrowLeft") sim.keysPressed.a = false;
      if (key === "d" || e.key === "ArrowRight") sim.keysPressed.d = false;
      if (key === "shift") {
        sim.keysPressed.shift = false;
        setIsSprintingUI(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [startNewGame]);

  // Main 60 FPS Game Loop with Top-Down Renderer
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05); // clamped dt prevents physics skips

      const sim = simRef.current;
      const canvas = canvasRef.current;

      if (sim.state === "PLAYING" && sim.grid.length > 0 && canvas) {
        // --- 1. Simulation Update ---
        sim.player.time += dt;

        // Gather 2D Movement Vectors (Keyboard + Virtual Joystick)
        let vx = 0;
        let vy = 0;

        if (sim.keysPressed.w) vy -= 1;
        if (sim.keysPressed.s) vy += 1;
        if (sim.keysPressed.a) vx -= 1;
        if (sim.keysPressed.d) vx += 1;

        // Blend with virtual analog stick
        vx += sim.virtualStick.dx;
        vy += sim.virtualStick.dy;

        // Normalize movement vector if magnitude > 1
        const inputMag = Math.hypot(vx, vy);
        if (inputMag > 1.0) {
          vx /= inputMag;
          vy /= inputMag;
        }

        const isMoving = inputMag > 0.08;

        // Update player facing angle when moving
        if (isMoving) {
          sim.player.angle = Math.atan2(vy, vx);
        }

        // Stamina and Sprinting
        const wantSprint = sim.keysPressed.shift || sim.isSprintingTouch;
        if (wantSprint && sim.player.stamina > 5 && isMoving) {
          sim.player.isSprinting = true;
          sim.player.stamina = Math.max(0, sim.player.stamina - 35 * dt);
        } else {
          sim.player.isSprinting = false;
          sim.player.stamina = Math.min(100, sim.player.stamina + 22 * dt);
        }

        const moveSpeed = sim.player.isSprinting ? 5.6 : 3.4;
        const dx = vx * moveSpeed * dt;
        const dy = vy * moveSpeed * dt;

        // Smooth wall sliding collision
        const checkWall = (px: number, py: number) => {
          const r = sim.player.radius;
          const checks = [
            [px - r, py - r],
            [px + r, py - r],
            [px - r, py + r],
            [px + r, py + r],
            [px, py - r],
            [px, py + r],
            [px - r, py],
            [px + r, py],
          ];
          for (const [cx, cy] of checks) {
            const gx = Math.floor(cx);
            const gy = Math.floor(cy);
            if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE || sim.grid[gy][gx] === 1) {
              return true;
            }
          }
          return false;
        };

        const currentLvl = getLevelConfig(sim.level || 1);

        // Wall collision with sparks emission on contact
        if (!checkWall(sim.player.x + dx, sim.player.y)) {
          sim.player.x += dx;
        } else if (Math.abs(dx) > 0.001) {
          particleEngine.emitWallSparks(
            sim.player.x * TILE_SIZE,
            sim.player.y * TILE_SIZE,
            dx > 0 ? -1 : 1,
            0
          );
        }

        if (!checkWall(sim.player.x, sim.player.y + dy)) {
          sim.player.y += dy;
        } else if (Math.abs(dy) > 0.001) {
          particleEngine.emitWallSparks(
            sim.player.x * TILE_SIZE,
            sim.player.y * TILE_SIZE,
            0,
            dy > 0 ? -1 : 1
          );
        }

        // Emit player glimmer particle trail when moving
        if (isMoving) {
          particleEngine.emitPlayerGlimmer(
            sim.player.x * TILE_SIZE,
            sim.player.y * TILE_SIZE,
            sim.player.isSprinting
          );
        }

        // Atmospheric dust motes floating in the air
        sim.ambientTimer = (sim.ambientTimer || 0) + dt;
        if (sim.ambientTimer >= 0.06) {
          sim.ambientTimer = 0;
          const pWorldX = sim.player.x * TILE_SIZE;
          const pWorldY = sim.player.y * TILE_SIZE;
          const spreadX = canvas.width * 0.75;
          const spreadY = canvas.height * 0.75;
          const ax = pWorldX + (Math.random() - 0.5) * spreadX;
          const ay = pWorldY + (Math.random() - 0.5) * spreadY;
          const ambColors = currentLvl.ambientColors;
          const chosenColor = ambColors[Math.floor(Math.random() * ambColors.length)];
          particleEngine.emitDustMote(ax, ay, chosenColor);
        }

        // Smooth camera follow lerp
        const targetCamX = sim.player.x * TILE_SIZE;
        const targetCamY = sim.player.y * TILE_SIZE;
        sim.camera.x += (targetCamX - sim.camera.x) * 0.12;
        sim.camera.y += (targetCamY - sim.camera.y) * 0.12;

        // Footstep audio
        if (isMoving) {
          sim.footstepTimer += dt;
          const stepInterval = sim.player.isSprinting ? 0.26 : 0.42;
          if (sim.footstepTimer >= stepInterval) {
            sim.footstepTimer = 0;
            soundEngine.playFootstep();
          }
        }

        // Check key pickups with golden burst particles
        sim.keys = sim.keys.filter((k) => {
          const dist = Math.hypot(sim.player.x - k.x, sim.player.y - k.y);
          if (dist < 0.7) {
            sim.keysCollected += 1;
            sim.player.score += 500;
            soundEngine.playKeyCollect();
            particleEngine.emitKeyBurst(
              k.x * TILE_SIZE,
              k.y * TILE_SIZE,
              currentLvl.keyColor
            );
            return false;
          }
          return true;
        });

        // Check Exit Escape
        if (sim.keysCollected >= sim.keysTotal) {
          const exitDist = Math.hypot(sim.player.x - sim.exitPos.x, sim.player.y - sim.exitPos.y);
          if (exitDist < 0.85) {
            particleEngine.emitPortalAura(
              sim.exitPos.x * TILE_SIZE,
              sim.exitPos.y * TILE_SIZE,
              currentLvl.portalColor
            );
            sim.player.score += 2000 + Math.floor(Math.max(0, 300 - sim.player.time) * 10);
            soundEngine.playVictory();
            sim.state = "VICTORY";
            setGameState("VICTORY");

            // Save highscore
            if (sim.player.score > highScore) {
              setHighScore(sim.player.score);
              try {
                localStorage.setItem("dungeon_high_score", sim.player.score.toString());
              } catch {
                // ignore
              }
            }
          }
        }

        // Enemy AI Update (A* recalculation cycle every 30 frames)
        const en = sim.enemy;
        en.pulse = (en.pulse + dt * 4.5) % (2 * Math.PI);
        const edx = sim.player.x - en.x;
        const edy = sim.player.y - en.y;
        en.dist = Math.hypot(edx, edy);

        // Catch check
        if (en.dist < 0.65) {
          sim.player.health -= 60 * dt;
          if (sim.player.health <= 0) {
            soundEngine.playAlert();
            sim.state = "GAMEOVER";
            setGameState("GAMEOVER");
            if (sim.player.score > highScore) {
              setHighScore(sim.player.score);
              try {
                localStorage.setItem("dungeon_high_score", sim.player.score.toString());
              } catch {
                // ignore
              }
            }
          }
        }

        // Periodic A* Pathfinding (tuned by difficulty setting)
        const diffConfig = DIFFICULTY_SETTINGS[sim.difficulty || "NORMAL"];
        en.recalcTimer += 1;
        if (en.recalcTimer >= diffConfig.recalcInterval || en.path.length === 0) {
          en.recalcTimer = 0;
          en.path = aStarSearch(
            [Math.floor(en.x), Math.floor(en.y)],
            [Math.floor(sim.player.x), Math.floor(sim.player.y)],
            sim.grid
          );
        }

        // Move along path
        let targetX = sim.player.x;
        let targetY = sim.player.y;
        if (en.path.length > 1) {
          const nextNode = en.path[1];
          targetX = nextNode[0] + 0.5;
          targetY = nextNode[1] + 0.5;
          if (Math.hypot(targetX - en.x, targetY - en.y) < 0.25) {
            en.path.shift();
          }
        }

        const etdx = targetX - en.x;
        const etdy = targetY - en.y;
        const etdist = Math.hypot(etdx, etdy);
        if (etdist > 0.001) {
          en.angle = Math.atan2(etdy, etdx);
          const moveStep = Math.min(diffConfig.speed * dt, etdist);
          const nx = en.x + (etdx / etdist) * moveStep;
          const ny = en.y + (etdy / etdist) * moveStep;
          const gx = Math.floor(nx);
          const gy = Math.floor(ny);
          if (gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE && sim.grid[gy][gx] === 0) {
            en.x = nx;
            en.y = ny;
            // Emit beast smoke and sparks trail
            particleEngine.emitBeastSmoke(
              en.x * TILE_SIZE,
              en.y * TILE_SIZE,
              en.angle,
              currentLvl.beast.smokeColors
            );
          }
        }

        // Proximity Heartbeat Audio
        const beatInterval = Math.max(0.22, Math.min(1.4, en.dist * 0.11));
        sim.heartbeatTimer += dt;
        if (sim.heartbeatTimer >= beatInterval) {
          sim.heartbeatTimer = 0;
          if (en.dist < 8.5) {
            soundEngine.playHeartbeat();
          }
        }

        // Update particle physics simulation & dynamic BGM tension
        particleEngine.update(dt);
        soundEngine.updateBGMTension(en.dist);

        // Sync React HUD state
        setHealth(Math.round(sim.player.health));
        setStamina(Math.round(sim.player.stamina));
        setKeysCollected(sim.keysCollected);
        setGameScore(sim.player.score);
        setSurviveTime(Math.round(sim.player.time));
        setEnemyDist(Math.round(en.dist * 10) / 10);

        // --- 2. Top-Down Canvas Rendering ---
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const W = canvas.width;
          const H = canvas.height;

          // Clear background
          ctx.fillStyle = "#0a0a0f";
          ctx.fillRect(0, 0, W, H);

          ctx.save();

          let curTileSize = TILE_SIZE;
          let offsetX = 0;
          let offsetY = 0;

          if (sim.cameraMode === "FOLLOW") {
            curTileSize = TILE_SIZE;
            offsetX = W / 2 - sim.camera.x;
            offsetY = H / 2 - sim.camera.y;
            ctx.translate(offsetX, offsetY);
          } else {
            // Full Map Tactical Mode (Fit full 20x20 in center)
            curTileSize = Math.min(W, H) / (GRID_SIZE + 1);
            offsetX = (W - GRID_SIZE * curTileSize) / 2;
            offsetY = (H - GRID_SIZE * curTileSize) / 2;
            ctx.translate(offsetX, offsetY);
          }

          // --- 1. Render Realistic 3D Dungeon Grid (Floors & Walls) ---
          for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
              const rx = x * curTileSize;
              const ry = y * curTileSize;

              if (sim.grid[y][x] === 0) {
                // Open Floor Corridor: Level-specific pavers
                ctx.fillStyle = currentLvl.floorColor;
                ctx.fillRect(rx, ry, curTileSize, curTileSize);

                // Subtle inner stone tile seams
                ctx.strokeStyle = currentLvl.floorLineColor;
                ctx.lineWidth = 1;
                ctx.strokeRect(rx, ry, curTileSize, curTileSize);

                // Environmental Floor Details per Theme
                if (currentLvl.floorType === "magma") {
                  if ((x * 3 + y * 7) % 5 === 0) {
                    ctx.strokeStyle = "rgba(249, 115, 22, 0.45)";
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(rx + curTileSize * 0.2, ry + curTileSize * 0.3);
                    ctx.lineTo(rx + curTileSize * 0.55, ry + curTileSize * 0.65);
                    ctx.lineTo(rx + curTileSize * 0.85, ry + curTileSize * 0.4);
                    ctx.stroke();
                  }
                } else if (currentLvl.floorType === "moss") {
                  if ((x * 2 + y) % 3 === 0) {
                    ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
                    ctx.beginPath();
                    ctx.arc(rx + curTileSize * 0.35, ry + curTileSize * 0.35, 3, 0, Math.PI * 2);
                    ctx.arc(rx + curTileSize * 0.65, ry + curTileSize * 0.65, 2, 0, Math.PI * 2);
                    ctx.fill();
                  }
                } else if (currentLvl.floorType === "frost") {
                  if ((x + y) % 3 === 0) {
                    ctx.strokeStyle = "rgba(165, 243, 252, 0.35)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(rx + curTileSize * 0.3, ry + curTileSize * 0.5);
                    ctx.lineTo(rx + curTileSize * 0.7, ry + curTileSize * 0.5);
                    ctx.moveTo(rx + curTileSize * 0.5, ry + curTileSize * 0.3);
                    ctx.lineTo(rx + curTileSize * 0.5, ry + curTileSize * 0.7);
                    ctx.stroke();
                  }
                } else if (currentLvl.floorType === "void") {
                  if ((x + y * 2) % 4 === 0) {
                    ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(rx + curTileSize * 0.5, ry + curTileSize * 0.5, curTileSize * 0.22, 0, Math.PI * 2);
                    ctx.stroke();
                  }
                } else if (currentLvl.floorType === "crystal") {
                  if ((x * 3 + y) % 4 === 0) {
                    ctx.fillStyle = "rgba(236, 72, 153, 0.3)";
                    ctx.beginPath();
                    ctx.moveTo(rx + curTileSize * 0.5, ry + curTileSize * 0.25);
                    ctx.lineTo(rx + curTileSize * 0.65, ry + curTileSize * 0.5);
                    ctx.lineTo(rx + curTileSize * 0.5, ry + curTileSize * 0.75);
                    ctx.lineTo(rx + curTileSize * 0.35, ry + curTileSize * 0.5);
                    ctx.closePath();
                    ctx.fill();
                  }
                } else if (curTileSize >= 36) {
                  // Staggered paving joints for ancient masonry
                  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
                  ctx.beginPath();
                  ctx.moveTo(rx + curTileSize * 0.5, ry);
                  ctx.lineTo(rx + curTileSize * 0.5, ry + curTileSize * 0.5);
                  ctx.moveTo(rx, ry + curTileSize * 0.5);
                  ctx.lineTo(rx + curTileSize, ry + curTileSize * 0.5);
                  ctx.stroke();
                }
              } else {
                // --- Realistic 3D Wall Block ---
                // A. Cast 3D Drop Shadow onto neighboring floor corridors
                if (y + 1 < GRID_SIZE && sim.grid[y + 1][x] === 0) {
                  const shadowGrad = ctx.createLinearGradient(rx, ry + curTileSize, rx, ry + curTileSize + 10);
                  shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.55)");
                  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
                  ctx.fillStyle = shadowGrad;
                  ctx.fillRect(rx, ry + curTileSize, curTileSize, 10);
                }
                if (x + 1 < GRID_SIZE && sim.grid[y][x + 1] === 0) {
                  const shadowGradR = ctx.createLinearGradient(rx + curTileSize, ry, rx + curTileSize + 10, ry);
                  shadowGradR.addColorStop(0, "rgba(0, 0, 0, 0.45)");
                  shadowGradR.addColorStop(1, "rgba(0, 0, 0, 0.0)");
                  ctx.fillStyle = shadowGradR;
                  ctx.fillRect(rx + curTileSize, ry, 10, curTileSize);
                }

                // B. Wall Top Cap (Linear bevel gradient per level)
                const wallGrad = ctx.createLinearGradient(rx, ry, rx + curTileSize, ry + curTileSize);
                wallGrad.addColorStop(0, currentLvl.wallTop[0]);
                wallGrad.addColorStop(1, currentLvl.wallTop[1]);
                ctx.fillStyle = wallGrad;
                ctx.fillRect(rx, ry, curTileSize, curTileSize);

                // C. 3D Wall Front Edge Extrusion (Height Depth)
                const faceH = curTileSize * 0.28;
                const faceGrad = ctx.createLinearGradient(rx, ry + curTileSize - faceH, rx, ry + curTileSize);
                faceGrad.addColorStop(0, currentLvl.wallFace[0]);
                faceGrad.addColorStop(1, currentLvl.wallFace[1]);
                ctx.fillStyle = faceGrad;
                ctx.fillRect(rx, ry + curTileSize - faceH, curTileSize, faceH);

                // D. Specular Ridge Highlight Line along top of front edge
                ctx.strokeStyle = currentLvl.wallSpecular;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(rx, ry + curTileSize - faceH);
                ctx.lineTo(rx + curTileSize, ry + curTileSize - faceH);
                ctx.stroke();

                // E. Masonry stone brick seams on front face
                if (curTileSize >= 36) {
                  ctx.strokeStyle = "#0d1017";
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.moveTo(rx + curTileSize * 0.33, ry + curTileSize - faceH);
                  ctx.lineTo(rx + curTileSize * 0.33, ry + curTileSize);
                  ctx.moveTo(rx + curTileSize * 0.66, ry + curTileSize - faceH);
                  ctx.lineTo(rx + curTileSize * 0.66, ry + curTileSize);
                  ctx.stroke();
                }

                // F. Top-Left Beveled Rim Specular Highlight
                ctx.strokeStyle = currentLvl.wallSpecular;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(rx, ry + curTileSize);
                ctx.lineTo(rx, ry);
                ctx.lineTo(rx + curTileSize, ry);
                ctx.stroke();

                // G. Outer Wall Border
                ctx.strokeStyle = currentLvl.wallBorder;
                ctx.lineWidth = 1;
                ctx.strokeRect(rx, ry, curTileSize, curTileSize);
              }
            }
          }

          // --- 2. Render Exit Portal (3D Mystical Vortex) ---
          const ex = sim.exitPos.x * curTileSize;
          const ey = sim.exitPos.y * curTileSize;
          const portalReady = sim.keysCollected >= sim.keysTotal;

          ctx.save();
          // Ancient corner monolith pillars casting shadows inward
          const cornerPillars = [
            [-curTileSize * 0.42, -curTileSize * 0.42],
            [curTileSize * 0.42, -curTileSize * 0.42],
            [-curTileSize * 0.42, curTileSize * 0.42],
            [curTileSize * 0.42, curTileSize * 0.42],
          ];
          for (const [cx, cy] of cornerPillars) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(ex + cx - 2, ey + cy - 2, 8, 8);
            ctx.fillStyle = portalReady ? "#10b981" : "#475569";
            ctx.fillRect(ex + cx - 4, ey + cy - 4, 8, 8);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.strokeRect(ex + cx - 4, ey + cy - 4, 8, 8);
          }

          // Outer energy vortex ring
          ctx.beginPath();
          ctx.arc(ex, ey, curTileSize * 0.44, 0, Math.PI * 2);
          ctx.fillStyle = portalReady ? currentLvl.portalGlow : "rgba(71, 85, 105, 0.25)";
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = portalReady ? currentLvl.portalColor : "#64748b";
          ctx.stroke();

          // Swirling rotating energy rings
          ctx.save();
          ctx.translate(ex, ey);
          ctx.rotate(sim.player.time * (portalReady ? 2.5 : 0.8));
          ctx.beginPath();
          ctx.arc(0, 0, curTileSize * 0.28, 0, Math.PI * 2);
          ctx.strokeStyle = portalReady ? currentLvl.portalColor : "#94a3b8";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Swirling core
          ctx.beginPath();
          ctx.arc(0, 0, curTileSize * 0.16, 0, Math.PI * 2);
          ctx.fillStyle = portalReady ? currentLvl.portalColor : "#475569";
          ctx.fill();
          ctx.restore();
          ctx.restore();

          // --- 3. Render Relic Keys (Floating 3D Golden Runes) ---
          for (const key of sim.keys) {
            const kx = key.x * curTileSize;
            const ky = key.y * curTileSize;
            const bobY = Math.sin(sim.player.time * 4.5 + key.id * 2) * 4;

            ctx.save();
            // Drop shadow on floor beneath key (expands/contracts with bob)
            ctx.beginPath();
            ctx.ellipse(kx, ky + 8, curTileSize * 0.22 - bobY * 0.3, curTileSize * 0.11 - bobY * 0.15, 0, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.fill();

            // Golden aura pulse
            ctx.beginPath();
            ctx.arc(kx, ky + bobY, curTileSize * 0.34, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(245, 158, 11, 0.25)";
            ctx.fill();

            // 3D Themed Key Emblem
            ctx.translate(kx, ky + bobY);
            ctx.fillStyle = currentLvl.keyColor;
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, -4, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.rect(-2.5, -4, 5, 14);
            ctx.rect(2.5, 2, 4, 3);
            ctx.rect(2.5, 7, 4, 3);
            ctx.fill();

            // Specular sparkle glint
            const glint = (Math.sin(sim.player.time * 6 + key.id) + 1) * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${glint})`;
            ctx.beginPath();
            ctx.arc(-2, -6, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // --- 4. Render A* Chasing Enemy (Realistic 3D Beast) ---
          const enx = sim.enemy.x * curTileSize;
          const eny = sim.enemy.y * curTileSize;
          const beastRadius = curTileSize * 0.38;

          ctx.save();
          // Drop shadow on floor beneath beast
          ctx.beginPath();
          ctx.ellipse(enx, eny + 6, beastRadius * 1.3, beastRadius * 0.7, 0, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
          ctx.fill();

          // Menacing terror aura ripples
          ctx.beginPath();
          ctx.arc(enx, eny, beastRadius * 1.8 + Math.sin(sim.enemy.pulse) * 5, 0, Math.PI * 2);
          ctx.fillStyle = `${currentLvl.beast.borderColor}33`;
          ctx.fill();

          ctx.translate(enx, eny);
          ctx.rotate(sim.enemy.angle);

          // 3D Jagged Demonic Carapace (Themed)
          ctx.fillStyle = currentLvl.beast.bodyColor;
          ctx.strokeStyle = currentLvl.beast.borderColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(beastRadius * 1.3, 0); // Spiked snout
          ctx.lineTo(-beastRadius * 0.5, -beastRadius * 1.1); // Left horn
          ctx.lineTo(-beastRadius * 0.3, -beastRadius * 0.5);
          ctx.lineTo(-beastRadius * 0.9, -beastRadius * 0.6); // Left flank
          ctx.lineTo(-beastRadius * 0.5, 0); // Spine cleft
          ctx.lineTo(-beastRadius * 0.9, beastRadius * 0.6); // Right flank
          ctx.lineTo(-beastRadius * 0.3, beastRadius * 0.5);
          ctx.lineTo(-beastRadius * 0.5, beastRadius * 1.1); // Right horn
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Inner molten core
          ctx.fillStyle = currentLvl.beast.coreColor;
          ctx.beginPath();
          ctx.ellipse(-beastRadius * 0.1, 0, beastRadius * 0.45, beastRadius * 0.28, 0, 0, Math.PI * 2);
          ctx.fill();

          // Glowing predatory slit eyes
          ctx.fillStyle = currentLvl.beast.eyeColor;
          ctx.shadowColor = currentLvl.beast.coreColor;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(beastRadius * 0.4, -beastRadius * 0.3, 3, 0, Math.PI * 2);
          ctx.arc(beastRadius * 0.4, beastRadius * 0.3, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();

          // --- 5. Render Player Character (Realistic 3D Adventurer Sphere) ---
          const plx = sim.player.x * curTileSize;
          const ply = sim.player.y * curTileSize;
          const playerRadius = curTileSize * 0.34;

          ctx.save();
          // Drop shadow on floor beneath player
          ctx.beginPath();
          ctx.ellipse(plx + 2, ply + 5, playerRadius * 1.15, playerRadius * 0.65, 0, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
          ctx.fill();

          // Dynamic torchlight illumination aura on ground
          const torchPulse = Math.sin(sim.player.time * 6) * 3;
          const torchRadius = curTileSize * 2.8 + torchPulse;
          const torchAura = ctx.createRadialGradient(plx, ply, playerRadius, plx, ply, torchRadius);
          torchAura.addColorStop(0, "rgba(6, 182, 212, 0.28)");
          torchAura.addColorStop(0.5, "rgba(6, 182, 212, 0.12)");
          torchAura.addColorStop(1, "rgba(6, 182, 212, 0.0)");
          ctx.fillStyle = torchAura;
          ctx.beginPath();
          ctx.arc(plx, ply, torchRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.translate(plx, ply);
          ctx.rotate(sim.player.angle);

          // 3D Metallic Sphere Power-Armor Chassis
          const playerGrad = ctx.createRadialGradient(
            -playerRadius * 0.3,
            -playerRadius * 0.3,
            playerRadius * 0.1,
            0,
            0,
            playerRadius
          );
          playerGrad.addColorStop(0, "#38bdf8");
          playerGrad.addColorStop(0.6, "#0284c7");
          playerGrad.addColorStop(1, "#0369a1");
          ctx.fillStyle = playerGrad;
          ctx.beginPath();
          ctx.arc(0, 0, playerRadius, 0, Math.PI * 2);
          ctx.fill();

          // Outer Specular Rim Highlight
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Dark Visor Dome with Glowing Energy Bar
          ctx.fillStyle = "#082f49";
          ctx.beginPath();
          ctx.ellipse(playerRadius * 0.2, 0, playerRadius * 0.45, playerRadius * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();

          // Visor Laser Slit
          ctx.fillStyle = "#67e8f9";
          ctx.fillRect(playerRadius * 0.1, -playerRadius * 0.12, playerRadius * 0.3, playerRadius * 0.24);

          // 3D Directional Chevron Pointer
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(playerRadius * 1.3, 0);
          ctx.lineTo(playerRadius * 0.5, -playerRadius * 0.45);
          ctx.lineTo(playerRadius * 0.65, 0);
          ctx.lineTo(playerRadius * 0.5, playerRadius * 0.45);
          ctx.closePath();
          ctx.fill();

          ctx.restore();

          // --- 6. Render Canvas Particle Engine (Zero-Font Primitives) ---
          const viewBounds = sim.cameraMode === "FOLLOW"
            ? {
                minX: sim.camera.x - W,
                maxX: sim.camera.x + W,
                minY: sim.camera.y - H,
                maxY: sim.camera.y + H,
              }
            : {
                minX: -200,
                maxX: GRID_SIZE * curTileSize + 200,
                minY: -200,
                maxY: GRID_SIZE * curTileSize + 200,
              };
          particleEngine.render(ctx, viewBounds);

          // --- 7. Ambient Vignette / Fog of War in Follow Mode ---
          if (sim.cameraMode === "FOLLOW") {
            ctx.restore(); // restore to screen coords
            ctx.save();

            const pScreenX = W / 2;
            const pScreenY = H / 2;

            const radialGrad = ctx.createRadialGradient(
              pScreenX,
              pScreenY,
              curTileSize * 3.0,
              pScreenX,
              pScreenY,
              Math.max(W, H) * 0.68
            );
            radialGrad.addColorStop(0, "rgba(10, 10, 16, 0.0)");
            radialGrad.addColorStop(0.5, "rgba(10, 10, 16, 0.45)");
            radialGrad.addColorStop(1, "rgba(10, 10, 16, 0.88)");

            ctx.fillStyle = radialGrad;
            ctx.fillRect(0, 0, W, H);

            // Red warning danger vignette when beast is near
            if (sim.enemy.dist < 6.0) {
              const threatAlpha = Math.min(0.65, ((6.0 - sim.enemy.dist) / 6.0) * 0.75);
              const dangerGrad = ctx.createRadialGradient(
                pScreenX,
                pScreenY,
                curTileSize * 1.5,
                pScreenX,
                pScreenY,
                Math.max(W, H) * 0.72
              );
              dangerGrad.addColorStop(0, "rgba(220, 38, 38, 0.0)");
              dangerGrad.addColorStop(1, `rgba(220, 38, 38, ${threatAlpha})`);
              ctx.fillStyle = dangerGrad;
              ctx.fillRect(0, 0, W, H);
            }

            // --- 8. STATIC 20x20 MINI-MAP OVERLAY IN THE CORNER ---
            const mapSize = 108; // 108px compact square
            const cellW = mapSize / GRID_SIZE; // 5.4px per cell
            const mapX = W - mapSize - 16;
            const mapY = 56; // Cleanly positioned below HUD view mode button

            // Radar background frame & drop shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
            ctx.shadowBlur = 12;
            ctx.fillStyle = "rgba(8, 12, 20, 0.92)";
            ctx.beginPath();
            ctx.roundRect(mapX - 5, mapY - 5, mapSize + 10, mapSize + 22, 8);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Tactical glowing border
            ctx.strokeStyle = "rgba(6, 182, 212, 0.55)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Radar title and coordinates bar with Level info
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 9px monospace";
            ctx.fillText(`LVL ${sim.level || 1} • RADAR`, mapX, mapY + mapSize + 11);
            ctx.fillStyle = "#94a3b8";
            ctx.font = "8px monospace";
            ctx.fillText(`[${Math.floor(sim.player.x)},${Math.floor(sim.player.y)}]`, mapX + 70, mapY + mapSize + 11);

            // 20x20 Dungeon layout cells
            for (let gy = 0; gy < GRID_SIZE; gy++) {
              for (let gx = 0; gx < GRID_SIZE; gx++) {
                const cx = mapX + gx * cellW;
                const cy = mapY + gy * cellW;
                ctx.fillStyle = sim.grid[gy][gx] === 1 ? currentLvl.wallFace[0] : currentLvl.floorColor;
                ctx.fillRect(cx, cy, cellW, cellW);
              }
            }

            // Faint grid border
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(mapX, mapY, mapSize, mapSize);

            // Exit portal dot
            const exX = mapX + sim.exitPos.x * cellW;
            const exY = mapY + sim.exitPos.y * cellW;
            ctx.fillStyle = currentLvl.portalColor;
            ctx.beginPath();
            ctx.arc(exX, exY, 2.8, 0, Math.PI * 2);
            ctx.fill();

            // Key dots
            for (const key of sim.keys) {
              const kX = mapX + key.x * cellW;
              const kY = mapY + key.y * cellW;
              ctx.fillStyle = currentLvl.keyColor;
              ctx.beginPath();
              ctx.arc(kX, kY, 2.2, 0, Math.PI * 2);
              ctx.fill();
            }

            // Enemy chasing beast pulsing red dot
            const enX = mapX + sim.enemy.x * cellW;
            const enY = mapY + sim.enemy.y * cellW;
            const pingR = 3.5 + (Math.sin(sim.player.time * 6) + 1) * 2.2;
            ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(enX, enY, pingR, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(enX, enY, 3.2, 0, Math.PI * 2);
            ctx.fill();

            // Player cyan dot with white center and directional pointer
            const plX = mapX + sim.player.x * cellW;
            const plY = mapY + sim.player.y * cellW;
            ctx.fillStyle = "#06b6d4";
            ctx.beginPath();
            ctx.arc(plX, plY, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(plX, plY, 1.3, 0, Math.PI * 2);
            ctx.fill();

            // Directional pointer needle
            const pDirX = plX + Math.cos(sim.player.angle) * 7;
            const pDirY = plY + Math.sin(sim.player.angle) * 7;
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(plX, plY);
            ctx.lineTo(pDirX, pDirY);
            ctx.stroke();

            ctx.restore();
          }

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [aStarSearch, highScore]);

  // Handle 1-Click ZIP Download of all 6 Python & Buildozer files
  const downloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      zip.file("main.py", PROJECT_FILES[0].content);
      zip.file("entities.py", PROJECT_FILES[1].content);
      zip.file("maze_generator.py", PROJECT_FILES[2].content);
      zip.file("buildozer.spec", PROJECT_FILES[3].content);
      zip.file(".github/workflows/build-apk.yml", PROJECT_FILES[4].content);
      zip.file("requirements.txt", PROJECT_FILES[5].content);

      zip.file(
        "README.md",
        `# Top-Down Dungeon Chase (Android APK Engine)

A production-ready, crash-proof Top-Down 2D/2.5D Dungeon Chase game built in Python and Pygame, optimized for Android deployment via Buildozer.

## Game Highlights
- **Top-Down Perspective (منظر من الاعلى)**: Full panoramic awareness with dynamic camera follow and tactical overview modes.
- **Analog Multi-Touch Virtual Joystick**: Circular border with centered touch-sensitive knob.
- **30-Frame Throttled A* AI**: Enemy hunts player relentlessly through corridor loops.
- **Zero-Font Architecture**: 100% vector drawn HUD with \`pygame.draw\` to prevent Android system font crashes.
- **Physical Android Back Button**: Traps \`pygame.K_AC_BACK\` cleanly without crash.

## Building the APK
### Option A: GitHub Actions (Recommended)
1. Push this repository to GitHub.
2. The included \`.github/workflows/build-apk.yml\` builds and uploads your APK artifact.

### Option B: Local Linux / WSL2
\`\`\`bash
pip install buildozer cython==0.29.36
buildozer android debug
\`\`\`
`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "topdown-dungeon-chase-android.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP creation failed:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const copyFileContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0a0f] text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Header / Navigation Strip */}
      <header className="h-13 border-b border-white/10 bg-[#0d0f17] px-3 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/50 shrink-0">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white flex items-center gap-1.5">
              {t.appTitle}
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {t.perspectiveBadge}
              </span>
            </h1>
          </div>
        </div>

        {/* View Mode Switcher & Quick Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex p-0.5 bg-black/40 border border-white/10 rounded-lg">
            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "simulator"
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Play className="w-3 h-3" />
              <span>{t.tabPlay}</span>
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "code"
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>{t.tabCode} ({PROJECT_FILES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                activeTab === "guide"
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>{t.tabGuide}</span>
            </button>
          </div>

          {/* Language Switcher Pill */}
          <button
            onClick={() => changeLanguage(language === "ar" ? "en" : "ar")}
            title="تبديل اللغة / Switch Language"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-medium transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-sans text-[11px] font-bold">{language === "ar" ? "EN" : "عربي"}</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title={t.settings}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-300 hover:text-cyan-400" />
          </button>

          {/* Sound & ZIP Actions */}
          <button
            onClick={() => {
              const muted = soundEngine.toggleMute();
              setIsMuted(muted);
            }}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={downloadZip}
            disabled={isZipping}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium border border-emerald-500/40 shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">{isZipping ? t.zipping : t.zipBtn}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 relative overflow-hidden bg-[#0a0a0f]">
        {/* --- VIEW 1: TOP-DOWN GAMEPLAY SIMULATION --- */}
        <div
          className={`absolute inset-0 flex flex-col ${
            activeTab === "simulator" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
          } transition-opacity duration-200`}
        >
          {/* Top-Down Canvas Viewport */}
          <div className="relative flex-1 w-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              width={960}
              height={580}
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* In-Game Low-Occlusion HUD Overlay */}
            {gameState === "PLAYING" && (
              <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                {/* Top Status Cluster */}
                <div className="flex items-start justify-between">
                  {/* Health & Stamina Bars */}
                  <div className="space-y-1.5 bg-black/75 backdrop-blur-md p-2.5 rounded-xl border border-white/15 shadow-lg">
                    {/* Health Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-bold text-xs flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> {t.hp}
                      </span>
                      <div className="w-28 sm:w-36 h-2.5 bg-slate-900 rounded-sm overflow-hidden border border-white/20">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-75"
                          style={{ width: `${Math.max(0, health)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-300 w-7 tabular-nums">
                        {health}
                      </span>
                    </div>

                    {/* Stamina Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> {t.sp}
                      </span>
                      <div className="w-28 sm:w-36 h-2 bg-slate-900 rounded-sm overflow-hidden border border-white/20">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-75"
                          style={{ width: `${Math.max(0, stamina)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-300 w-7 tabular-nums">
                        {stamina}
                      </span>
                    </div>

                    {/* Keys & Score */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                      <div className="flex items-center gap-1 text-yellow-400 font-bold">
                        <Key className="w-3 h-3" />
                        <span>{t.keys}: {keysCollected}/{totalKeys}</span>
                      </div>
                      <div className="text-slate-300 font-mono tabular-nums">
                        {t.score}: {gameScore}
                      </div>
                    </div>
                  </div>

                  {/* Center Threat Distance Alert, Level Badge & Active Difficulty Badge */}
                  <div className="flex flex-col items-center gap-1 pointer-events-auto">
                    <div
                      className={`px-3 py-1 rounded-full border flex items-center gap-1.5 transition-all ${
                        enemyDist < 4
                          ? "bg-red-600/90 border-red-400 text-white animate-pulse"
                          : enemyDist < 8
                          ? "bg-amber-600/70 border-amber-400 text-amber-200"
                          : "bg-black/60 border-white/10 text-slate-400"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-mono font-bold tracking-wider">
                        {t.beastDist}: {enemyDist}M
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Active Level Badge */}
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 shadow">
                        <Layers className="w-3 h-3 text-cyan-400" />
                        <span>
                          {t.level} {currentLevel}: {language === "ar" ? getLevelConfig(currentLevel).nameAr : getLevelConfig(currentLevel).nameEn}
                        </span>
                      </div>

                      {/* Active Difficulty Indicator Badge with Click-to-Settings */}
                      <button
                        onClick={() => setIsSettingsOpen(true)}
                        title={t.settings}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold transition shadow cursor-pointer ${DIFFICULTY_SETTINGS[difficulty].badgeBg} ${DIFFICULTY_SETTINGS[difficulty].badgeText} ${DIFFICULTY_SETTINGS[difficulty].badgeBorder}`}
                      >
                        <Gauge className="w-3 h-3" />
                        <span>{language === "ar" ? DIFFICULTY_SETTINGS[difficulty].labelAr : DIFFICULTY_SETTINGS[difficulty].labelEn}</span>
                      </button>
                    </div>
                  </div>

                  {/* Top-Right: Camera Mode Toggle Button */}
                  <div className="flex flex-col items-end pointer-events-auto">
                    <button
                      onClick={() =>
                        setCameraMode((prev) => (prev === "FOLLOW" ? "FULL_MAP" : "FOLLOW"))
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-cyan-400 border border-cyan-500/40 shadow-lg text-xs font-mono transition cursor-pointer"
                    >
                      {cameraMode === "FOLLOW" ? (
                        <>
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>{t.fullMapView}</span>
                        </>
                      ) : (
                        <>
                          <Crosshair className="w-3.5 h-3.5" />
                          <span>{t.followView}</span>
                        </>
                      )}
                    </button>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">{t.mapToggleHint}</span>
                  </div>
                </div>

                {/* Bottom hint */}
                <div className="text-center text-[10px] text-white/50 font-mono tracking-wider pointer-events-none">
                  {t.controlsHint}
                </div>
              </div>
            )}

            {/* Title / Start Screen Modal */}
            {gameState === "MENU" && (
              <div
                dir={language === "ar" ? "rtl" : "ltr"}
                className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 sm:p-6 text-center z-30 overflow-y-auto"
              >
                <div className="max-w-lg w-full space-y-4 my-auto">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
                      <span>{t.menuSubtitle}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
                      {t.menuTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {t.menuDesc}
                    </p>
                  </div>

                  {/* Features grid */}
                  <div className="grid grid-cols-3 gap-2 text-left rtl:text-right text-xs bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <div className="space-y-0.5">
                      <div className="text-cyan-400 font-bold flex items-center gap-1 text-[11px] sm:text-xs">
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{t.featTopDownTitle}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2">{t.featTopDownDesc}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-amber-400 font-bold flex items-center gap-1 text-[11px] sm:text-xs">
                        <Zap className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{t.featAiTitle}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2">{t.featAiDesc}</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] sm:text-xs">
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{t.featZeroFontTitle}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2">{t.featZeroFontDesc}</div>
                    </div>
                  </div>

                  {/* Difficulty Selection Segment */}
                  <div className="bg-[#121522] border border-white/10 p-3 rounded-xl space-y-2 text-left rtl:text-right">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                        {t.difficultyLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {t.beastSpeed}: {DIFFICULTY_SETTINGS[difficulty].speed}x • A*: {DIFFICULTY_SETTINGS[difficulty].recalcInterval}f
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {(["EASY", "NORMAL", "HARD"] as Difficulty[]).map((dKey) => {
                        const cfg = DIFFICULTY_SETTINGS[dKey];
                        const isSelected = difficulty === dKey;
                        return (
                          <button
                            key={dKey}
                            onClick={() => changeDifficulty(dKey)}
                            className={`py-2 px-2 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              isSelected
                                ? `${cfg.badgeBg} ${cfg.badgeText} border-cyan-400 ring-2 ring-cyan-500/30 shadow-md`
                                : "bg-black/40 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                            }`}
                          >
                            <span>{language === "ar" ? cfg.labelAr : cfg.labelEn}</span>
                            <span className="text-[9px] font-mono opacity-75 font-normal">
                              {cfg.speed}x • {cfg.recalcInterval}f
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Settings & Language Row */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => changeLanguage(language === "ar" ? "en" : "ar")}
                      className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{language === "ar" ? "English (الانتقال للإنجليزية)" : "العربية (Switch to Arabic)"}</span>
                    </button>

                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.settings}</span>
                    </button>
                  </div>

                  {/* Multi-Level Dungeon Progression Selector */}
                  <div className="bg-[#101422] border border-cyan-500/25 p-3 rounded-xl space-y-2 text-left rtl:text-right">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-bold flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t.levelSelect}</span>
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300">
                        {t.level} {currentLevel} • {language === "ar" ? getLevelConfig(currentLevel).nameAr : getLevelConfig(currentLevel).nameEn}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {LEVELS.map((lvl) => {
                        const isSelected = currentLevel === lvl.number;
                        return (
                          <button
                            key={lvl.number}
                            onClick={() => setCurrentLevel(lvl.number)}
                            className={`p-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? "bg-cyan-600/30 border-cyan-400 text-white ring-2 ring-cyan-500/50 shadow"
                                : "bg-black/40 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                            }`}
                          >
                            <span className="text-[10px] font-mono font-bold">L{lvl.number}</span>
                            <span className="text-[8px] truncate max-w-full font-sans">
                              {language === "ar" ? lvl.nameAr : lvl.nameEn}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <div className="space-y-2">
                    <button
                      onClick={() => startNewGame(currentLevel)}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-cyan-950/60 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>{t.startBtn} ({t.level} {currentLevel})</span>
                    </button>

                    <div className="text-xs text-slate-400 font-mono">
                      {t.highScore}: <span className="text-yellow-400 font-bold">{highScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pause Modal */}
            {gameState === "PAUSED" && (
              <div
                dir={language === "ar" ? "rtl" : "ltr"}
                className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-30"
              >
                <div className="bg-[#12141f] border border-white/15 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl">
                  <h3 className="text-2xl font-bold text-yellow-400 uppercase tracking-wider">
                    {t.pauseTitle}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {t.pauseDesc}
                  </p>
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        simRef.current.state = "PLAYING";
                        setGameState("PLAYING");
                      }}
                      className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase transition cursor-pointer"
                    >
                      {t.resumeBtn}
                    </button>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-full py-2.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800/70 border border-cyan-500/40 text-cyan-200 text-xs font-bold uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{t.openSettings}</span>
                    </button>
                    <button
                      onClick={() => {
                        simRef.current.state = "MENU";
                        setGameState("MENU");
                      }}
                      className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold uppercase transition cursor-pointer"
                    >
                      {t.quitBtn}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Modal */}
            {gameState === "GAMEOVER" && (
              <div
                dir={language === "ar" ? "rtl" : "ltr"}
                className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center p-6 z-30"
              >
                <div className="bg-[#180a0a] border border-red-500/40 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl">
                  <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-500">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-red-500 uppercase tracking-tight">
                      {t.caughtTitle}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {t.caughtDesc}
                    </p>
                  </div>

                  <div className="bg-black/40 p-3 rounded-lg border border-red-500/20 text-xs font-mono space-y-1 text-slate-300">
                    <div>{t.finalScore}: <span className="text-white font-bold">{gameScore}</span></div>
                    <div>{t.survived}: <span className="text-white font-bold">{surviveTime}s</span></div>
                    <div>{t.keysFound}: <span className="text-yellow-400 font-bold">{keysCollected}/{totalKeys}</span></div>
                  </div>

                  <button
                    onClick={() => startNewGame(currentLevel)}
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-950/60 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.retryBtn}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Victory Modal with Next Level Progression */}
            {gameState === "VICTORY" && (
              <div
                dir={language === "ar" ? "rtl" : "ltr"}
                className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-6 z-30"
              >
                <div className="bg-[#0a1810] border border-emerald-500/40 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl">
                  <div className="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-tight">
                      {t.escapedTitle}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {language === "ar"
                        ? `لقد نجوت من المستوى ${currentLevel} (${getLevelConfig(currentLevel).nameAr})!`
                        : `You conquered Level ${currentLevel} (${getLevelConfig(currentLevel).nameEn})!`}
                    </p>
                  </div>

                  <div className="bg-black/40 p-3 rounded-lg border border-emerald-500/20 text-xs font-mono space-y-1 text-slate-300">
                    <div>{t.finalScore}: <span className="text-emerald-300 font-bold">{gameScore}</span></div>
                    <div>{t.escapeTime}: <span className="text-white font-bold">{surviveTime}s</span></div>
                    <div>{t.runesRetrieved}: <span className="text-yellow-400 font-bold">{keysCollected}/{totalKeys}</span></div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => startNewGame(currentLevel + 1)}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950/80 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {t.nextLevel} ({t.level} {currentLevel + 1})
                      </span>
                    </button>
                    <button
                      onClick={() => startNewGame(currentLevel)}
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.replayLevelBtn}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- BOTTOM CONTROLS DECK: Compact, Shrunk Phone Controls (Zero Overlap) --- */}
          {gameState === "PLAYING" && (
            <div className="h-24 sm:h-28 border-t border-white/10 bg-[#0a0d14]/95 backdrop-blur-md px-4 sm:px-6 py-2 flex items-center justify-between z-20 shrink-0">
              {/* Left: Compact Virtual Analog Joystick */}
              <div className="flex items-center gap-2">
                <div
                  onPointerDown={handleJoystickPointerDown}
                  onPointerMove={handleJoystickPointerMove}
                  onPointerUp={handleJoystickPointerUp}
                  onPointerCancel={handleJoystickPointerUp}
                  className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 ${
                    stickPos.active
                      ? "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.55)] bg-slate-900/95"
                      : "border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-slate-950/85"
                  } backdrop-blur-md flex items-center justify-center select-none touch-none cursor-pointer transition-shadow`}
                >
                  {/* Concentric radar circle */}
                  <div className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-cyan-500/25 pointer-events-none" />

                  {/* Crosshair reticle lines */}
                  <div className="absolute w-full h-px bg-cyan-500/20 pointer-events-none" />
                  <div className="absolute h-full w-px bg-cyan-500/20 pointer-events-none" />

                  {/* Cardinal Direction Indicators */}
                  <span className="absolute top-0.5 text-[8px] font-mono font-bold text-cyan-400/80 pointer-events-none">▲</span>
                  <span className="absolute bottom-0.5 text-[8px] font-mono font-bold text-cyan-400/80 pointer-events-none">▼</span>
                  <span className="absolute left-1 text-[8px] font-mono font-bold text-cyan-400/80 pointer-events-none">◄</span>
                  <span className="absolute right-1 text-[8px] font-mono font-bold text-cyan-400/80 pointer-events-none">►</span>

                  {/* Centered Touch-Sensitive Knob */}
                  <div
                    style={{
                      transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
                      transition: stickPos.active ? "none" : "transform 0.15s ease-out",
                    }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 ${
                      stickPos.active
                        ? "border-white bg-gradient-to-br from-cyan-400 via-cyan-600 to-blue-700 shadow-[0_0_15px_rgba(6,182,212,0.9)]"
                        : "border-cyan-400/70 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-md shadow-black"
                    } flex items-center justify-center pointer-events-none`}
                  >
                    <div className="w-3 h-3 rounded-full border border-white/50 flex items-center justify-center">
                      <div className={`w-1 h-1 rounded-full ${stickPos.active ? "bg-white" : "bg-cyan-400"}`} />
                    </div>
                  </div>
                </div>
                <div className="hidden xs:flex flex-col text-[9px] font-mono text-cyan-400 font-semibold leading-tight">
                  <span>360°</span>
                  <span className="text-slate-400 text-[8px]">{t.analogStick}</span>
                </div>
              </div>

              {/* Center: Desktop Controls Hint & Quick Pause */}
              <div className="hidden md:flex flex-col items-center gap-1 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">W,A,S,D</span>
                  <span>Move</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">Shift</span>
                  <span>Sprint</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">[M]</span>
                  <span>Map</span>
                </div>
                <button
                  onClick={() => {
                    simRef.current.state = "PAUSED";
                    setGameState("PAUSED");
                  }}
                  className="text-[10px] text-yellow-400 hover:text-yellow-300 font-mono cursor-pointer"
                >
                  {t.pauseKeyHint}
                </button>
              </div>

              {/* Right: Shrunk Responsive Sprint Action Button */}
              <div className="flex items-center gap-2">
                <div className="hidden xs:flex flex-col text-right text-[9px] font-mono text-amber-400 font-semibold leading-tight">
                  <span className="text-[8px] text-slate-400 font-sans">{t.holdRun}</span>
                </div>
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    simRef.current.isSprintingTouch = true;
                    setIsSprintingUI(true);
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    simRef.current.isSprintingTouch = false;
                    setIsSprintingUI(false);
                  }}
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none touch-none ${
                    isSprintingUI
                      ? "bg-amber-500 border-yellow-200 text-black shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-95"
                      : "bg-slate-900/90 border-amber-500/50 text-amber-400 shadow-md hover:border-amber-400"
                  }`}
                >
                  <Zap className="w-5 h-5 mb-0.5" />
                  <span className="text-[8px] font-mono font-bold tracking-wider">{t.runBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- VIEW 2: PYTHON SOURCE CODE VIEWER --- */}
        <div
          className={`absolute inset-0 flex flex-col md:flex-row bg-[#0d0f17] ${
            activeTab === "code" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
          } transition-opacity duration-200`}
        >
          {/* File sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#0a0c12] p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 hidden md:block">
              Android Project Files
            </div>
            {PROJECT_FILES.map((file) => (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition cursor-pointer shrink-0 md:shrink ${
                  selectedFile.name === file.name
                    ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <FileCode className="w-4 h-4 shrink-0" />
                <div className="truncate">
                  <div className="font-mono font-medium truncate">{file.name}</div>
                  <div className="text-[10px] text-slate-500 truncate hidden md:block">
                    {file.language}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Code Viewer Main Pane */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0d0f17]">
            {/* File info bar */}
            <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between bg-[#10121d]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs font-bold text-white truncate">
                  {selectedFile.path}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  {selectedFile.content.split("\n").length} lines
                </span>
              </div>
              <button
                onClick={() => copyFileContent(selectedFile.content)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            {/* Description strip */}
            <div className="px-4 py-2 bg-black/30 border-b border-white/5 text-xs text-slate-400 font-mono">
              {selectedFile.description}
            </div>

            {/* Code Pre/Code Block */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 bg-[#0a0c12]">
              <pre className="leading-relaxed">
                <code>
                  {selectedFile.content.split("\n").map((line, idx) => (
                    <div key={idx} className="table-row">
                      <span className="table-cell pr-4 text-slate-600 select-none text-right w-10">
                        {idx + 1}
                      </span>
                      <span className="table-cell">{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* --- VIEW 3: BUILDOZER & ANDROID DEPLOYMENT GUIDE --- */}
        <div
          className={`absolute inset-0 overflow-y-auto bg-[#0d0f17] p-6 ${
            activeTab === "guide" ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
          } transition-opacity duration-200`}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">
                Android Deployment & Mobile Stability Guide
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Complete walkthrough for converting this Pygame Top-Down Dungeon engine into an installable Android APK using Buildozer.
              </p>
            </div>

            {/* Critical Architecture Rule: Why SysFont is Forbidden */}
            <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-xl space-y-2">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Zero-Font Architecture: Preventing Android "Crash on Launch"
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                On desktop computers, Pygame can query OS system fonts using <code className="text-red-300 bg-black/40 px-1 py-0.5 rounded">pygame.font.SysFont(None, 24)</code>. However, standard Android APK packages built with python-for-android do <strong>not</strong> bundle default font binaries. Executing SysFont causes an immediate fatal segmentation fault/crash before the first frame renders.
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                To guarantee 100% stability on every Android smartphone and tablet, this project implements a <strong>pure vector geometry HUD engine</strong> in <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">entities.py</code> using <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded">pygame.draw</code> primitives (7-segment vector line digits, polygon glyphs, and beveled status gauges). Zero font binaries are required!
              </p>
            </div>

            {/* Build methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Method 1: GitHub Actions CI/CD */}
              <div className="bg-[#121522] border border-white/10 p-5 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Github className="w-4 h-4 text-emerald-400" />
                  <span>Method 1: GitHub Actions CI/CD (Fastest)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Build the APK on GitHub's cloud runners without configuring Java, Android SDK, or NDK locally.
                </p>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside font-mono bg-black/30 p-3 rounded-lg border border-white/5">
                  <li>Download the project via <strong>Export ZIP</strong> button above.</li>
                  <li>Extract and push to your GitHub repository.</li>
                  <li>The included <code className="text-emerald-400">.github/workflows/build-apk.yml</code> triggers automatically on push.</li>
                  <li>Download the compiled debug <code className="text-yellow-400">.apk</code> artifact from the "Actions" tab.</li>
                </ol>
              </div>

              {/* Method 2: Local Linux / WSL2 */}
              <div className="bg-[#121522] border border-white/10 p-5 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Method 2: Local Build via WSL2 / Ubuntu</span>
                </div>
                <p className="text-xs text-slate-400">
                  For local developers using Ubuntu 22.04 or Windows Subsystem for Linux (WSL2):
                </p>
                <div className="text-xs font-mono bg-black/50 p-3 rounded-lg border border-white/5 text-cyan-300 space-y-1 overflow-x-auto">
                  <div>sudo apt update && sudo apt install -y git openjdk-17-jdk python3-pip</div>
                  <div>pip install --upgrade buildozer cython==0.29.36</div>
                  <div>buildozer android debug</div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Buildozer automatically handles downloading Android SDK 33 and NDK 25b into <code className="text-slate-300">~/.buildozer/</code>.
                </p>
              </div>
            </div>

            {/* Android Back Button Interception */}
            <div className="bg-[#121522] border border-white/10 p-5 rounded-xl space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                Physical Android Back Button Handling (K_AC_BACK)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Android devices have a physical or gesture-based back button. By default, unhandled back button events terminate the Python interpreter abruptly. In <code className="text-cyan-400">main.py</code>, the event loop listens for <code className="text-yellow-400">pygame.K_AC_BACK</code> (keycode 1073742094):
              </p>
              <div className="bg-black/40 p-3 rounded font-mono text-xs text-slate-300 border border-white/5">
                <div>if event.key == pygame.K_ESCAPE or event.key == K_AC_BACK:</div>
                <div className="pl-4 text-slate-400">if self.state == STATE_PLAYING: self.state = STATE_PAUSED</div>
                <div className="pl-4 text-slate-400">elif self.state in (STATE_PAUSED, STATE_GAMEOVER, STATE_VICTORY): self.state = STATE_MENU</div>
                <div className="pl-4 text-slate-400">elif self.state == STATE_MENU: return False  # Clean exit</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Game Settings & Difficulty Tuning Modal */}
      {isSettingsOpen && (
        <div
          dir={language === "ar" ? "rtl" : "ltr"}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#121422] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl shadow-cyan-950/70 space-y-5 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    {t.settingsTitle}
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {language === "ar" ? "خيارات التحدي واللغة" : "Challenge & Language Options"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Difficulty Level Section */}
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  {t.settingsDifficultyHeading}
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t.settingsDifficultyDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(["EASY", "NORMAL", "HARD"] as Difficulty[]).map((dKey) => {
                  const cfg = DIFFICULTY_SETTINGS[dKey];
                  const isSelected = difficulty === dKey;
                  return (
                    <div
                      key={dKey}
                      onClick={() => changeDifficulty(dKey)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? `${cfg.badgeBg} ${cfg.badgeBorder} ring-2 ring-cyan-400/50 shadow-lg`
                          : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm font-bold ${cfg.badgeText}`}>
                          {language === "ar" ? cfg.labelAr : cfg.labelEn}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <p className="text-[10px] text-slate-300 leading-tight mb-2">
                        {language === "ar" ? cfg.descAr : cfg.descEn}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 border-t border-white/5 pt-1.5">
                        <span>{cfg.speed}x {t.beastSpeed}</span>
                        <span>•</span>
                        <span>{cfg.recalcInterval}f A*</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Level Selection Section */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  {t.levelSelect}
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === "ar"
                    ? "اختر البيئة والغرفة التي تريد استكشافها ومواجهة وحشها"
                    : "Select which dungeon floor environment and unique beast to encounter"}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LEVELS.map((lvl) => {
                  const isSelected = currentLevel === lvl.number;
                  return (
                    <button
                      key={lvl.number}
                      onClick={() => {
                        setCurrentLevel(lvl.number);
                        if (gameState === "PLAYING") {
                          startNewGame(lvl.number);
                        }
                      }}
                      className={`p-2 rounded-xl border text-left rtl:text-right transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-cyan-900/40 border-cyan-400 ring-2 ring-cyan-500/30 text-white shadow-md"
                          : "bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span>{t.level} {lvl.number}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-200 truncate mt-1">
                        {language === "ar" ? lvl.nameAr : lvl.nameEn}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate mt-0.5 font-mono">
                        {language === "ar" ? lvl.beast.nameAr : lvl.beast.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Selection Section */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  {t.settingsLanguageHeading}
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t.settingsLanguageDesc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => changeLanguage("ar")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    language === "ar"
                      ? "bg-cyan-600/20 text-cyan-300 border-cyan-400 ring-2 ring-cyan-500/30"
                      : "bg-black/40 text-slate-400 border-white/10 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>العربية (Arabic)</span>
                  {language === "ar" && <Check className="w-4 h-4 text-cyan-400" />}
                </button>

                <button
                  onClick={() => changeLanguage("en")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    language === "en"
                      ? "bg-cyan-600/20 text-cyan-300 border-cyan-400 ring-2 ring-cyan-500/30"
                      : "bg-black/40 text-slate-400 border-white/10 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>English (الإنجليزية)</span>
                  {language === "en" && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Apply & Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/60 transition cursor-pointer"
              >
                {t.applyClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
