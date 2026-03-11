// Adventure Quest — Main Game Entry
const GAME_CONFIG = {
  name: "Adventure Quest",
  version: "1.0.0",
  resolution: { width: 1920, height: 1080 },
};

const LEVELS = [
  {
    id: 1,
    chapter: 1,
    name: "Dark Forest",
    scene: "forest_background",
    theme: "Lush forest overrun by evil spirits",
    music: "forest_theme.mp3",
    boss: { id: "tree_spirit", name: "Ancient Tree Spirit", hp: 2000 },
  },
  {
    id: 2,
    chapter: 1,
    name: "Haunted Cave",
    scene: "cave_background",
    theme: "Dark underground cavern with glowing crystals",
    music: "cave_theme.mp3",
    boss: { id: "cave_troll", name: "Stone Cave Troll", hp: 3000 },
  },
  {
    id: 3,
    chapter: 2,
    name: "Ruined Castle",
    scene: "castle_background",
    theme: "Ancient crumbling castle on a cliff",
    music: "castle_theme.mp3",
    boss: { id: "dragon_king", name: "Dragon King Malachar", hp: 5000 },
  },
];

const WEAPONS = [
  { id: "sword", name: "Iron Sword", damage: 50, sprite: "weapon_sword.png" },
  { id: "axe", name: "Battle Axe", damage: 80, sprite: "weapon_axe.png" },
  { id: "bow", name: "Elven Bow", damage: 60, sprite: "weapon_bow.png" },
  { id: "staff", name: "Magic Staff", damage: 90, sprite: "weapon_staff.png" },
];

const ASSETS = {
  backgrounds: [
    "bg_forest_day.png",
    "bg_forest_night.png",
    "bg_cave.png",
    "bg_castle_exterior.png",
    "bg_castle_throne.png",
  ],
  enemies: [
    "enemy_tree_spirit.png",
    "enemy_cave_troll.png",
    "enemy_dragon_king.png",
    "enemy_skeleton.png",
  ],
  effects: ["effect_fire.png", "effect_magic.png", "effect_explosion.png"],
  ui: [
    "ui_health_bar.png",
    "ui_game_over.png",
    "ui_main_menu.png",
    "ui_pause.png",
  ],
};

function loadLevel(levelId) {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) throw new Error("Level not found: " + levelId);
  return level;
}
