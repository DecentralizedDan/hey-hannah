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

  // Helper functions to get current colors from new palette system
  const getCurrentBackgroundColor = (backgroundColorIndex) => {
    // If a shade color is selected for background, use that
    if (selectedShadeColor && selectedShadeType === "background") {
      return selectedShadeColor;
    }

    if (bgColorMode === "palette") {
      return ALL_COLORS[bgColorModeSelection][backgroundColorIndex];
    } else {
      // variations mode - bgColorModeSelection is the color type (0=red, 1=orange, etc.)
      // backgroundColorIndex is the palette index (0-7)
      return ALL_COLORS[backgroundColorIndex][bgColorModeSelection];
    }
  };

  const getCurrentTextColor = (textColorIndex) => {
    // If a shade color is selected for text, use that
    if (selectedShadeColor && selectedShadeType === "text") {
      return selectedShadeColor;
    }

    if (textColorMode === "palette") {
      return ALL_COLORS[textColorModeSelection][textColorIndex];
    } else {
      // variations mode - textColorModeSelection is the color type (0=red, 1=orange, etc.)
      // textColorIndex is the palette index (0-7)
      return ALL_COLORS[textColorIndex][textColorModeSelection];
    }
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
  };
};
