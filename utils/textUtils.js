const COLORS = ["white", "black", "red", "blue", "green", "yellow", "purple", "orange"];

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

const COMPLEMENTARY_COLORS = {
  white: "black",
  black: "white",
  red: "green",
  blue: "orange",
  green: "red",
  yellow: "purple",
  purple: "yellow",
  orange: "blue",
};

const ALIGNMENTS = ["left", "center", "right"];

const FONT_FAMILIES = [
  "System",
  "Courier",
  "Times New Roman",
];

/**
 * Calculate font size based on text length
 * @param {string} text - The input text
 * @param {number} baseSize - Base font size in pixels
 * @param {number} minSize - Minimum font size in pixels
 * @param {number} shrinkStart - Text length at which font starts shrinking
 * @returns {number} Calculated font size
 */
export const calculateFontSize = (text, baseSize = 32, minSize = 20, shrinkStart = 300) => {
  if (!text || text.length === 0) {
    return baseSize;
  }

  const textLength = text.length;

  if (textLength <= shrinkStart) {
    return baseSize;
  }

  const result = baseSize - ((textLength - shrinkStart) / shrinkStart) * (baseSize - minSize);
  return Math.max(Math.round(result), minSize);
};

/**
 * Cycle through color options
 * @param {number} currentIndex - Current color index
 * @param {Array} colorArray - Array of colors to cycle through
 * @returns {number} Next color index
 */
export const getNextColorIndex = (currentIndex, colorArray = COLORS) => {
  return (currentIndex + 1) % colorArray.length;
};

/**
 * Cycle through alignment options
 * @param {number} currentIndex - Current alignment index
 * @returns {number} Next alignment index
 */
export const getNextAlignmentIndex = (currentIndex) => {
  return (currentIndex + 1) % ALIGNMENTS.length;
};

/**
 * Cycle through font family options
 * @param {number} currentIndex - Current font family index
 * @returns {number} Next font family index
 */
export const getNextFontFamilyIndex = (currentIndex) => {
  return (currentIndex + 1) % FONT_FAMILIES.length;
};

/**
 * Get complementary color for a given color
 * @param {string} colorName - Name of the color
 * @returns {string} Name of complementary color
 */
export const getComplementaryColor = (colorName) => {
  return COMPLEMENTARY_COLORS[colorName] || "black";
};

/**
 * Get random color index and its complementary color index
 * @returns {Object} Object with backgroundIndex and textIndex
 */
export const getRandomColorPair = () => {
  const backgroundIndex = Math.floor(Math.random() * COLORS.length);
  const backgroundColor = COLORS[backgroundIndex];
  const complementaryColor = getComplementaryColor(backgroundColor);
  const textIndex = COLORS.indexOf(complementaryColor);

  return {
    backgroundIndex,
    textIndex,
  };
};

/**
 * Get color value from color name
 * @param {string} colorName - Name of the color
 * @returns {string} Hex color value
 */
export const getColorValue = (colorName) => {
  return COLOR_VALUES[colorName] || "#000000";
};

/**
 * Get alignment name from index
 * @param {number} index - Alignment index
 * @returns {string} Alignment name
 */
export const getAlignmentName = (index) => {
  return ALIGNMENTS[index] || "left";
};

/**
 * Get font family name from index
 * @param {number} index - Font family index
 * @returns {string} Font family name
 */
export const getFontFamilyName = (index) => {
  return FONT_FAMILIES[index] || "System";
};

/**
 * Validate text input
 * @param {string} text - Input text
 * @returns {boolean} Whether text is valid
 */
export const isValidText = (text) => {
  return typeof text === "string" && text.trim().length > 0;
};

export { COLORS, COLOR_VALUES, COMPLEMENTARY_COLORS, ALIGNMENTS, FONT_FAMILIES };