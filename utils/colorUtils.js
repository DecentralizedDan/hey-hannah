import { ALL_SHADES } from "../constants/shades";

/**
 * Get pre-computed 64 shades for a specific color type, organized as 8x8 grid
 * @param {string} baseColor - The base color in hex format (not used, kept for compatibility)
 * @param {number} colorIndex - The index of the color type (0=red, 1=orange, etc.)
 * @returns {Array} - 8x8 grid of shade colors
 */
const generateShadesWithExistingColors = (baseColor, colorIndex) => {
  // Get the pre-computed 64 shades for this color type
  const shades = ALL_SHADES[colorIndex];

  // Organize into 8x8 grid (8 rows of 8 shades each)
  const shadeGrid = [];
  for (let row = 0; row < 8; row++) {
    const rowShades = [];
    for (let col = 0; col < 8; col++) {
      const index = row * 8 + col;
      rowShades.push(shades[index]);
    }
    shadeGrid.push(rowShades);
  }

  return shadeGrid;
};

/**
 * Get pre-computed 64 shades for a specific color type as flat array
 * @param {number} colorIndex - The index of the color type (0=red, 1=orange, etc.)
 * @returns {Array} - Array of 64 shade colors from darkest to lightest
 */
const getColorShades = (colorIndex) => {
  return ALL_SHADES[colorIndex];
};

export { getColorShades, generateShadesWithExistingColors };
