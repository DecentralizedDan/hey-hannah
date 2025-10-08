/**
 * Calculate preview height based on text measurements
 * @param {number} measuredHeight - The measured height of the text content
 * @returns {number} Calculated preview height in pixels
 */

export const calculatePreviewHeight = (measuredHeight) => {
  const topPadding = 40; // Fixed top padding in pixels
  const textToWatermarkSpacing = 20; // Space between text and watermark in pixels
  const watermarkHeight = 12; // Watermark text height in pixels
  const bottomPadding = 20; // Fixed bottom padding in pixels
  let calculatedHeight = measuredHeight * 1.5; // accounts for small font sizes

  if (measuredHeight > 100) {
    calculatedHeight =
      topPadding + measuredHeight + textToWatermarkSpacing + watermarkHeight + bottomPadding;
  }

  return Math.round(calculatedHeight);
};
