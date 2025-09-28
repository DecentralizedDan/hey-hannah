import { ALL_SHADES } from "../constants/shades";

/**
 * Analyze a color palette to determine if it represents a shade pattern
 * @param {Array} palette - Array of 8 colors
 * @returns {Object|null} Shade pattern info or null if not a shade pattern
 */
export const analyzeShadePattern = (palette) => {
  if (!palette || palette.length !== 8) {
    return null;
  }

  // Check if this palette matches any shade patterns
  for (let colorIndex = 0; colorIndex < ALL_SHADES.length; colorIndex++) {
    const shadeArray = ALL_SHADES[colorIndex];

    // Check for row patterns (consecutive 8 colors from the shade array)
    for (let row = 0; row < 8; row++) {
      const rowStart = row * 8;
      const rowColors = shadeArray.slice(rowStart, rowStart + 8);

      if (JSON.stringify(rowColors) === JSON.stringify(palette)) {
        return {
          type: "row",
          colorIndex,
          arrayNumber: row,
        };
      }
    }

    // Check for column patterns (every 8th color starting from different positions)
    for (let col = 0; col < 8; col++) {
      const colColors = [];
      for (let row = 0; row < 8; row++) {
        colColors.push(shadeArray[row * 8 + col]);
      }

      if (JSON.stringify(colColors) === JSON.stringify(palette)) {
        return {
          type: "column",
          colorIndex,
          arrayNumber: col,
        };
      }
    }
  }

  return null;
};

/**
 * Restore shade highlighting based on analyzed shade patterns
 * @param {Object|null} bgShadePattern - Background shade pattern
 * @param {Object|null} textShadePattern - Text shade pattern
 * @param {Function} setHighlightedRow - Function to set highlighted row
 * @param {Function} setHighlightedColumn - Function to set highlighted column
 */
export const restoreShadeHighlighting = (
  bgShadePattern,
  textShadePattern,
  setHighlightedRow,
  setHighlightedColumn
) => {
  // Prioritize background shade pattern for highlighting
  const shadePattern = bgShadePattern || textShadePattern;

  if (shadePattern) {
    if (shadePattern.type === "row") {
      setHighlightedRow(shadePattern.arrayNumber);
      setHighlightedColumn(-1);
    } else if (shadePattern.type === "column") {
      setHighlightedRow(-1);
      setHighlightedColumn(shadePattern.arrayNumber);
    }
  } else {
    // No shade pattern found, reset highlighting
    setHighlightedRow(-1);
    setHighlightedColumn(-1);
  }
};
