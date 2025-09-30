import { Dimensions } from "react-native";
import { getSizeValue, TEXT_SIZES } from "../constants/textSizing";

/**
 * Calculate preview height based on text measurements and current text size
 * @param {number} measuredHeight - The measured height of the text content
 * @param {number} currentTextSize - Current text size index (0=small, 1=medium, etc.)
 * @param {number} magnification - Magnification factor (default 1.0)
 * @returns {number} Calculated preview height in pixels
 */
export const calculatePreviewHeight = (measuredHeight, currentTextSize, magnification = 1.0) => {
  const screenWidth = Dimensions.get("window").width;
  const verticalPadding = screenWidth * 0.1; // 5% top + 5% bottom = 10% total in pixels

  // Dynamic watermark spacing based on text size
  const watermarkMarginTop = 40; // Fixed top margin in pixels
  const watermarkFontSize = 12; // Watermark text height in pixels

  // Get current font size for calculations
  const currentSize = TEXT_SIZES[currentTextSize] || "medium";
  const fontSize = getSizeValue(currentSize, magnification);

  // Bottom margin proportional to text size: smaller text = less bottom space
  let watermarkBottomMargin;
  if (fontSize >= 96) {
    // XL
    watermarkBottomMargin = 80; // Large bottom margin for XL text preview in pixels
  } else if (fontSize >= 72) {
    // L
    watermarkBottomMargin = 60; // Slightly less bottom margin in pixels
  } else if (fontSize >= 48) {
    // XM
    watermarkBottomMargin = 12; // Medium bottom margin in pixels
  } else if (fontSize >= 32) {
    // M
    watermarkBottomMargin = -30; // Small bottom margin in pixels
  } else {
    // S
    watermarkBottomMargin = -80; // Minimal bottom margin for smallest text in pixels
  }

  const watermarkSpacing = watermarkMarginTop + watermarkFontSize + watermarkBottomMargin;

  // More aggressive padding for larger text sizes
  let extraPadding;
  if (fontSize >= 96) {
    // XL (96px)
    extraPadding = fontSize * 1.5; // 150% of font size as extra padding in pixels
  } else if (fontSize >= 72) {
    // L (72px)
    extraPadding = fontSize * 1.0; // 100% of font size as extra padding in pixels
  } else if (fontSize >= 48) {
    // XM (48px)
    extraPadding = fontSize * 0.75; // 75% of font size as extra padding in pixels
  } else {
    extraPadding = Math.max(fontSize * 0.5, 20); // 50% of font size, minimum 20px in pixels
  }

  const calculatedHeight = Math.max(
    measuredHeight + verticalPadding + watermarkSpacing + extraPadding,
    100
  ); // Minimum height of 100 in pixels

  return calculatedHeight;
};
