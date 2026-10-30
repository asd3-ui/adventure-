/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BeastTheme {
  nameEn: string;
  nameAr: string;
  bodyColor: string;
  borderColor: string;
  coreColor: string;
  eyeColor: string;
  smokeColors: string[];
}

export interface LevelConfig {
  number: number;
  id: string;
  nameEn: string;
  nameAr: string;
  subtitleEn: string;
  subtitleAr: string;
  descEn: string;
  descAr: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  floorColor: string;
  floorLineColor: string;
  floorType: "stone" | "magma" | "moss" | "frost" | "void" | "sunken" | "inferno" | "crystal";
  wallTop: [string, string];
  wallFace: [string, string];
  wallBorder: string;
  wallSpecular: string;
  portalColor: string;
  portalGlow: string;
  keyColor: string;
  keyCount: number;
  ambientType: "dust" | "embers" | "spores" | "frost" | "stars" | "bubbles" | "flames";
  ambientColors: string[];
  beast: BeastTheme;
  maze: {
    corridorLoopChance: number;
    chamberLayout: "center" | "split" | "quads" | "cross" | "open";
  };
  bgmMood: "ancient" | "magma" | "toxic" | "frozen" | "void" | "sunken" | "inferno" | "crystal";
}

export const LEVELS: LevelConfig[] = [
  {
    number: 1,
    id: "catacombs",
    nameEn: "Ancient Catacombs",
    nameAr: "السراديب القديمة",
    subtitleEn: "Dusty Tombs & Stone Corridors",
    subtitleAr: "أضرحة وممرات صخرية عتيقة",
    descEn: "Chilly subterranean hallways filled with ancient moss and forgotten runes.",
    descAr: "ممرات باردة تحت الأرض مليئة بالطلاسم القديمة وحطام الحجارة العتيقة.",
    badgeBg: "bg-slate-900/80",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/30",
    floorColor: "#131622",
    floorLineColor: "#1a1e2d",
    floorType: "stone",
    wallTop: ["#3a455c", "#242c3c"],
    wallFace: ["#1f2636", "#141924"],
    wallBorder: "#4a5775",
    wallSpecular: "#6d7f9f",
    portalColor: "#10b981",
    portalGlow: "rgba(16, 185, 129, 0.4)",
    keyColor: "#f59e0b",
    keyCount: 3,
    ambientType: "dust",
    ambientColors: ["rgba(148, 163, 184, 0.45)", "rgba(100, 116, 139, 0.35)", "rgba(56, 189, 248, 0.25)"],
    beast: {
      nameEn: "Shadow Stalker",
      nameAr: "مطارد الظلال",
      bodyColor: "#991b1b",
      borderColor: "#f87171",
      coreColor: "#ef4444",
      eyeColor: "#ffffff",
      smokeColors: ["rgba(239, 68, 68, 0.6)", "rgba(153, 27, 27, 0.5)", "rgba(30, 10, 10, 0.7)"],
    },
    maze: {
      corridorLoopChance: 0.18,
      chamberLayout: "center",
    },
    bgmMood: "ancient",
  },
  {
    number: 2,
    id: "magma",
    nameEn: "Molten Core",
    nameAr: "قلب الحمم البركانية",
    subtitleEn: "Volcanic Fissures & Obsidian Walls",
    subtitleAr: "شقوق بركانية وجدران زجاجية نارية",
    descEn: "Intense volcanic heat radiates from cracked basalt floors as glowing embers drift through the air.",
    descAr: "حرارة بركانية هائلة تنبعث من شقوق الأرضية المحترقة مع تطاير الشرر الناري.",
    badgeBg: "bg-orange-950/80",
    badgeText: "text-orange-400",
    badgeBorder: "border-orange-500/40",
    floorColor: "#22120e",
    floorLineColor: "#3a1b14",
    floorType: "magma",
    wallTop: ["#4a2119", "#2d130e"],
    wallFace: ["#2d110b", "#180906"],
    wallBorder: "#78350f",
    wallSpecular: "#fb923c",
    portalColor: "#f59e0b",
    portalGlow: "rgba(245, 158, 11, 0.45)",
    keyColor: "#fbbf24",
    keyCount: 3,
    ambientType: "embers",
    ambientColors: ["rgba(251, 146, 60, 0.7)", "rgba(239, 68, 68, 0.6)", "rgba(245, 158, 11, 0.8)"],
    beast: {
      nameEn: "Magma Golem",
      nameAr: "عملاق الحمم",
      bodyColor: "#7c2d12",
      borderColor: "#fb923c",
      coreColor: "#f97316",
      eyeColor: "#fef08a",
      smokeColors: ["rgba(249, 115, 22, 0.8)", "rgba(220, 38, 38, 0.7)", "rgba(40, 15, 5, 0.85)"],
    },
    maze: {
      corridorLoopChance: 0.24,
      chamberLayout: "split",
    },
    bgmMood: "magma",
  },
  {
    number: 3,
    id: "toxic",
    nameEn: "Toxic Sewers",
    nameAr: "مجاري السموم المشعة",
    subtitleEn: "Acidic Pools & Glowing Spores",
    subtitleAr: "برك أحماض وأبواغ خضراء مشعة",
    descEn: "Bioluminescent green mold covers decaying pipes; luminous toxic spores float gently in the gloom.",
    descAr: "عفن فسفوري متوهج يغطي الممرات مع أبواغ سامة مشعة تطفو في الهواء.",
    badgeBg: "bg-emerald-950/80",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-500/40",
    floorColor: "#0d1f14",
    floorLineColor: "#143120",
    floorType: "moss",
    wallTop: ["#1c3826", "#102317"],
    wallFace: ["#122418", "#08120c"],
    wallBorder: "#15803d",
    wallSpecular: "#4ade80",
    portalColor: "#10b981",
    portalGlow: "rgba(16, 185, 129, 0.5)",
    keyColor: "#a3e635",
    keyCount: 3,
    ambientType: "spores",
    ambientColors: ["rgba(74, 222, 128, 0.65)", "rgba(163, 230, 53, 0.55)", "rgba(22, 101, 52, 0.4)"],
    beast: {
      nameEn: "Acid Wyrm",
      nameAr: "تنين الحمض السام",
      bodyColor: "#14532d",
      borderColor: "#4ade80",
      coreColor: "#22c55e",
      eyeColor: "#d9f99d",
      smokeColors: ["rgba(74, 222, 128, 0.7)", "rgba(34, 197, 94, 0.6)", "rgba(5, 46, 22, 0.8)"],
    },
    maze: {
      corridorLoopChance: 0.2,
      chamberLayout: "quads",
    },
    bgmMood: "toxic",
  },
  {
    number: 4,
    id: "frost",
    nameEn: "Frozen Vault",
    nameAr: "خزينة الجليد السرمدي",
    subtitleEn: "Glacial Ice & Shimmering Frost",
    subtitleAr: "جليد سرمدي وبلورات صقيع مشعة",
    descEn: "Sub-zero temperatures freeze the stones; shimmering ice crystals and delicate frost snowflakes float in the chill.",
    descAr: "برد قارس يجمد الصخور، مع بلورات ثلجية براقة ورقاقات جليد تتلألأ في الظلام.",
    badgeBg: "bg-sky-950/80",
    badgeText: "text-sky-300",
    badgeBorder: "border-sky-500/40",
    floorColor: "#0b1b2b",
    floorLineColor: "#122c45",
    floorType: "frost",
    wallTop: ["#1e3a5f", "#13253e"],
    wallFace: ["#12243d", "#0a1422"],
    wallBorder: "#0284c7",
    wallSpecular: "#7dd3fc",
    portalColor: "#38bdf8",
    portalGlow: "rgba(56, 189, 248, 0.45)",
    keyColor: "#67e8f9",
    keyCount: 4,
    ambientType: "frost",
    ambientColors: ["rgba(186, 230, 253, 0.8)", "rgba(56, 189, 248, 0.6)", "rgba(255, 255, 255, 0.85)"],
    beast: {
      nameEn: "Frost Wraith",
      nameAr: "طيف الجليد الأزرق",
      bodyColor: "#0369a1",
      borderColor: "#38bdf8",
      coreColor: "#0284c7",
      eyeColor: "#ffffff",
      smokeColors: ["rgba(125, 211, 252, 0.75)", "rgba(14, 165, 233, 0.6)", "rgba(12, 74, 110, 0.8)"],
    },
    maze: {
      corridorLoopChance: 0.22,
      chamberLayout: "cross",
    },
    bgmMood: "frozen",
  },
  {
    number: 5,
    id: "void",
    nameEn: "Void Abyss",
    nameAr: "هاوية الفراغ الكوني",
    subtitleEn: "Cosmic Purple & Stardust Sparks",
    subtitleAr: "ظلام كوني وأجرام نجوم متلألئة",
    descEn: "Reality unravels at the edge of the void; cosmic stardust motes and strange gravity distortions warp the halls.",
    descAr: "تتشوه الجاذبية على حافة الفراغ؛ غبار كوني بنفسجي ونيازك دقيقة تتراقص بين الجدران.",
    badgeBg: "bg-purple-950/80",
    badgeText: "text-purple-300",
    badgeBorder: "border-purple-500/40",
    floorColor: "#180c29",
    floorLineColor: "#281544",
    floorType: "void",
    wallTop: ["#3b1c5c", "#24103a"],
    wallFace: ["#231038", "#11071c"],
    wallBorder: "#7e22ce",
    wallSpecular: "#c084fc",
    portalColor: "#a855f7",
    portalGlow: "rgba(168, 85, 247, 0.45)",
    keyColor: "#e879f9",
    keyCount: 4,
    ambientType: "stars",
    ambientColors: ["rgba(216, 180, 254, 0.8)", "rgba(244, 114, 182, 0.6)", "rgba(168, 85, 247, 0.7)"],
    beast: {
      nameEn: "Void Devourer",
      nameAr: "مفترس الفراغ الأسود",
      bodyColor: "#581c87",
      borderColor: "#c084fc",
      coreColor: "#9333ea",
      eyeColor: "#fdf4ff",
      smokeColors: ["rgba(192, 132, 252, 0.8)", "rgba(147, 51, 234, 0.65)", "rgba(30, 8, 48, 0.9)"],
    },
    maze: {
      corridorLoopChance: 0.26,
      chamberLayout: "open",
    },
    bgmMood: "void",
  },
  {
    number: 6,
    id: "sunken",
    nameEn: "Sunken Citadel",
    nameAr: "القلعة الغارقة",
    subtitleEn: "Submerged Ruins & Bioluminescent Flora",
    subtitleAr: "أطلال مائية ونباتات مضيئة تحت السطح",
    descEn: "Ancient sunken corridors where sea water ripples against teal pillars and glowing bubbles rise gently.",
    descAr: "ممرات أثرية غمرتها المياه العميقة؛ تموجات مائية وفقاعات فسفورية تطفو نحو الأعلى.",
    badgeBg: "bg-teal-950/80",
    badgeText: "text-teal-300",
    badgeBorder: "border-teal-500/40",
    floorColor: "#091d24",
    floorLineColor: "#10313d",
    floorType: "sunken",
    wallTop: ["#164452", "#0c2831"],
    wallFace: ["#0f2e38", "#07171d"],
    wallBorder: "#0d9488",
    wallSpecular: "#2dd4bf",
    portalColor: "#14b8a6",
    portalGlow: "rgba(20, 184, 166, 0.45)",
    keyColor: "#38bdf8",
    keyCount: 4,
    ambientType: "bubbles",
    ambientColors: ["rgba(45, 212, 191, 0.65)", "rgba(56, 189, 248, 0.55)", "rgba(204, 251, 241, 0.7)"],
    beast: {
      nameEn: "Abyssal Leviathan",
      nameAr: "وحش الأعماق المائية",
      bodyColor: "#134e4a",
      borderColor: "#2dd4bf",
      coreColor: "#0f766e",
      eyeColor: "#99f6e4",
      smokeColors: ["rgba(45, 212, 191, 0.7)", "rgba(15, 118, 110, 0.6)", "rgba(4, 47, 46, 0.8)"],
    },
    maze: {
      corridorLoopChance: 0.28,
      chamberLayout: "center",
    },
    bgmMood: "sunken",
  },
  {
    number: 7,
    id: "inferno",
    nameEn: "Infernal Sanctuary",
    nameAr: "المحراب الجهنمي",
    subtitleEn: "Bloodstone & Roaring Firestorms",
    subtitleAr: "صخور دموية وعواصف نار متأججة",
    descEn: "The deepest level of the dungeon shrouded in bloodstone and furious crimson embers.",
    descAr: "أعمق مستويات المتاهة، محاطة بأحجار الدم وعواصف اللهب القرمزي الملتهب.",
    badgeBg: "bg-red-950/90",
    badgeText: "text-red-400",
    badgeBorder: "border-red-500/50",
    floorColor: "#260a0a",
    floorLineColor: "#3f1212",
    floorType: "inferno",
    wallTop: ["#521717", "#320c0c"],
    wallFace: ["#380d0d", "#1c0606"],
    wallBorder: "#b91c1c",
    wallSpecular: "#f87171",
    portalColor: "#dc2626",
    portalGlow: "rgba(220, 38, 38, 0.55)",
    keyColor: "#fca5a5",
    keyCount: 5,
    ambientType: "flames",
    ambientColors: ["rgba(239, 68, 68, 0.8)", "rgba(249, 115, 22, 0.7)", "rgba(254, 202, 202, 0.9)"],
    beast: {
      nameEn: "Hellfire Berserker",
      nameAr: "هائج نيران الجحيم",
      bodyColor: "#7f1d1d",
      borderColor: "#f87171",
      coreColor: "#dc2626",
      eyeColor: "#fee2e2",
      smokeColors: ["rgba(239, 68, 68, 0.9)", "rgba(220, 38, 38, 0.75)", "rgba(69, 10, 10, 0.9)"],
    },
    maze: {
      corridorLoopChance: 0.32,
      chamberLayout: "split",
    },
    bgmMood: "inferno",
  },
  {
    number: 8,
    id: "crystal",
    nameEn: "Prismatic Cavern",
    nameAr: "كهف البلورات المنشورية",
    subtitleEn: "Resonating Gems & Radiant Shards",
    subtitleAr: "أحجار كريمة رنانة وشظايا مضيئة",
    descEn: "Pristine crystalline labyrinths reflecting dazzling light beams and singing with ancient resonance.",
    descAr: "متاهة من البلورات المنشورية النقية تعكس أشعة الضوء وتتردد فيها أصداء نغمات سحرية.",
    badgeBg: "bg-fuchsia-950/80",
    badgeText: "text-fuchsia-300",
    badgeBorder: "border-fuchsia-500/40",
    floorColor: "#1d112c",
    floorLineColor: "#2e1c45",
    floorType: "crystal",
    wallTop: ["#48236c", "#2d1544"],
    wallFace: ["#2d1445", "#170a24"],
    wallBorder: "#c026d3",
    wallSpecular: "#f0abfc",
    portalColor: "#e879f9",
    portalGlow: "rgba(232, 121, 249, 0.5)",
    keyColor: "#f472b6",
    keyCount: 5,
    ambientType: "stars",
    ambientColors: ["rgba(240, 171, 252, 0.85)", "rgba(192, 132, 252, 0.75)", "rgba(255, 255, 255, 0.9)"],
    beast: {
      nameEn: "Crystal Colossus",
      nameAr: "عملاق الكريستال الساطع",
      bodyColor: "#701a75",
      borderColor: "#f0abfc",
      coreColor: "#c026d3",
      eyeColor: "#fdf4ff",
      smokeColors: ["rgba(240, 171, 252, 0.85)", "rgba(192, 38, 211, 0.7)", "rgba(74, 4, 78, 0.9)"],
    },
    maze: {
      corridorLoopChance: 0.35,
      chamberLayout: "cross",
    },
    bgmMood: "crystal",
  },
];

/**
 * Returns configuration for any level number (loops through themes with scaling difficulty beyond level 8).
 */
export function getLevelConfig(levelNum: number): LevelConfig {
  const baseIndex = (Math.max(1, levelNum) - 1) % LEVELS.length;
  const base = LEVELS[baseIndex];

  if (levelNum <= LEVELS.length) {
    return base;
  }

  // Infinite procedural level generator based on base templates
  const tier = Math.floor((levelNum - 1) / LEVELS.length) + 1;
  return {
    ...base,
    number: levelNum,
    nameEn: `${base.nameEn} (Tier ${tier})`,
    nameAr: `${base.nameAr} (الطور ${tier})`,
    keyCount: Math.min(6, base.keyCount + Math.floor((levelNum - 1) / 4)),
    maze: {
      ...base.maze,
      corridorLoopChance: Math.min(0.4, base.maze.corridorLoopChance + tier * 0.03),
    },
  };
}
