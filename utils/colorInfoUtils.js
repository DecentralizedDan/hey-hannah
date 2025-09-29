import { ALL_COLORS } from "../constants/colors";
import { ALL_SHADES } from "../constants/shades";

/**
 * Create color info object for saving to metadata
 * @param {boolean} isShade - Whether this is a shade color
 * @param {number} colorModeSelection - Current palette/color type selection
 * @param {number} colorIndex - Current color index within palette
 * @param {number|null} highlightedRow - Currently highlighted row (-1 if none)
 * @param {number|null} highlightedColumn - Currently highlighted column (-1 if none)
 * @param {string|null} selectedShadeColor - Currently selected shade color hex
 * @param {string|null} selectedShadeType - Type of selected shade ("background" or "text")
 * @param {string} colorType - Type being saved ("background" or "text")
 * @returns {Object} Color info object for metadata
 */
const createColorInfo = (
  isShade,
  colorModeSelection,
  colorIndex,
  highlightedRow,
  highlightedColumn,
  selectedShadeColor,
  selectedShadeType,
  colorType
) => {
  if (isShade && selectedShadeColor && selectedShadeType === colorType) {
    // This is a shade color - need to determine which shade array and position
    const shadeColorInfo = analyzeShadeColor(selectedShadeColor, highlightedRow, highlightedColumn);

    return {
      shade: true,
      colorIndex: shadeColorInfo.colorIndex,
      rowOrColumn: shadeColorInfo.rowOrColumn,
      arrayNumber: shadeColorInfo.arrayNumber,
      activeColor: shadeColorInfo.activeColor,
    };
  } else {
    // This is a regular palette color

    return {
      shade: false,
      paletteIndex: colorModeSelection,
      activeColor: colorIndex,
    };
  }
};

/**
 * Analyze a shade color to determine its position in the shade grid
 * @param {string} shadeColor - Hex color value
 * @param {number} highlightedRow - Currently highlighted row
 * @param {number} highlightedColumn - Currently highlighted column
 * @returns {Object} Shade analysis result
 */
const analyzeShadeColor = (shadeColor, highlightedRow, highlightedColumn) => {
  // Ensure numeric values and default to -1 if undefined/null
  const safeHighlightedRow = typeof highlightedRow === "number" ? highlightedRow : -1;
  const safeHighlightedColumn = typeof highlightedColumn === "number" ? highlightedColumn : -1;

  // Find which color type (shade array) this color belongs to
  for (let colorIndex = 0; colorIndex < ALL_SHADES.length; colorIndex++) {
    const shadeArray = ALL_SHADES[colorIndex];
    const colorPosition = shadeArray.indexOf(shadeColor);

    if (colorPosition !== -1) {
      // Found the color in this shade array
      if (safeHighlightedRow !== -1) {
        // This is a row selection
        const row = safeHighlightedRow;
        const column = colorPosition % 8; // Position within the row
        const result = {
          colorIndex,
          rowOrColumn: "row",
          arrayNumber: row,
          activeColor: column,
        };
        return result;
      } else if (safeHighlightedColumn !== -1) {
        // This is a column selection
        const column = safeHighlightedColumn;
        const row = Math.floor(colorPosition / 8); // Which row in the column
        const result = {
          colorIndex,
          rowOrColumn: "column",
          arrayNumber: column,
          activeColor: row,
        };
        return result;
      } else {
        // Fallback: determine row/column from position
        const row = Math.floor(colorPosition / 8);
        const column = colorPosition % 8;
        const result = {
          colorIndex,
          rowOrColumn: "row", // Default to row
          arrayNumber: row,
          activeColor: column,
        };
        return result;
      }
    }
  }

  // Color not found in any shade array - shouldn't happen
  throw new Error(`Shade color ${shadeColor} not found in any shade array`);
};

/**
 * Get the actual hex color from color info
 * @param {Object} colorInfo - Color info object from metadata
 * @returns {string} Hex color value
 */
const getColorFromInfo = (colorInfo) => {
  if (colorInfo.shade) {
    // This is a shade color
    const shadeArray = ALL_SHADES[colorInfo.colorIndex];

    if (colorInfo.rowOrColumn === "row") {
      // Get color from specific row
      const position = colorInfo.arrayNumber * 8 + colorInfo.activeColor;
      const color = shadeArray[position];
      return color;
    } else {
      // Get color from specific column
      const position = colorInfo.activeColor * 8 + colorInfo.arrayNumber;
      const color = shadeArray[position];
      return color;
    }
  } else {
    // This is a regular palette color
    const palette = ALL_COLORS[colorInfo.paletteIndex];
    return palette[colorInfo.activeColor];
  }
};

/**
 * Get the color palette array from color info
 * @param {Object} colorInfo - Color info object from metadata
 * @returns {Array} Array of 8 colors representing the palette
 */
const getPaletteFromInfo = (colorInfo) => {
  if (colorInfo.shade) {
    // This is a shade palette - construct the row or column
    const shadeArray = ALL_SHADES[colorInfo.colorIndex];
    const palette = [];

    if (colorInfo.rowOrColumn === "row") {
      // Extract the row
      const rowStart = colorInfo.arrayNumber * 8;
      for (let i = 0; i < 8; i++) {
        palette.push(shadeArray[rowStart + i]);
      }
    } else {
      // Extract the column
      for (let i = 0; i < 8; i++) {
        const position = i * 8 + colorInfo.arrayNumber;
        palette.push(shadeArray[position]);
      }
    }

    return palette;
  } else {
    // This is a regular palette
    return ALL_COLORS[colorInfo.paletteIndex];
  }
};

/**
 * Check if current state represents a shade selection
 * @param {string|null} selectedShadeColor - Currently selected shade color
 * @param {string|null} selectedShadeType - Type of selected shade
 * @param {string} colorType - Type being checked ("background" or "text")
 * @returns {boolean} True if this is a shade selection
 */
const isShadeSelection = (selectedShadeColor, selectedShadeType, colorType) => {
  return selectedShadeColor !== null && selectedShadeType === colorType;
};

export {
  createColorInfo,
  getColorFromInfo,
  getPaletteFromInfo,
  isShadeSelection,
  analyzeShadeColor,
};
