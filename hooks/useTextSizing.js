import { useState, useCallback } from "react";
import {
  TEXT_SIZES,
  createSegmentsFromText,
  getTextFromSegments,
  applyTextSizeToSelection as applyTextSizeToSelectionUtil,
  getSizeLabel,
} from "../constants/textSizing";

/**
 * Custom hook for managing text sizing state and operations
 */
export const useTextSizing = () => {
  const [currentTextSize, setCurrentTextSize] = useState(1); // 0=small, 1=medium, 2=extra-medium, 3=large, 4=extra-large
  const [textSegments, setTextSegments] = useState([]);
  const [textSelection, setTextSelection] = useState({ start: 0, end: 0 });
  const [isEditingText, setIsEditingText] = useState(false);
  const [magnification, setMagnification] = useState(1.0);

  /**
   * Cycle through text sizes (S -> M -> XM -> L -> XL -> S)
   */
  const cycleTextSize = useCallback(() => {
    setCurrentTextSize((prevSize) => (prevSize + 1) % TEXT_SIZES.length);
  }, []);

  /**
   * Apply current text size to selected text
   * @param {string} plainText - Current plain text from TextInput
   */
  const applyTextSizeToSelection = useCallback(
    (plainText) => {
      if (!plainText || textSelection.start === textSelection.end) {
        return; // No text or no selection
      }

      // If we don't have segments yet, create them from plain text
      const currentSegments =
        textSegments.length > 0 ? textSegments : createSegmentsFromText(plainText, "medium");

      const newSize = TEXT_SIZES[currentTextSize];
      const updatedSegments = applyTextSizeToSelectionUtil(
        currentSegments,
        textSelection.start,
        textSelection.end,
        newSize
      );

      setTextSegments(updatedSegments);
    },
    [textSegments, textSelection, currentTextSize]
  );

  /**
   * Initialize text segments from plain text
   * @param {string} text - Plain text
   * @param {string} defaultSize - Default size for conversion
   */
  const initializeSegments = useCallback((text, defaultSize = "medium") => {
    const segments = createSegmentsFromText(text, defaultSize);
    setTextSegments(segments);
  }, []);

  /**
   * Update text segments when plain text changes
   * @param {string} newText - Updated plain text
   */
  const updateSegmentsFromText = useCallback(
    (newText) => {
      // If no segments exist, create them with current size
      if (textSegments.length === 0) {
        const currentSize = TEXT_SIZES[currentTextSize];
        setTextSegments(createSegmentsFromText(newText, currentSize));
        return;
      }

      // Get current plain text from segments
      const currentPlainText = getTextFromSegments(textSegments);

      // If text hasn't changed, no update needed
      if (currentPlainText === newText) {
        return;
      }

      // Handle text changes (insertions, deletions)
      // For now, we'll use a simple approach: if text length changed significantly,
      // we'll recreate segments. This can be enhanced later for better UX.
      const lengthDiff = Math.abs(newText.length - currentPlainText.length);

      if (lengthDiff > 10 || newText.length === 0) {
        // Significant change or empty text - recreate segments
        const currentSize = TEXT_SIZES[currentTextSize];
        setTextSegments(createSegmentsFromText(newText, currentSize));
      } else {
        // Minor change - try to preserve segments structure
        // This is a simplified approach; more sophisticated logic could be added
        const currentSize = TEXT_SIZES[currentTextSize];
        setTextSegments(createSegmentsFromText(newText, currentSize));
      }
    },
    [textSegments, currentTextSize]
  );

  /**
   * Get current size label for UI display
   */
  const getCurrentSizeLabel = useCallback(() => {
    return getSizeLabel(currentTextSize);
  }, [currentTextSize]);

  /**
   * Set text segments directly (for loading saved data)
   * @param {Array} segments - Text segments to set
   */
  const setTextSegmentsDirectly = useCallback((segments) => {
    setTextSegments(segments || []);
  }, []);

  /**
   * Enter text editing mode
   */
  const enterEditingMode = useCallback(() => {
    setIsEditingText(true);
  }, []);

  /**
   * Exit text editing mode
   */
  const exitEditingMode = useCallback(() => {
    setIsEditingText(false);
  }, []);

  /**
   * Update text selection coordinates
   * @param {Object} selection - Selection object with start and end
   */
  const updateTextSelection = useCallback((selection) => {
    setTextSelection(selection);
  }, []);

  /**
   * Update magnification factor
   * @param {number} newMagnification - New magnification value
   */
  const updateMagnification = useCallback((newMagnification) => {
    setMagnification(newMagnification);
  }, []);

  /**
   * Reset text sizing state
   */
  const resetTextSizing = useCallback(() => {
    setCurrentTextSize(1); // medium
    setTextSegments([]);
    setTextSelection({ start: 0, end: 0 });
    setIsEditingText(false);
    setMagnification(1.0);
  }, []);

  /**
   * Set current text size index
   * @param {number} sizeIndex - Text size index (0=small, 1=medium, 2=extra-medium, 3=large, 4=extra-large)
   */
  const setCurrentTextSizeValue = useCallback((sizeIndex) => {
    setCurrentTextSize(sizeIndex);
  }, []);

  /**
   * Get plain text from current segments
   */
  const getPlainText = useCallback(() => {
    return getTextFromSegments(textSegments);
  }, [textSegments]);

  return {
    // State
    currentTextSize,
    textSegments,
    textSelection,
    isEditingText,
    magnification,

    // Actions
    cycleTextSize,
    applyTextSizeToSelection,
    initializeSegments,
    updateSegmentsFromText,
    setTextSegmentsDirectly,
    setCurrentTextSizeValue,
    enterEditingMode,
    exitEditingMode,
    updateTextSelection,
    updateMagnification,
    resetTextSizing,

    // Derived values
    getCurrentSizeLabel,
    getPlainText,
  };
};
