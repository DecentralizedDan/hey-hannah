// Text sizing constants and helper functions

export const TEXT_SIZES = ["small", "medium", "extra-medium", "large", "extra-large"];

export const BASE_FONT_SIZES = {
  small: 20, // Small text size in pixels
  medium: 32, // Medium text size in pixels
  "extra-medium": 48, // Extra medium text size in pixels
  large: 72, // Large text size in pixels
  "extra-large": 96, // Extra large text size in pixels
};

/**
 * Convert size name to pixel value
 * @param {string} sizeName - "small", "medium", "extra-medium", "large", or "extra-large"
 * @param {number} magnification - Magnification factor (default 1.0)
 * @returns {number} Font size in pixels
 */
export const getSizeValue = (sizeName, magnification = 1.0) => {
  const baseSize = BASE_FONT_SIZES[sizeName] || BASE_FONT_SIZES.medium;
  const validMagnification =
    magnification && !isNaN(magnification) && isFinite(magnification) ? magnification : 1.0;
  const result = Math.round(baseSize * validMagnification);

  return result && !isNaN(result) && isFinite(result) ? result : 32; // Default to 32 pixels if invalid
};

/**
 * Get display label for size button
 * @param {number} sizeIndex - Index in TEXT_SIZES array
 * @returns {string} Display label (S/M/XM/L/XL)
 */
export const getSizeLabel = (sizeIndex) => {
  const labels = { small: "S", medium: "M", "extra-medium": "XM", large: "L", "extra-large": "XL" };
  const sizeName = TEXT_SIZES[sizeIndex] || "medium";
  return labels[sizeName];
};

/**
 * Create text segments from plain text
 * @param {string} text - Plain text string
 * @param {string} defaultSize - Default size for all text
 * @returns {Array} Array of text segments
 */
export const createSegmentsFromText = (text, defaultSize = "medium") => {
  if (!text || text.length === 0) return [];
  return [{ text, size: defaultSize }];
};

/**
 * Convert text segments back to plain text
 * @param {Array} segments - Array of text segments
 * @returns {string} Plain text string
 */
export const getTextFromSegments = (segments) => {
  if (!segments || segments.length === 0) return "";
  return segments.map((segment) => segment.text).join("");
};

/**
 * Apply text size to a selection range
 * @param {Array} segments - Current text segments
 * @param {number} start - Selection start position
 * @param {number} end - Selection end position
 * @param {string} newSize - Size to apply to selection
 * @returns {Array} Updated text segments
 */
export const applyTextSizeToSelection = (segments, start, end, newSize) => {
  if (!segments || segments.length === 0) return segments;
  if (start === end) return segments; // No selection

  const text = getTextFromSegments(segments);
  if (start < 0 || end > text.length || start >= end) return segments;

  // Split text into three parts: before, selection, after
  const beforeText = text.substring(0, start);
  const selectedText = text.substring(start, end);
  const afterText = text.substring(end);

  const newSegments = [];

  // Add before text segments (preserve existing sizes)
  if (beforeText.length > 0) {
    let currentPos = 0;
    for (const segment of segments) {
      if (currentPos >= beforeText.length) break;

      const segmentEnd = currentPos + segment.text.length;
      if (segmentEnd <= beforeText.length) {
        // Entire segment is before selection
        newSegments.push({ ...segment });
      } else {
        // Partial segment before selection
        const partialText = beforeText.substring(currentPos);
        if (partialText.length > 0) {
          newSegments.push({ text: partialText, size: segment.size });
        }
        break;
      }
      currentPos = segmentEnd;
    }
  }

  // Add selected text with new size
  if (selectedText.length > 0) {
    newSegments.push({ text: selectedText, size: newSize });
  }

  // Add after text segments (preserve existing sizes)
  if (afterText.length > 0) {
    let currentPos = end;
    for (const segment of segments) {
      const segmentStart = currentPos - segment.text.length;
      if (segmentStart >= end) {
        newSegments.push({ ...segment });
      } else if (currentPos > end) {
        // Partial segment after selection
        const startInSegment = end - segmentStart;
        const partialText = segment.text.substring(startInSegment);
        if (partialText.length > 0) {
          newSegments.push({ text: partialText, size: segment.size });
        }
      }
      currentPos -= segment.text.length;
    }
  }

  // Merge adjacent segments with same size
  return mergeAdjacentSegments(newSegments);
};

/**
 * Merge adjacent text segments with the same size
 * @param {Array} segments - Text segments to merge
 * @returns {Array} Merged text segments
 */
export const mergeAdjacentSegments = (segments) => {
  if (!segments || segments.length <= 1) return segments;

  const merged = [];
  let current = { ...segments[0] };

  for (let i = 1; i < segments.length; i++) {
    const next = segments[i];

    if (current.size === next.size) {
      // Merge with current segment
      current.text += next.text;
    } else {
      // Push current and start new segment
      merged.push(current);
      current = { ...next };
    }
  }

  // Push final segment
  merged.push(current);

  return merged;
};
