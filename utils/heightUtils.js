/**
 * Calculate preview height based on text measurements
 * @param {number} measuredHeight - The measured height of the text content
 * @returns {number} Calculated preview height in pixels
 */

export const calculatePreviewHeight = (measuredHeight) => {
  const bottomPadding = 20; // Fixed bottom padding in pixels
  const textToWatermarkSpacing = 20; // Space between text and watermark in pixels
  const topPadding = 40; // Fixed top padding in pixels
  const watermarkHeight = 12; // Watermark text height in pixels

  const validMeasuredHeight =
    measuredHeight && !isNaN(measuredHeight) && isFinite(measuredHeight) && measuredHeight > 0
      ? measuredHeight
      : 200;
  let calculatedHeight = validMeasuredHeight * 1.5; // accounts for small font sizes

  if (validMeasuredHeight > 100) {
    calculatedHeight =
      topPadding + validMeasuredHeight + textToWatermarkSpacing + watermarkHeight + bottomPadding;
  }

  const result = Math.round(calculatedHeight);

  return result && !isNaN(result) && isFinite(result) && result > 0 ? result : 400; // Default to 400 pixels if invalid
};
