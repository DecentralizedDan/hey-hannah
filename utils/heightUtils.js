/**
 * Calculate preview height based on text measurements
 * @param {number} measuredHeight - The measured height of the text content (includes paddingTop from measureText)
 * @returns {number} Calculated preview height in pixels
 */

export const calculatePreviewHeight = (measuredHeight) => {
  const bottomPadding = 20; // Fixed bottom padding in pixels
  const textToWatermarkSpacing = 20; // Space between text and watermark in pixels
  const watermarkHeight = 12; // Watermark text height in pixels

  const validMeasuredHeight =
    measuredHeight && !isNaN(measuredHeight) && isFinite(measuredHeight) && measuredHeight > 0
      ? measuredHeight
      : 200;

  // The measured height already includes the text's natural height plus paddingTop from measureText
  // We just need to add: bottom padding, spacing before watermark, and watermark height
  // Add extra margin (1.1x) to ensure text doesn't get cut off
  const calculatedHeight =
    validMeasuredHeight * 1.1 + textToWatermarkSpacing + watermarkHeight + bottomPadding;

  const result = Math.round(calculatedHeight);

  return result && !isNaN(result) && isFinite(result) && result > 0 ? result : 400; // Default to 400 pixels if invalid
};
