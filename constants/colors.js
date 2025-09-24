const COLORS = ["red", "orange", "yellow", "green", "blue", "purple", "white", "black"];

// Legacy COLOR_VALUES for backward compatibility
const COLOR_VALUES = {
  white: "#FFFFFF",
  black: "#000000",
  red: "#FF0000",
  blue: "#0000FF",
  green: "#00FF00",
  yellow: "#FFFF00",
  purple: "#800080",
  orange: "#FFA500",
};

// All 64 colors organized into 8 palettes of 8 colors each
const ALL_COLORS = [
  // 0: Default palette (improved versions of current colors)
  ["#FF3333", "#FF7700", "#FFDD00", "#33DD33", "#3377FF", "#AA33FF", "#FFFFFF", "#222222"],

  // 1: Pastel palette
  ["#FFB3B3", "#FFB380", "#FFF5AA", "#B3FFB3", "#B3CCFF", "#E6B3FF", "#FEFEFE", "#888888"],

  // 2: Earth tones palette
  ["#D85555", "#DD8844", "#DDAA33", "#669944", "#5588AA", "#8855AA", "#F5F0EA", "#3D3D3D"],

  // 3: Ocean palette
  ["#FF6B6B", "#FF9F6B", "#FFD56B", "#6BFF9F", "#6BAAFF", "#9F6BFF", "#F0FDFF", "#4A4A4A"],

  // 4: Sunset palette
  ["#FF4D6D", "#FF8A5C", "#FFD93D", "#8CFF6B", "#6B9DFF", "#D67AFF", "#FFF8F0", "#2A2A2A"],

  // 5: Pure colors (highly saturated)
  ["#FF0000", "#FF8800", "#FFFF00", "#00FF00", "#0066FF", "#8800FF", "#FFFFFF", "#000000"],

  // 6: Jewel tones palette
  ["#990033", "#CC4400", "#998800", "#006600", "#1A1A99", "#660099", "#F7F7F7", "#1A1A1A"],

  // 7: Toxic/Garish palette
  ["#FF0080", "#FF6600", "#CCFF00", "#00FF40", "#0080FF", "#8000FF", "#FFFFFF", "#000000"],
];

const GOLDEN_COLOR = "#FFCC02";

const ALIGNMENTS = ["left", "center", "right"];

export { COLORS, COLOR_VALUES, ALL_COLORS, GOLDEN_COLOR, ALIGNMENTS };
