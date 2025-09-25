/**
 * Utility functions for ordering colors by brightness
 */

/**
 * Calculate relative luminance of a color using the WCAG formula
 * Higher values = lighter colors, lower values = darker colors
 * @param {string} hexColor - Hex color string (e.g., "#FF0000")
 * @returns {number} Relative luminance value between 0 and 1
 */
function calculateLuminance(hexColor) {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

/**
 * Order an array of hex colors by brightness
 * @param {string[]} colors - Array of hex color strings
 * @param {string} direction - "darkest-to-lightest" or "lightest-to-darkest"
 * @returns {string[]} Ordered array of colors
 */
function orderColorsByBrightness(colors, direction = "darkest-to-lightest") {
  const colorsWithLuminance = colors.map((color) => ({
    color,
    luminance: calculateLuminance(color),
  }));

  // Sort by luminance
  colorsWithLuminance.sort((a, b) => {
    if (direction === "darkest-to-lightest") {
      return a.luminance - b.luminance; // Ascending (dark to light)
    } else if (direction === "lightest-to-darkest") {
      return b.luminance - a.luminance; // Descending (light to dark)
    } else {
      throw new Error('Direction must be "darkest-to-lightest" or "lightest-to-darkest"');
    }
  });

  return colorsWithLuminance.map((item) => item.color);
}

export { calculateLuminance, orderColorsByBrightness };

