import { useState } from "react";
import { ALL_COLORS } from "../constants/colors";

export const useColorManagement = () => {
  // Color palette state management
  const [bgColorMode, setBgColorMode] = useState("palette"); // "palette" or "variations"
  const [bgColorModeSelection, setBgColorModeSelection] = useState(0); // 0-7 (palette or variation index)
  const [textColorMode, setTextColorMode] = useState("palette"); // "palette" or "variations"
  const [textColorModeSelection, setTextColorModeSelection] = useState(6); // 0-7 (palette or variation index)

  // Color selection menu state
  const [colorMenuVisible, setColorMenuVisible] = useState(false);
  const [colorMenuType, setColorMenuType] = useState("background"); // "background" or "text"
  const [highlightedRow, setHighlightedRow] = useState(-1); // -1 means no highlight
  const [highlightedColumn, setHighlightedColumn] = useState(-1); // -1 means no highlight

  // Shade selector menu state
  const [shadeMenuVisible, setShadeMenuVisible] = useState(false);
  const [shadeMenuColor, setShadeMenuColor] = useState("#0000FF"); // The base color for shades
  const [originalColorMenuState, setOriginalColorMenuState] = useState({
    bgColorMode: "palette",
    bgColorModeSelection: 0,
    textColorMode: "palette",
    textColorModeSelection: 6,
    highlightedRow: -1,
    highlightedColumn: -1,
  });
  const [selectedShadeColor, setSelectedShadeColor] = useState(null);
  const [selectedShadeType, setSelectedShadeType] = useState(null); // "background" or "text"

  // Custom palettes state
  const [customPalettes, setCustomPalettes] = useState([]); // Array of custom 8-color palettes

  // Helper function to get palette (predefined or custom)
  const getPalette = (paletteIndex) => {
    if (paletteIndex < ALL_COLORS.length) {
      return ALL_COLORS[paletteIndex];
    } else {
      // Custom palette index
      const customIndex = paletteIndex - ALL_COLORS.length;
      return customPalettes[customIndex] || ALL_COLORS[0]; // Fallback to default
    }
  };

  // Helper functions to get current colors from new palette system
  const getCurrentBackgroundColor = (backgroundColorIndex) => {
    // If a shade color is selected for background, use that
    if (selectedShadeColor && selectedShadeType === "background") {
      return selectedShadeColor;
    }

    if (bgColorMode === "palette") {
      const palette = getPalette(bgColorModeSelection);
      return palette[backgroundColorIndex];
    } else {
      // variations mode - bgColorModeSelection is the color type (0=red, 1=orange, etc.)
      // backgroundColorIndex is the palette index (0-7)
      const palette = getPalette(backgroundColorIndex);
      return palette[bgColorModeSelection];
    }
  };

  const getCurrentTextColor = (textColorIndex) => {
    // If a shade color is selected for text, use that
    if (selectedShadeColor && selectedShadeType === "text") {
      return selectedShadeColor;
    }

    if (textColorMode === "palette") {
      const palette = getPalette(textColorModeSelection);
      return palette[textColorIndex];
    } else {
      // variations mode - textColorModeSelection is the color type (0=red, 1=orange, etc.)
      // textColorIndex is the palette index (0-7)
      const palette = getPalette(textColorIndex);
      return palette[textColorModeSelection];
    }
  };

  // Function to save a shade row as a custom palette
  const saveShadeRowAsPalette = (shadeRow) => {
    const newCustomPalettes = [...customPalettes, shadeRow];
    setCustomPalettes(newCustomPalettes);
    // Return the index of the new custom palette
    return ALL_COLORS.length + newCustomPalettes.length - 1;
  };

  return {
    // State
    bgColorMode,
    setBgColorMode,
    bgColorModeSelection,
    setBgColorModeSelection,
    textColorMode,
    setTextColorMode,
    textColorModeSelection,
    setTextColorModeSelection,
    colorMenuVisible,
    setColorMenuVisible,
    colorMenuType,
    setColorMenuType,
    highlightedRow,
    setHighlightedRow,
    highlightedColumn,
    setHighlightedColumn,
    shadeMenuVisible,
    setShadeMenuVisible,
    shadeMenuColor,
    setShadeMenuColor,
    originalColorMenuState,
    setOriginalColorMenuState,
    selectedShadeColor,
    setSelectedShadeColor,
    selectedShadeType,
    setSelectedShadeType,

    // Helper functions
    getCurrentBackgroundColor,
    getCurrentTextColor,
    getPalette,
    saveShadeRowAsPalette,
    customPalettes,
  };
};
