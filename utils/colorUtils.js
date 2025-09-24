import { ALL_COLORS, COLORS } from "../constants/colors";

/**
 * Helper function to generate 64 shades of a color using linear interpolation
 * @param {string} baseColor - The base color in hex format
 * @returns {Array} - Array of 64 shade colors
 */
const generateColorShades = (baseColor) => {
  // Parse hex color to RGB
  const hex = baseColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const shades = [];

  // Generate 64 shades from darkest (near black) to lightest (near white)
  for (let i = 0; i < 64; i++) {
    // Calculate interpolation factor (0 to 1)
    const t = i / 63;

    // Interpolate from black (0,0,0) through base color to white (255,255,255)
    let newR, newG, newB;

    if (t <= 0.5) {
      // First half: interpolate from black to base color
      const factor = t * 2; // 0 to 1
      newR = Math.round(r * factor);
      newG = Math.round(g * factor);
      newB = Math.round(b * factor);
    } else {
      // Second half: interpolate from base color to white
      const factor = (t - 0.5) * 2; // 0 to 1
      newR = Math.round(r + (255 - r) * factor);
      newG = Math.round(g + (255 - g) * factor);
      newB = Math.round(b + (255 - b) * factor);
    }

    // Convert back to hex
    const hexR = newR.toString(16).padStart(2, "0");
    const hexG = newG.toString(16).padStart(2, "0");
    const hexB = newB.toString(16).padStart(2, "0");

    shades.push(`#${hexR}${hexG}${hexB}`);
  }

  return shades;
};

/**
 * Helper function to find existing colors of the same type and integrate them into shade continuum
 * @param {string} baseColor - The base color in hex format
 * @param {number} colorIndex - The index of the color type
 * @returns {Array} - 8x8 grid of shade colors
 */
const generateShadesWithExistingColors = (baseColor, colorIndex) => {
  // Generate base 64 shades
  const generatedShades = generateColorShades(baseColor);

  // Find all existing colors of this type (same colorIndex) from all 8 palettes
  const existingColors = [];
  for (let paletteIndex = 0; paletteIndex < ALL_COLORS.length; paletteIndex++) {
    const color = ALL_COLORS[paletteIndex][colorIndex];
    existingColors.push({
      color: color,
      paletteIndex: paletteIndex,
      originalIndex: paletteIndex, // Keep track of array order for conflicts
    });
  }

  // Calculate lightness for each existing color to position in continuum
  const getColorLightness = (hexColor) => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    // Simple lightness calculation using relative luminance
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  // Sort existing colors by lightness, then by original array order for conflicts
  existingColors.sort((a, b) => {
    const lightnessA = getColorLightness(a.color);
    const lightnessB = getColorLightness(b.color);
    if (Math.abs(lightnessA - lightnessB) < 0.01) {
      // Very similar lightness
      return a.originalIndex - b.originalIndex; // Use array order
    }
    return lightnessA - lightnessB;
  });

  // Replace generated shades with existing colors at appropriate positions
  const finalShades = [...generatedShades];
  existingColors.forEach((existingColor) => {
    const lightness = getColorLightness(existingColor.color);
    // Map lightness (0-1) to position (0-63)
    const position = Math.round(lightness * 63);
    finalShades[position] = existingColor.color;
  });

  // Organize into 8x8 grid (8 rows of 8 shades each)
  const shadeGrid = [];
  for (let row = 0; row < 8; row++) {
    const rowShades = [];
    for (let col = 0; col < 8; col++) {
      const index = row * 8 + col;
      rowShades.push(finalShades[index]);
    }
    shadeGrid.push(rowShades);
  }

  return shadeGrid;
};

export { generateColorShades, generateShadesWithExistingColors };
