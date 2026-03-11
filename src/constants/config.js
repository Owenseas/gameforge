export const PL = {
  douyin: { n: "抖音", i: "music" },
  wechat: { n: "微信", i: "chat" },
  android: { n: "Android", i: "robot" },
  web: { n: "Web", i: "globe" },
};

export const ST = [
  {
    id: "dark",
    n: "暗调风格化",
    d: "dark moody game art, high contrast",
    p: "moon",
  },
  { id: "cute", n: "卡通Q版", d: "cute cartoon, bright colors", p: "bear" },
  { id: "pixel", n: "像素复古", d: "pixel art, 8-bit retro", p: "alien" },
  { id: "flat", n: "扁平现代", d: "flat vector, clean", p: "ruler" },
  { id: "cyber", n: "赛博朋克", d: "cyberpunk neon, high-tech", p: "city" },
];

export const AT = {
  background: { l: "背景", i: "image", c: "#5E5CE6" },
  prop: { l: "道具", i: "chair", c: "#30D158" },
  target: { l: "目标", i: "target", c: "#FF2D55" },
  weapon: { l: "武器", i: "weapon", c: "#FFD60A" },
  effect: { l: "特效", i: "sparkle", c: "#FF9500" },
  ui: { l: "UI", i: "phone", c: "#00E5FF" },
};

export const STEPS = [
  { id: "upload", l: "上传", i: "folder" },
  { id: "fileselect", l: "选文件", i: "file-check" },
  { id: "scan", l: "解析", i: "search" },
  { id: "manifest", l: "清单", i: "clipboard" },
  { id: "config", l: "配置", i: "settings" },
  { id: "generate", l: "生成", i: "palette" },
  { id: "review", l: "结果", i: "check-circle" },
];

export const DEMO_MANIFEST = {
  game_name: "Adventure Quest (Demo)",
  structure_summary:
    "3 chapters, 3 levels each. Chapter 1: Dark Forest (forest / cave / lakeside); Chapter 2: Ruined Castle (courtyard / dungeon / throne room); Chapter 3: Dragon Lair (volcanic cave / sky bridge / final arena). Bosses: Ancient Tree Spirit, Stone Cave Troll, Dragon King Malachar. Weapons: Iron Sword, Battle Axe, Elven Bow.",
  source_files: ["game.js", "levels/level_data.json", "data/asset_config.json"],
  assets: [
    {
      id: "bg_chapter1",
      name: "Chapter 1 Backgrounds",
      type: "background",
      width: 1920,
      height: 1080,
      transparent: false,
      items: [
        {
          id: "bg_chapter1_1",
          label: "1-1 Dark Forest",
          prompt:
            "lush dark fantasy forest, twisted ancient trees, bioluminescent mushrooms, moonlight rays, misty atmosphere",
        },
        {
          id: "bg_chapter1_2",
          label: "1-2 Haunted Cave",
          prompt:
            "underground cavern, glowing crystals, stalactites, dim blue light, mysterious fog, stone walls",
        },
        {
          id: "bg_chapter1_3",
          label: "1-3 Forest Lakeside",
          prompt:
            "serene forest lake, reflective dark water, willow trees, fireflies, twilight sky, eerie calm",
        },
      ],
    },
    {
      id: "bg_chapter2",
      name: "Chapter 2 Backgrounds",
      type: "background",
      width: 1920,
      height: 1080,
      transparent: false,
      items: [
        {
          id: "bg_chapter2_1",
          label: "2-1 Castle Courtyard",
          prompt:
            "ancient ruined castle courtyard, crumbling stone walls, overgrown ivy, stormy sky, dramatic lighting",
        },
        {
          id: "bg_chapter2_2",
          label: "2-2 Dungeon",
          prompt:
            "dark damp dungeon, iron bars, torch sconces, stone floor, chains, oppressive atmosphere",
        },
        {
          id: "bg_chapter2_3",
          label: "2-3 Throne Room",
          prompt:
            "grand castle throne room, vaulted ceiling, stained glass windows, cracked marble floor, ominous red light",
        },
      ],
    },
    {
      id: "boss",
      name: "Boss Characters",
      type: "prop",
      width: 400,
      height: 600,
      transparent: true,
      items: [
        {
          id: "boss_1",
          label: "Ancient Tree Spirit",
          prompt:
            "ancient tree spirit boss, twisted bark body, glowing green eyes, root tendrils, forest magic aura",
        },
        {
          id: "boss_2",
          label: "Stone Cave Troll",
          prompt:
            "massive stone cave troll, rocky armor skin, glowing crystal eyes, huge club weapon, underground creature",
        },
        {
          id: "boss_3",
          label: "Dragon King Malachar",
          prompt:
            "fearsome dragon king, red and black scales, enormous wings spread, flames from mouth, crown of horns",
        },
      ],
    },
    {
      id: "weapon",
      name: "Weapons",
      type: "weapon",
      width: 200,
      height: 200,
      transparent: true,
      items: [
        {
          id: "weapon_1",
          label: "Iron Sword",
          prompt:
            "iron sword game asset, classic fantasy design, metallic blade, crossguard, worn leather grip, top-down view",
        },
        {
          id: "weapon_2",
          label: "Battle Axe",
          prompt:
            "heavy battle axe, double-headed blade, rune engravings, dark metal, warrior weapon, game icon style",
        },
        {
          id: "weapon_3",
          label: "Elven Bow",
          prompt:
            "elegant elven longbow, curved wood, silver inlays, glowing string, nature magic, fantasy game asset",
        },
      ],
    },
    {
      id: "fx",
      name: "Effects",
      type: "effect",
      width: 300,
      height: 300,
      transparent: true,
      items: [
        {
          id: "fx_1",
          label: "Fire Explosion",
          prompt:
            "fire explosion VFX, orange red burst, smoke particles, impact flash, game effect sprite",
        },
        {
          id: "fx_2",
          label: "Magic Sparkle",
          prompt:
            "magic sparkle effect, blue purple energy burst, glowing particles, arcane power, transparent background",
        },
      ],
    },
    {
      id: "ui_button",
      name: "UI Buttons",
      type: "ui",
      width: 400,
      height: 120,
      transparent: true,
      items: [
        {
          id: "ui_button_1",
          label: "Start Game",
          prompt:
            "game start button, fantasy style, golden gradient, glowing border, decorative corners, clean center space",
        },
        {
          id: "ui_button_2",
          label: "Settings",
          prompt:
            "settings button, dark stone texture, gear icon space, fantasy UI style, muted gold trim",
        },
      ],
    },
  ],
};
