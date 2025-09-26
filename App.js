import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActionSheetIOS,
  Animated,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { useFonts } from "expo-font";
import { Courgette_400Regular } from "@expo-google-fonts/courgette";
import { PermanentMarker_400Regular } from "@expo-google-fonts/permanent-marker";
import { BlackOpsOne_400Regular } from "@expo-google-fonts/black-ops-one";
import { Quicksand_400Regular } from "@expo-google-fonts/quicksand";

// Import extracted modules
import { COLORS, ALL_COLORS, ALIGNMENTS } from "./constants/colors";
import { FONT_FAMILIES } from "./constants/fonts";
import { generateFilename, saveImageForSharing } from "./utils/fileUtils";
import { generateShadesWithExistingColors } from "./utils/colorUtils";
import { useColorManagement } from "./hooks/useColorManagement";
import { useGalleryManagement } from "./hooks/useGalleryManagement";
import styles from "./styles/AppStyles";

// Import UI components
import ColorMenu from "./components/ColorMenu";
import GalleryView from "./components/GalleryView";
import DeleteModal from "./components/DeleteModal";
import ShareModal from "./components/ShareModal";
import InfoModal from "./components/InfoModal";
import TopControls from "./components/TopControls";
import NavigationBar from "./components/NavigationBar";

// Import version utilities
import { getVersionInfo } from "./utils/appVersion";

function AppContent() {
  const insets = useSafeAreaInsets();
  const baseSize = 32; // font size in pixels

  // Load Google Fonts
  const [fontsLoaded] = useFonts({
    Courgette_400Regular,
    PermanentMarker_400Regular,
    BlackOpsOne_400Regular,
    Quicksand_400Regular,
  });

  // Use custom hooks
  const {
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
    getCurrentBackgroundColor,
    getCurrentTextColor,
    getPalette,
    saveShadeRowAsPalette,
    customPalettes,
  } = useColorManagement();

  const {
    galleryImages,
    setGalleryImages,
    activeImageId,
    setActiveImageId,
    gallerySortMode,
    toggleGallerySortMode,
    getSortedGalleryImages,
    deleteImageFromGallery,
    toggleFavoriteImage,
  } = useGalleryManagement();

  const [text, setText] = useState("");
  const [backgroundColorIndex, setBackgroundColorIndex] = useState(2); // default yellow background
  const [textColorIndex, setTextColorIndex] = useState(4); // default blue text
  const [alignment, setAlignment] = useState(0); // 0=left, 1=center, 2=right

  const colorMenuAnimation = useRef(new Animated.Value(0)).current;
  const [fontSize, setFontSize] = useState(baseSize);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(400); // Larger default height in pixels
  const [startedWriting, setStartedWriting] = useState(false);
  const [fontFamily, setFontFamily] = useState(0); // 0=default, 1=monospace
  const [currentView, setCurrentView] = useState("create"); // 'create' or 'gallery'
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [imageToShare, setImageToShare] = useState(null);
  const [imageToInfo, setImageToInfo] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false); // 'newest', 'oldest', 'favorites', 'random'
  const [previewReturnView, setPreviewReturnView] = useState("create"); // Track which view to return to after preview
  const [isHoldingPreview, setIsHoldingPreview] = useState(false); // Track if preview button is being held
  const [isHoldingNew, setIsHoldingNew] = useState(false); // Track if new button is being held
  const [deletedText, setDeletedText] = useState(""); // Store deleted text for undo functionality
  const [showUndo, setShowUndo] = useState(false); // Track if undo option should be shown
  const [previousImageState, setPreviousImageState] = useState(null); // Store previous image state for Back functionality
  const [isInNewImageMode, setIsInNewImageMode] = useState(false); // Track if user is in new image mode
  const textInputRef = React.useRef(null);
  const textAreaRef = useRef(null);
  const captureTextRef = useRef(null);
  const measureTextRef = useRef(null);
  const previewHoldTimerRef = useRef(null);
  const newHoldTimerRef = useRef(null);

  // Calculate font size based on text length
  useEffect(() => {
    // Simple algorithm: reduce font size as text gets longer
    const minSize = 20; // font size in pixels
    const textLength = text.length;
    const shrinkStart = 300; // max length of text before font size starts shrinking

    if (text.length === 0) {
      setFontSize(baseSize);
      return;
    }

    const calculateSize = () => {
      let result = baseSize;

      if (textLength > shrinkStart) {
        result = baseSize - ((textLength - shrinkStart) / shrinkStart) * (baseSize - minSize);
      }

      return Math.round(result);
    };

    setFontSize(calculateSize());
  }, [text]);

  const cycleBackgroundColor = () => {
    setBackgroundColorIndex((prev) => (prev + 1) % COLORS.length);
    // Reset shade selection when cycling colors
    setSelectedShadeColor(null);
    setSelectedShadeType(null);
  };

  const cycleTextColor = () => {
    setTextColorIndex((prev) => (prev + 1) % COLORS.length);
    // Reset shade selection when cycling colors
    setSelectedShadeColor(null);
    setSelectedShadeType(null);
  };

  // Color menu functions
  const openColorMenu = (type) => {
    // Check if current palette is a custom shade palette
    const currentPaletteIndex =
      type === "background" ? bgColorModeSelection : textColorModeSelection;
    const currentColorMode = type === "background" ? bgColorMode : textColorMode;

    // Note: Removed automatic shade selector opening for custom palettes
    // Users should be able to access the color palette menu even when using custom palettes
    // to switch to different palettes. Shade selector should only open when explicitly
    // long-pressing individual colors, not when long-pressing the BG/Text buttons.

    // Dismiss keyboard if it's open
    Keyboard.dismiss();

    setColorMenuType(type);
    setColorMenuVisible(true);

    // Highlight the currently selected palette or variation
    if (type === "background") {
      if (bgColorMode === "palette") {
        setHighlightedRow(bgColorModeSelection);
        setHighlightedColumn(-1);
      } else {
        // variations mode
        setHighlightedRow(-1);
        setHighlightedColumn(bgColorModeSelection);
      }
    } else {
      // text
      if (textColorMode === "palette") {
        setHighlightedRow(textColorModeSelection);
        setHighlightedColumn(-1);
      } else {
        // variations mode
        setHighlightedRow(-1);
        setHighlightedColumn(textColorModeSelection);
      }
    }

    Animated.timing(colorMenuAnimation, {
      toValue: 1,
      duration: 300, // Animation duration in milliseconds
      useNativeDriver: true,
    }).start();
  };

  const closeColorMenu = () => {
    Animated.timing(colorMenuAnimation, {
      toValue: 0,
      duration: 250, // Slightly faster close animation in milliseconds
      useNativeDriver: true,
    }).start(() => {
      setColorMenuVisible(false);
      setHighlightedRow(-1);
      setHighlightedColumn(-1);
    });
  };

  const selectPalette = (paletteIndex) => {
    if (colorMenuType === "background") {
      setBgColorMode("palette");
      setBgColorModeSelection(paletteIndex);
      // Keep the same color position in the new palette
      // backgroundColorIndex stays the same
    } else {
      setTextColorMode("palette");
      setTextColorModeSelection(paletteIndex);
      // textColorIndex stays the same
    }
    setHighlightedRow(paletteIndex);
    setHighlightedColumn(-1);
    // Reset shade selection when selecting a new palette
    setSelectedShadeColor(null);
    setSelectedShadeType(null);
  };

  const selectColorVariation = (colorIndex) => {
    if (colorMenuType === "background") {
      setBgColorMode("variations");
      setBgColorModeSelection(colorIndex);
      // Choose a random palette that's different from current
      const currentPalette = backgroundColorIndex;
      let newPalette;
      do {
        newPalette = Math.floor(Math.random() * 8);
      } while (newPalette === currentPalette && ALL_COLORS.length > 1);
      setBackgroundColorIndex(newPalette);
    } else {
      setTextColorMode("variations");
      setTextColorModeSelection(colorIndex);
      // Choose a random palette that's different from current
      const currentPalette = textColorIndex;
      let newPalette;
      do {
        newPalette = Math.floor(Math.random() * 8);
      } while (newPalette === currentPalette && ALL_COLORS.length > 1);
      setTextColorIndex(newPalette);
    }
    setHighlightedColumn(colorIndex);
    setHighlightedRow(-1);
    // Reset shade selection when selecting a new color variation
    setSelectedShadeColor(null);
    setSelectedShadeType(null);
  };

  const selectDirectColor = (paletteIndex, colorIndex) => {
    if (colorMenuType === "background") {
      setBgColorMode("palette");
      setBgColorModeSelection(paletteIndex);
      setBackgroundColorIndex(colorIndex);
    } else {
      setTextColorMode("palette");
      setTextColorModeSelection(paletteIndex);
      setTextColorIndex(colorIndex);
    }
    setHighlightedRow(paletteIndex);
    setHighlightedColumn(-1);
    // Reset shade selection when selecting a new color
    setSelectedShadeColor(null);
    setSelectedShadeType(null);
    // Keep color menu open so users can explore different colors
  };

  // Shade selector functions
  const openShadeSelector = (color, colorIndex) => {
    // Save current color menu state
    setOriginalColorMenuState({
      bgColorMode,
      bgColorModeSelection,
      textColorMode,
      textColorModeSelection,
      highlightedRow,
      highlightedColumn,
    });

    // First close the regular color menu
    setColorMenuVisible(false);

    // For custom palettes (which may contain shades), we need to find the original base color
    // that corresponds to the color type
    let baseColorForShades = color;
    let actualColorIndex = colorIndex;

    // Check if we're dealing with a custom palette
    const currentPaletteIndex =
      colorMenuType === "background" ? bgColorModeSelection : textColorModeSelection;
    if (currentPaletteIndex >= ALL_COLORS.length) {
      // This is a custom palette - determine which color type this shade belongs to
      // by checking which base color produces shades that include this color
      let foundColorType = false;

      for (
        let baseColorTypeIndex = 0;
        baseColorTypeIndex < 8 && !foundColorType;
        baseColorTypeIndex++
      ) {
        // Get the representative color for this type from the first palette
        const representativeColor = ALL_COLORS[0][baseColorTypeIndex];
        const testShadeGrid = generateShadesWithExistingColors(
          representativeColor,
          baseColorTypeIndex
        );

        // Check if any shade in this grid matches or is very close to our color
        for (let row = 0; row < testShadeGrid.length; row++) {
          if (testShadeGrid[row].includes(color)) {
            // Found the matching base color type
            baseColorForShades = representativeColor;
            actualColorIndex = baseColorTypeIndex;
            foundColorType = true;
            break;
          }
        }
      }

      // If we didn't find a match, fall back to analyzing the color itself
      if (!foundColorType) {
        // Use the first palette's base colors as representatives
        baseColorForShades = ALL_COLORS[0][colorIndex] || color;
        actualColorIndex = colorIndex;
      }
    }

    // Set shade selector state with the correct base color
    setShadeMenuColor(baseColorForShades);
    setShadeMenuVisible(true);

    // Generate shades and find the row containing the long-pressed color
    const shadeGrid = generateShadesWithExistingColors(baseColorForShades, actualColorIndex);
    let targetRow = 0;

    // Find which row contains the specific color that was long-pressed
    for (let row = 0; row < shadeGrid.length; row++) {
      if (shadeGrid[row].includes(color)) {
        targetRow = row;
        break;
      }
    }

    // Only reset highlighting if we don't already have a column selected
    // (This preserves column selection when reopening the shade menu)
    if (highlightedColumn === -1) {
      // First time opening or no column was previously selected - highlight the row
      setHighlightedRow(targetRow);
      setHighlightedColumn(-1);
    }
    // If highlightedColumn !== -1, keep the existing column selection intact
  };

  const dismissShadeSelector = () => {
    // Check if a column is selected and save it before closing
    if (highlightedColumn !== -1) {
      // User selected a column - save the column of shades
      let colorIndex = -1;
      let found = false;
      // Find which color position (0-7) the shadeMenuColor represents
      for (let i = 0; i < 8 && !found; i++) {
        for (let j = 0; j < ALL_COLORS.length; j++) {
          if (ALL_COLORS[j][i] === shadeMenuColor) {
            colorIndex = i;
            found = true;
            break;
          }
        }
      }

      const shadeGrid = generateShadesWithExistingColors(shadeMenuColor, colorIndex);

      // Extract the selected column from the 8x8 grid
      const selectedColumn = [];
      for (let row = 0; row < 8; row++) {
        selectedColumn.push(shadeGrid[row][highlightedColumn]);
      }

      // Save the selected column as a new custom palette
      const newPaletteIndex = saveShadeRowAsPalette(selectedColumn);

      // Switch to the new custom palette
      if (colorMenuType === "background") {
        setBgColorMode("palette");
        setBgColorModeSelection(newPaletteIndex);
        // Use the current color from the column
        setBackgroundColorIndex(highlightedColumn);
      } else {
        setTextColorMode("palette");
        setTextColorModeSelection(newPaletteIndex);
        // Use the current color from the column
        setTextColorIndex(highlightedColumn);
      }

      // Update the current color with the shade from the selected column
      const selectedShade = selectedColumn[highlightedColumn] || selectedColumn[0];
      setSelectedShadeColor(selectedShade);
      setSelectedShadeType(colorMenuType);
    }

    // Close both shade menu and color menu, keeping the selected shade
    setShadeMenuVisible(false);
    setColorMenuVisible(false);
    // Keep highlighting and selected shade intact
  };

  const closeShadeSelector = () => {
    // Restore original color menu state (before shade selector was opened)
    setBgColorMode(originalColorMenuState.bgColorMode);
    setBgColorModeSelection(originalColorMenuState.bgColorModeSelection);
    setTextColorMode(originalColorMenuState.textColorMode);
    setTextColorModeSelection(originalColorMenuState.textColorModeSelection);

    // Keep current highlighting from any selections made in the main color menu
    // Don't restore originalColorMenuState highlighting since user may have made selections
    // The current highlightedRow/highlightedColumn should be preserved

    // Reset selected shade color
    setSelectedShadeColor(null);
    setSelectedShadeType(null);

    // Close shade selector and restore color menu
    setShadeMenuVisible(false);
    setColorMenuVisible(true);
  };

  const cycleAlignment = () => {
    setAlignment((prev) => (prev + 1) % ALIGNMENTS.length);
  };

  const cycleFontFamily = () => {
    setFontFamily((prev) => (prev + 1) % FONT_FAMILIES.length);
  };

  const currentAlignment = ALIGNMENTS[alignment];
  const currentBackgroundColor = getCurrentBackgroundColor(backgroundColorIndex);
  const currentFontFamily =
    FONT_FAMILIES[fontFamily] === "System" ? undefined : FONT_FAMILIES[fontFamily];
  const currentTextColor = getCurrentTextColor(textColorIndex);

  const sortedGalleryImages = getSortedGalleryImages();

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleTextChange = (newText) => {
    setText(newText);
    if (newText.length > 0 && !startedWriting) {
      setStartedWriting(true);
    }
    // Reset undo state when user types new text after deletion
    if (showUndo && newText.length > 0) {
      setShowUndo(false);
      setDeletedText("");
    }
  };

  const togglePreviewMode = async () => {
    try {
      if (!isPreviewMode) {
        Keyboard.dismiss();
        // Set return view to current view when entering preview
        setPreviewReturnView(currentView);
        // Calculate preview height to match export before showing preview
        if (text.length > 0) {
          try {
            // Wait a moment for keyboard to dismiss and text to render
            await new Promise((resolve) => setTimeout(resolve, 200)); // Increased delay in milliseconds
            const measuredHeight = await measureTextHeight();
            const padding = Dimensions.get("window").width * 0.1; // Padding in pixels
            const watermarkHeight = 40; // Space for watermark and margin in pixels
            const calculatedHeight = Math.max(measuredHeight + padding + watermarkHeight, 200); // Minimum height of 200 in pixels

            setPreviewHeight(calculatedHeight);
          } catch (error) {
            if (__DEV__) console.warn("Height calculation error:", error);
            setPreviewHeight(400); // Fallback height in pixels
          }
        }
      }

      setIsPreviewMode(!isPreviewMode);
    } catch (error) {
      if (__DEV__) console.error("Preview mode toggle error:", error);
      // Still toggle preview mode even if calculation fails
      setIsPreviewMode(!isPreviewMode);
    }
  };

  const exitPreviewMode = () => {
    if (isPreviewMode) {
      setIsPreviewMode(false);
      // Return to the view where preview was initiated
      setCurrentView(previewReturnView);
    }
  };

  const measureTextHeight = () => {
    return new Promise((resolve) => {
      try {
        // Try to use the measure text ref first (for preview), fallback to capture ref
        const refToUse = measureTextRef.current || captureTextRef.current;

        if (refToUse && typeof refToUse.measure === "function") {
          // Add timeout to prevent hanging
          const timeoutId = setTimeout(() => {
            resolve(200); // Fallback height in pixels
          }, 1000); // Timeout in milliseconds

          try {
            refToUse.measure((_x, _y, _width, height) => {
              clearTimeout(timeoutId);
              // Ensure we have a valid height value
              const validHeight = height && height > 0 ? height : 200;
              resolve(validHeight);
            });
          } catch (measureError) {
            clearTimeout(timeoutId);
            resolve(200); // Fallback height in pixels
          }
        } else {
          // Fallback: measure the TextInput if available
          if (textInputRef.current && typeof textInputRef.current.measure === "function") {
            const timeoutId = setTimeout(() => {
              resolve(200); // Fallback height in pixels
            }, 1000); // Timeout in milliseconds

            try {
              textInputRef.current.measure((_x, _y, _width, height) => {
                clearTimeout(timeoutId);
                const validHeight = height && height > 0 ? height : 200;
                resolve(validHeight);
              });
            } catch (measureError) {
              clearTimeout(timeoutId);
              resolve(200); // Fallback height in pixels
            }
          } else {
            resolve(200); // Fallback height in pixels
          }
        }
      } catch (error) {
        if (__DEV__) console.warn("Height measurement error:", error);
        resolve(200); // Fallback height in pixels
      }
    });
  };

  const handleShare = () => {
    if (!text.trim()) {
      Alert.alert("No Text", "Please write something before sharing.");
      return;
    }

    shareAsMessage();
  };

  const handlePreviewPressIn = () => {
    if (!text.trim()) {
      return;
    }

    setIsHoldingPreview(true);

    // Start timer for hold detection (750ms)
    previewHoldTimerRef.current = setTimeout(async () => {
      // Trigger haptic feedback when hold-to-copy is activated
      try {
        // Check if haptics is available before calling
        if (Haptics.impactAsync && typeof Haptics.impactAsync === "function") {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch (error) {
        // Haptic feedback may not be available on all devices or not properly linked
      }

      // Ensure keyboard is dismissed before capture to avoid snapshot warning
      Keyboard.dismiss();

      // Wait longer for keyboard dismissal and view settling to prevent snapshot warning
      await new Promise((resolve) => setTimeout(resolve, 500)); // Extended delay in milliseconds

      // Auto-copy to clipboard after holding for 750ms
      copyImageToClipboard();
      setIsHoldingPreview(false);
    }, 750); // Hold duration in milliseconds
  };

  const handlePreviewPressOut = () => {
    setIsHoldingPreview(false);

    // Clear the timer if button is released before hold duration
    if (previewHoldTimerRef.current) {
      clearTimeout(previewHoldTimerRef.current);
      previewHoldTimerRef.current = null;
    }
  };

  const handleNewPressIn = () => {
    if (!text.trim()) {
      return;
    }

    setIsHoldingNew(true);

    // Start timer for hold detection (750ms)
    newHoldTimerRef.current = setTimeout(async () => {
      // Trigger haptic feedback when hold-to-delete is activated
      try {
        // Check if haptics is available before calling
        if (Haptics.impactAsync && typeof Haptics.impactAsync === "function") {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch (error) {
        // Haptic feedback may not be available on all devices or not properly linked
      }

      // Store current text for undo and clear it
      setDeletedText(text);
      setText("");
      setShowUndo(true);
      setIsHoldingNew(false);
    }, 750); // Hold duration in milliseconds
  };

  const handleNewPressOut = () => {
    setIsHoldingNew(false);

    // Clear the timer if button is released before hold duration
    if (newHoldTimerRef.current) {
      clearTimeout(newHoldTimerRef.current);
      newHoldTimerRef.current = null;
    }
  };

  const handleUndo = () => {
    // Restore the deleted text
    setText(deletedText);
    setDeletedText("");
    setShowUndo(false);
  };

  const createNewImage = async (uri, galleryDir) => {
    // Create permanent file
    const existingFilenames = galleryImages.map((img) => img.filename);
    const filename = generateFilename(text, existingFilenames);
    const permanentPath = galleryDir + filename;
    const timestamp = Date.now();

    await FileSystem.copyAsync({
      from: uri,
      to: permanentPath,
    });

    // Save metadata
    const versionInfo = getVersionInfo();

    // Get the complete palettes that were used for this image
    const backgroundPalette = getPalette(bgColorModeSelection);
    const textPalette = getPalette(textColorModeSelection);

    const metadata = {
      id: timestamp,
      filename,
      path: permanentPath,
      text: text, // Full text content
      backgroundColor: currentBackgroundColor, // Use actual current color (including shades)
      backgroundPalette: backgroundPalette, // Complete palette array used for background
      textColor: currentTextColor, // Use actual current color (including shades)
      textPalette: textPalette, // Complete palette array used for text
      alignment,
      fontFamily: FONT_FAMILIES[fontFamily], // Store font family name instead of index
      fontSize,
      previewHeight,
      isFavorited: false,
      createdAt: new Date().toISOString(),
      appVersion: versionInfo.appVersion, // App version that created this image
      buildNumber: versionInfo.buildNumber, // Build number that created this image
      os: "ios", // Operating system platform
    };

    // Update gallery list - add new images at the beginning so newest appears first
    const newGalleryImages = [metadata, ...galleryImages];
    setGalleryImages(newGalleryImages);

    // Set this image as the currently active one for live thumbnail updates
    setActiveImageId(metadata.id);

    // Save to FileSystem
    const galleryMetadataPath = FileSystem.documentDirectory + "gallery/metadata.json";
    await FileSystem.writeAsStringAsync(galleryMetadataPath, JSON.stringify(newGalleryImages));

    return true;
  };

  const saveToGallery = async () => {
    try {
      if (!text.trim()) return true; // Nothing to save, consider it successful

      // Capture ref should always be available now, but add safety check
      if (!captureTextRef.current) {
        if (__DEV__) {
          console.error("Capture ref unexpectedly not available");
        }
        Alert.alert("Error", "Text rendering not ready. Please try again in a moment.");
        return false;
      }

      const galleryDir = FileSystem.documentDirectory + "gallery/";
      await FileSystem.makeDirectoryAsync(galleryDir, { intermediates: true });

      // Capture image
      const uri = await captureRef(captureTextRef.current, {
        format: "jpg",
        quality: 1.0,
        result: "tmpfile",
      });

      let newGalleryImages;
      let imageId;

      if (activeImageId) {
        // Update existing image
        const existingImageIndex = galleryImages.findIndex((img) => img.id === activeImageId);
        if (existingImageIndex !== -1) {
          const existingImage = galleryImages[existingImageIndex];

          // Delete old image file
          try {
            const fileInfo = await FileSystem.getInfoAsync(existingImage.path);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(existingImage.path);
            }
          } catch (deleteError) {
            if (__DEV__) console.warn("Could not delete old image file:", deleteError);
          }

          // Create new file with meaningful filename
          const existingFilenames = galleryImages.map((img) => img.filename);
          const filename = generateFilename(text, existingFilenames);
          const permanentPath = galleryDir + filename;
          const timestamp = Date.now();

          await FileSystem.copyAsync({
            from: uri,
            to: permanentPath,
          });

          // Check if content has actually changed
          const contentChanged =
            existingImage.text !== text ||
            existingImage.backgroundColor !== currentBackgroundColor ||
            existingImage.textColor !== currentTextColor ||
            existingImage.alignment !== alignment ||
            existingImage.fontFamily !== FONT_FAMILIES[fontFamily] ||
            existingImage.fontSize !== fontSize;

          // Update metadata with new timestamp and current date only if content changed
          const versionInfo = getVersionInfo();

          // Get the complete palettes that are being used for this image
          const backgroundPalette = getPalette(bgColorModeSelection);
          const textPalette = getPalette(textColorModeSelection);

          const updatedMetadata = {
            ...existingImage,
            filename,
            path: permanentPath,
            text: text, // Full text content
            backgroundColor: currentBackgroundColor, // Use actual current color (including shades)
            backgroundPalette: backgroundPalette, // Complete palette array used for background
            textColor: currentTextColor, // Use actual current color (including shades)
            textPalette: textPalette, // Complete palette array used for text
            alignment,
            fontFamily: FONT_FAMILIES[fontFamily], // Store font family name instead of index
            fontSize,
            previewHeight,
            isFavorited: existingImage.isFavorited || false, // Preserve favorite status
            createdAt: contentChanged ? new Date().toISOString() : existingImage.createdAt, // Only update date if content changed
            appVersion: versionInfo.appVersion, // App version that last edited this image
            buildNumber: versionInfo.buildNumber, // Build number that last edited this image
            os: existingImage.os || "ios", // Preserve existing OS or default to ios
          };

          // Replace the existing image in the array
          newGalleryImages = [...galleryImages];
          newGalleryImages[existingImageIndex] = updatedMetadata;
          imageId = activeImageId;
        } else {
          // activeImageId doesn't exist in gallery, treat as new image
          return await createNewImage(uri, galleryDir);
        }
      } else {
        // Create new image
        return await createNewImage(uri, galleryDir);
      }

      // Force a fresh array reference to ensure React detects the change
      setGalleryImages([...newGalleryImages]);
      setActiveImageId(imageId);

      // Save to FileSystem
      const galleryMetadataPath = FileSystem.documentDirectory + "gallery/metadata.json";
      await FileSystem.writeAsStringAsync(galleryMetadataPath, JSON.stringify(newGalleryImages));

      return true;
    } catch (error) {
      if (__DEV__) console.error("Failed to save to gallery:", error);
      return false;
    }
  };

  const restoreImageFromGallery = (imageData) => {
    // First, reset all state to defaults to prevent flash of previous content
    setText("");
    setBackgroundColorIndex(5); // default background
    setTextColorIndex(3); // default text color
    setAlignment(0); // default alignment
    setFontFamily(0); // default font
    setStartedWriting(false);
    setActiveImageId(null);
    setIsInNewImageMode(false); // Reset new image mode when restoring from gallery
    setPreviousImageState(null); // Clear any previous image state

    // Reset color management state to ensure proper color resolution
    setBgColorMode("palette");
    setBgColorModeSelection(0); // Use first palette as default
    setTextColorMode("palette");
    setTextColorModeSelection(0); // Use first palette as default
    setSelectedShadeColor(null); // Clear any shade selections initially
    setSelectedShadeType(null);

    // If the image has saved palette data, try to restore the exact palette context
    // For now, we'll use the saved hex colors and indices for backward compatibility
    // The palette arrays provide context but don't need to be actively restored
    // since the hex colors ensure perfect visual reproduction

    // Switch to create view with clean state
    setCurrentView("create");

    // Now restore the actual image data after the clean state is rendered
    setTimeout(() => {
      setText(imageData.text);

      // Calculate color indices from the saved palettes and hex colors
      let bgColorIndex = 0;
      let textColorIndex = 0;

      if (imageData.backgroundPalette && imageData.backgroundColor) {
        const bgIndex = imageData.backgroundPalette.indexOf(imageData.backgroundColor);
        if (bgIndex !== -1) {
          bgColorIndex = bgIndex;
        }
      }

      if (imageData.textPalette && imageData.textColor) {
        const textIndex = imageData.textPalette.indexOf(imageData.textColor);
        if (textIndex !== -1) {
          textColorIndex = textIndex;
        }
      }

      // Fall back to saved indices for backward compatibility with older images
      if (imageData.backgroundColorIndex !== undefined && bgColorIndex === 0) {
        bgColorIndex = imageData.backgroundColorIndex;
      }
      if (imageData.textColorIndex !== undefined && textColorIndex === 0) {
        textColorIndex = imageData.textColorIndex;
      }

      // Calculate font family index from the saved font family name
      let fontFamilyIndex = 0;
      if (typeof imageData.fontFamily === "string") {
        // New format: fontFamily is stored as string
        const fontIndex = FONT_FAMILIES.indexOf(imageData.fontFamily);
        if (fontIndex !== -1) {
          fontFamilyIndex = fontIndex;
        }
      } else if (typeof imageData.fontFamily === "number") {
        // Legacy format: fontFamily is stored as index (backward compatibility)
        fontFamilyIndex = imageData.fontFamily;
      }

      // Check if the saved colors are shade colors (not in the saved palettes)
      let needsShadeRestoration = false;
      let shadeColorToRestore = null;
      let shadeTypeToRestore = null;

      // Check background color
      if (imageData.backgroundPalette && imageData.backgroundColor) {
        const bgFoundInPalette = imageData.backgroundPalette.includes(imageData.backgroundColor);
        if (!bgFoundInPalette) {
          // Background color is a shade color, not in the palette
          needsShadeRestoration = true;
          shadeColorToRestore = imageData.backgroundColor;
          shadeTypeToRestore = "background";
        }
      }

      // Check text color (only if background wasn't already identified as shade)
      if (!needsShadeRestoration && imageData.textPalette && imageData.textColor) {
        const textFoundInPalette = imageData.textPalette.includes(imageData.textColor);
        if (!textFoundInPalette) {
          // Text color is a shade color, not in the palette
          needsShadeRestoration = true;
          shadeColorToRestore = imageData.textColor;
          shadeTypeToRestore = "text";
        }
      }

      // Restore shade color state if needed
      if (needsShadeRestoration) {
        setSelectedShadeColor(shadeColorToRestore);
        setSelectedShadeType(shadeTypeToRestore);
      }

      setBackgroundColorIndex(bgColorIndex);
      setTextColorIndex(textColorIndex);
      setAlignment(imageData.alignment);
      setFontFamily(fontFamilyIndex);
      setPreviewHeight(imageData.previewHeight);
      setStartedWriting(true);
      setActiveImageId(imageData.id);
      setIsTransitioning(false); // Clear transitioning state once fully loaded
    }, 50); // Small delay to ensure clean state renders first
  };

  const handleImageSelection = async (imageData) => {
    // Dismiss keyboard first to prevent keyboard queue issues
    Keyboard.dismiss();

    // Set transitioning state to hide content during switch
    setIsTransitioning(true);

    // Wait for keyboard to dismiss before proceeding
    await new Promise((resolve) => setTimeout(resolve, 100)); // Short delay in milliseconds

    // Check if we need to save current work
    const needsToSave =
      text.trim() &&
      ((activeImageId && activeImageId !== imageData.id) || // editing different image
        !activeImageId); // new unsaved work

    if (needsToSave) {
      // Auto-save current work before switching
      const saved = await saveToGallery();

      if (!saved) {
        // If save failed, show error and don't switch
        Alert.alert(
          "Error",
          "Failed to save current work before switching images. Please try again."
        );
        setIsTransitioning(false);
        return;
      }
    }

    // Now restore the selected image (this will switch to create view with the right content)
    restoreImageFromGallery(imageData);
    setIsTransitioning(false);
  };

  const handleGalleryView = async () => {
    // Dismiss keyboard before switching views
    Keyboard.dismiss();

    // Auto-save current work if there's text (both new images and existing edits)
    if (text.trim()) {
      const saved = await saveToGallery();
      if (!saved) {
        // If save failed, don't switch to gallery
        Alert.alert("Error", "Failed to save image before switching to gallery.");
        return;
      }
    }
    setCurrentView("gallery");
  };

  const handleEditView = () => {
    // Dismiss keyboard before switching views
    Keyboard.dismiss();

    // If there's an active image, restore it for editing
    if (activeImageId) {
      const activeImage = galleryImages.find((img) => img.id === activeImageId);
      if (activeImage) {
        restoreImageFromGallery(activeImage);
        return; // restoreImageFromGallery already switches to create view
      }
    }

    // If no active image, create a new blank image
    setText("");
    setBackgroundColorIndex(5); // default yellow background
    setTextColorIndex(3); // default blue text
    setAlignment(0); // left alignment
    setFontFamily(0); // default font
    setFontSize(baseSize);
    setPreviewHeight(400); // default height in pixels
    setStartedWriting(false);
    setIsPreviewMode(false);
    setActiveImageId(null);
    setIsInNewImageMode(false); // Reset new image mode when going to edit view
    setPreviousImageState(null); // Clear any previous image state
    setCurrentView("create");
  };

  const handleNewImage = async () => {
    // Store current image state before creating new image
    setPreviousImageState({
      text,
      backgroundColorIndex,
      textColorIndex,
      alignment,
      fontFamily,
      fontSize,
      previewHeight,
      activeImageId,
    });

    const saved = await saveToGallery();
    if (saved) {
      // Reset to blank state
      setText("");
      setBackgroundColorIndex(5); // default yellow background
      setTextColorIndex(3); // default blue text
      setAlignment(0); // left alignment
      setFontFamily(0); // default font
      setFontSize(baseSize);
      setPreviewHeight(400); // default height in pixels
      setStartedWriting(false);
      setIsPreviewMode(false);
      setActiveImageId(null); // Clear active image tracking
      setIsInNewImageMode(true); // Set new image mode flag
    }
  };

  const handleBackImage = () => {
    if (previousImageState) {
      // Restore previous image state
      setText(previousImageState.text);
      setBackgroundColorIndex(previousImageState.backgroundColorIndex);
      setTextColorIndex(previousImageState.textColorIndex);
      setAlignment(previousImageState.alignment);
      setFontFamily(previousImageState.fontFamily);
      setFontSize(previousImageState.fontSize);
      setPreviewHeight(previousImageState.previewHeight);
      setActiveImageId(previousImageState.activeImageId);
      setStartedWriting(previousImageState.text.length > 0);
      setIsInNewImageMode(false); // Exit new image mode
      setPreviousImageState(null); // Clear stored state
    }
  };

  const confirmDelete = (image) => {
    setImageToDelete(image);
    setDeleteModalVisible(true);
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setImageToDelete(null);
  };

  const duplicateImageInGallery = async (imageId) => {
    try {
      // Find the image to duplicate
      const imageToDuplicate = galleryImages.find((img) => img.id === imageId);
      if (!imageToDuplicate) return;

      // Create new metadata with meaningful filename
      const existingFilenames = galleryImages.map((img) => img.filename);
      const filename = generateFilename(imageToDuplicate.text, existingFilenames);
      const galleryDir = FileSystem.documentDirectory + "gallery/";
      const permanentPath = galleryDir + filename;
      const timestamp = Date.now();

      // Copy the image file
      const fileInfo = await FileSystem.getInfoAsync(imageToDuplicate.path);
      if (fileInfo.exists) {
        await FileSystem.copyAsync({
          from: imageToDuplicate.path,
          to: permanentPath,
        });
      } else {
        throw new Error("Original image file not found");
      }

      // Create new metadata with all the same properties but new timestamp and current date
      const duplicatedMetadata = {
        ...imageToDuplicate,
        id: timestamp,
        filename,
        path: permanentPath,
        isFavorited: false, // New duplicates start unfavorited
        createdAt: new Date().toISOString(), // Set to current date and time
      };

      // Add to gallery list at the beginning (newest first)
      const newGalleryImages = [duplicatedMetadata, ...galleryImages];
      setGalleryImages(newGalleryImages);

      // Save updated list to FileSystem
      const galleryMetadataPath = FileSystem.documentDirectory + "gallery/metadata.json";
      await FileSystem.writeAsStringAsync(galleryMetadataPath, JSON.stringify(newGalleryImages));

      Alert.alert("Success", "Image duplicated successfully!");
    } catch (error) {
      if (__DEV__) console.error("Failed to duplicate image:", error);
      Alert.alert("Error", "Failed to duplicate image.");
    }
  };

  const copyImageFromGallery = async (imageId) => {
    try {
      const image = galleryImages.find((img) => img.id === imageId);
      if (!image) return;

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(image.path);
      if (!fileInfo.exists) {
        Alert.alert("Error", "Image file not found.");
        return;
      }

      // Use the same approach as the working copyImageToClipboard function
      // Guard against extremely large images (≈5 MB is practical ceiling for UIPasteboard)
      const maxBytes = 5 * 1024 * 1024; // 5 MB in bytes

      if (fileInfo?.size && fileInfo.size > maxBytes) {
        if (__DEV__)
          console.warn(
            `Image size ${fileInfo.size} B exceeds pasteboard limit, falling back to text.`
          );
        await Clipboard.setStringAsync(image.text);
        Alert.alert("Text Copied", "Image too large; copied text instead.");
        return;
      }

      try {
        // Convert image file to base64 for clipboard (same as working function)
        const base64Image = await FileSystem.readAsStringAsync(image.path, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Use the working approach from copyImageToClipboard - no data URI prefix needed
        await Clipboard.setImageAsync(base64Image);
        Alert.alert("Success", "Image copied to clipboard!");
      } catch (imageError) {
        if (__DEV__) console.warn("Image copy failed, copying text instead:", imageError);

        // Fallback: copy just the text content
        await Clipboard.setStringAsync(image.text);
        Alert.alert(
          "Text Copied",
          `Image copy failed: ${imageError.message || imageError.toString()}. Text copied instead.`
        );
      }
    } catch (error) {
      if (__DEV__) console.error("Error copying:", error);
      Alert.alert("Error", "Failed to copy to clipboard.");
    }
  };

  const showShareModal = (image) => {
    setImageToShare(image);
    setShareModalVisible(true);
  };

  const closeShareModal = () => {
    setShareModalVisible(false);
    setImageToShare(null);
  };

  const showInfoModal = (image) => {
    setImageToInfo(image);
    setInfoModalVisible(true);
  };

  const closeInfoModal = () => {
    setInfoModalVisible(false);
    setImageToInfo(null);
  };

  const handleShareFromPreview = async () => {
    try {
      const uri = await captureRef(captureTextRef, {
        format: "jpg",
        quality: 1.0,
      });

      if (await Sharing.isAvailableAsync()) {
        // Save the captured image with meaningful filename
        const existingFilenames = galleryImages.map((img) => img.filename);
        const shareUri = await saveImageForSharing(uri, text, existingFilenames);

        await Sharing.shareAsync(shareUri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share your text image",
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to share image.");
    }
  };

  const previewImageFromGallery = async (image) => {
    try {
      // Set transitioning state to hide content during switch
      setIsTransitioning(true);

      // Set return view to gallery since preview was initiated from gallery
      setPreviewReturnView("gallery");

      // Use the fixed restoreImageFromGallery function to properly restore all state
      restoreImageFromGallery(image);

      // Switch to preview mode after restoration
      setTimeout(() => {
        setIsPreviewMode(true);
        setIsTransitioning(false);

        // Calculate proper preview height after state is set
        setTimeout(async () => {
          try {
            if (image.text.length > 0) {
              // Wait a moment for text to render
              await new Promise((resolve) => setTimeout(resolve, 200)); // Delay in milliseconds
              const measuredHeight = await measureTextHeight();
              const padding = Dimensions.get("window").width * 0.1; // Padding in pixels
              const watermarkHeight = 40; // Space for watermark and margin in pixels
              const calculatedHeight = Math.max(measuredHeight + padding + watermarkHeight, 200); // Minimum height of 200 in pixels

              setPreviewHeight(calculatedHeight);
            }
          } catch (error) {
            if (__DEV__) console.error("Preview height calculation error:", error);
            // Continue with existing preview height
          }
        }, 100); // Small delay for height calculation
      }, 100); // Wait for restoreImageFromGallery to complete
    } catch (error) {
      if (__DEV__) console.error("Failed to preview image:", error);
      setIsTransitioning(false);
      Alert.alert("Error", "Failed to preview image.");
    }
  };

  const showImageActionSheet = (image) => {
    // Dismiss keyboard before showing action sheet to prevent UI warnings
    Keyboard.dismiss();

    const favoriteOption = image.isFavorited ? "Unfavorite" : "Favorite";

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [
          "Preview",
          favoriteOption,
          "Copy",
          "Duplicate",
          "Share",
          "Info",
          "Delete",
          "Cancel",
        ],
        destructiveButtonIndex: 6, // Delete option
        cancelButtonIndex: 7,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0: // Preview
            previewImageFromGallery(image);
            break;
          case 1: // Favorite/Unfavorite
            toggleFavoriteImage(image.id);
            break;
          case 2: // Copy
            copyImageFromGallery(image.id);
            break;
          case 3: // Duplicate
            duplicateImageInGallery(image.id);
            break;
          case 4: // Share
            showShareModal(image);
            break;
          case 5: // Info
            showInfoModal(image);
            break;
          case 6: // Delete
            confirmDelete(image);
            break;
          default:
            // Cancel - do nothing
            break;
        }
      }
    );
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (previewHoldTimerRef.current) {
        clearTimeout(previewHoldTimerRef.current);
      }
      if (newHoldTimerRef.current) {
        clearTimeout(newHoldTimerRef.current);
      }
    };
  }, []);

  const copyImageToClipboard = async () => {
    try {
      if (!text.trim()) {
        Alert.alert("No Text", "Please write something before copying.");
        return;
      }

      if (!captureTextRef.current) {
        Alert.alert("Error", "Text rendering not ready. Please try again.");
        return;
      }

      setIsCapturing(true);

      // Dismiss keyboard and wait for UI to settle
      Keyboard.dismiss();
      await new Promise((resolve) => setTimeout(resolve, 300)); // Delay in milliseconds

      try {
        const uri = await captureRef(captureTextRef.current, {
          format: "png",
          quality: 1.0,
          result: "tmpfile",
          afterScreenUpdates: true, // Ensures view is fully rendered before capture
        });

        // Guard against extremely large images (≈10 MB is a practical ceiling for UIPasteboard)
        const info = await FileSystem.getInfoAsync(uri, { size: true });
        const maxBytes = 10 * 1024 * 1024; // 10 MB in bytes

        if (info?.size && info.size > maxBytes) {
          if (__DEV__)
            console.warn(
              `Image size ${info.size} B exceeds pasteboard limit, falling back to text.`
            );

          await Clipboard.setStringAsync(text);

          Alert.alert("Text Copied", "Image too large; copied text instead.");
          return;
        }

        // Convert image file to base64 for clipboard
        const base64Image = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Attempt to set the image on the clipboard (no data URI prefix needed)
        await Clipboard.setImageAsync(base64Image);

        Alert.alert("Success", "Image copied to clipboard!");
      } catch (imageError) {
        if (__DEV__) console.warn("Image copy failed, copying text instead:", imageError);

        // Fallback: copy just the text content
        await Clipboard.setStringAsync(text);
        Alert.alert(
          "Text Copied",
          `Image copy failed: ${imageError.message || imageError.toString()}. Text copied instead.`
        );
      }
    } catch (error) {
      if (__DEV__) console.error("Error copying:", error);
      Alert.alert("Error", "Failed to copy to clipboard.");
    } finally {
      setIsCapturing(false);
    }
  };

  const saveToPhotos = async () => {
    try {
      if (!text.trim()) {
        Alert.alert("No Text", "Please write something before saving.");
        return;
      }

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library permissions to save images."
        );
        return;
      }

      // Dismiss keyboard for clean capture
      Keyboard.dismiss();

      // Use a proper async function instead of mixing setTimeout with async/await
      const performCapture = async () => {
        try {
          setIsCapturing(true);

          // The capture ref should always be available now since it's always rendered

          // Wait a bit for the capture text to render
          await new Promise((resolve) => setTimeout(resolve, 100)); // Reduced delay in milliseconds

          const measuredHeight = await measureTextHeight();
          const padding = Dimensions.get("window").width * 0.1; // Padding in pixels
          const watermarkHeight = 40; // Space for watermark and margin in pixels
          const captureHeight = Math.max(measuredHeight + padding + watermarkHeight, 200); // Minimum height of 200 in pixels

          if (!captureTextRef.current) {
            throw new Error("Capture reference is not available");
          }

          if (!captureTextRef.current) {
            throw new Error("Capture reference is not available");
          }

          const uri = await captureRef(captureTextRef.current, {
            format: "jpg",
            quality: 1.0,
            result: "tmpfile",
            height: captureHeight,
          });

          if (!uri) {
            throw new Error("Failed to generate image");
          }

          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert("Success", "Image saved to Photos!");
        } catch (error) {
          if (__DEV__) console.error("Capture error details:", error);
          Alert.alert("Error", `Failed to save image: ${error.message || "Unknown error"}`);
        } finally {
          setIsCapturing(false);
        }
      };

      // Wait for keyboard to dismiss and UI to settle before capturing
      setTimeout(performCapture, 1000); // Delay in milliseconds
    } catch (error) {
      if (__DEV__) console.error("Permission error:", error);
      Alert.alert("Error", "Failed to request permissions.");
      setIsCapturing(false);
    }
  };

  const shareAsMessage = async () => {
    try {
      if (!text.trim()) {
        Alert.alert("No Text", "Please enter some text before sharing.");
        return;
      }

      // Dismiss keyboard for clean capture
      Keyboard.dismiss();

      // Use a proper async function instead of mixing setTimeout with async/await
      const performShare = async () => {
        try {
          setIsCapturing(true);

          // The capture ref should always be available now since it's always rendered

          // Wait a bit for the capture text to render
          await new Promise((resolve) => setTimeout(resolve, 100)); // Reduced delay in milliseconds

          const measuredHeight = await measureTextHeight();
          const padding = Dimensions.get("window").width * 0.1; // Padding in pixels
          const watermarkHeight = 40; // Space for watermark and margin in pixels
          const captureHeight = Math.max(measuredHeight + padding + watermarkHeight, 200); // Minimum height of 200 in pixels

          if (!captureTextRef.current) {
            throw new Error("Capture reference is not available");
          }

          const uri = await captureRef(captureTextRef.current, {
            format: "jpg",
            quality: 1.0,
            result: "tmpfile",
            height: captureHeight,
          });

          if (await Sharing.isAvailableAsync()) {
            // Save the captured image with meaningful filename
            const existingFilenames = galleryImages.map((img) => img.filename);
            const shareUri = await saveImageForSharing(uri, text, existingFilenames);

            await Sharing.shareAsync(shareUri, {
              mimeType: "image/jpeg",
              dialogTitle: "Share your text image",
            });
          } else {
            Alert.alert("Error", "Sharing is not available on this device.");
          }
        } catch (error) {
          if (__DEV__) console.error("Share error:", error);
          Alert.alert("Error", `Failed to share image: ${error.message}`);
        } finally {
          setIsCapturing(false);
        }
      };

      // Wait for keyboard to dismiss and UI to settle before sharing
      setTimeout(performShare, 300); // Reduced delay in milliseconds
    } catch (error) {
      if (__DEV__) console.error("Share error:", error);
      Alert.alert("Error", "Failed to share image.");
    }
  };

  // Wait for fonts to load
  if (!fontsLoaded) {
    return null; // or a loading screen
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.flex}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            {/* Always-available hidden capture container for saving */}
            <View
              style={[
                styles.textContainer,
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0,
                  pointerEvents: "none",
                  zIndex: -1000,
                  backgroundColor: currentBackgroundColor,
                },
              ]}
              collapsable={false}
            >
              <View
                ref={captureTextRef}
                style={[
                  styles.captureContainer,
                  {
                    backgroundColor: currentBackgroundColor,
                    opacity: 1,
                    pointerEvents: "none",
                  },
                ]}
                collapsable={false}
              >
                <Text
                  style={[
                    styles.captureText,
                    {
                      color: currentTextColor,
                      fontSize: fontSize,
                      textAlign: currentAlignment,
                      fontFamily: currentFontFamily,
                    },
                  ]}
                >
                  {text}
                </Text>
                <Text
                  style={[
                    styles.watermark,
                    {
                      color: currentTextColor,
                    },
                  ]}
                >
                  made with Hey Hannah
                </Text>
              </View>
            </View>

            {/* Navigation elements */}
            {!isPreviewMode && (
              <NavigationBar
                currentView={currentView}
                insets={insets}
                startedWriting={startedWriting}
                text={text}
                showUndo={showUndo}
                activeImageId={activeImageId}
                gallerySortMode={gallerySortMode}
                isHoldingNew={isHoldingNew}
                isInNewImageMode={isInNewImageMode}
                onGalleryView={handleGalleryView}
                onNewImage={handleNewImage}
                onNewPressIn={handleNewPressIn}
                onNewPressOut={handleNewPressOut}
                onUndo={handleUndo}
                onBackImage={handleBackImage}
                onToggleGallerySortMode={toggleGallerySortMode}
                onEditView={handleEditView}
              />
            )}

            {/* Controls at top */}
            {!isPreviewMode && currentView === "create" && (
              <TopControls
                currentBackgroundColor={currentBackgroundColor}
                currentTextColor={currentTextColor}
                currentAlignment={currentAlignment}
                isHoldingPreview={isHoldingPreview}
                onCycleBackgroundColor={cycleBackgroundColor}
                onOpenBackgroundColorMenu={() => openColorMenu("background")}
                onCycleTextColor={cycleTextColor}
                onOpenTextColorMenu={() => openColorMenu("text")}
                onCycleFontFamily={cycleFontFamily}
                onCycleAlignment={cycleAlignment}
                onTogglePreview={togglePreviewMode}
                onPreviewPressIn={handlePreviewPressIn}
                onPreviewPressOut={handlePreviewPressOut}
                onShare={handleShare}
              />
            )}

            {/* Main content area */}
            {currentView === "create" ? (
              isTransitioning ? (
                <View style={[styles.textContainer, { backgroundColor: "#000000" }]}>
                  {/* Blank state during transition to prevent flash */}
                </View>
              ) : (
                <TouchableWithoutFeedback onPress={isPreviewMode ? exitPreviewMode : undefined}>
                  <View
                    ref={textAreaRef}
                    style={[
                      styles.textContainer,
                      {
                        backgroundColor: isPreviewMode ? "#000000" : currentBackgroundColor,
                      },
                    ]}
                    collapsable={false}
                  >
                    {/* Hidden text for capture - always rendered but invisible when not capturing */}
                    <View
                      style={[
                        styles.captureContainer,
                        {
                          backgroundColor: currentBackgroundColor,
                          opacity: isCapturing && text.length > 0 ? 1 : 0,
                          pointerEvents: "none",
                        },
                      ]}
                      collapsable={false}
                    >
                      <Text
                        style={[
                          styles.captureText,
                          {
                            color: currentTextColor,
                            fontSize: fontSize,
                            textAlign: currentAlignment,
                            fontFamily: currentFontFamily,
                          },
                        ]}
                      >
                        {text}
                      </Text>
                      <Text
                        style={[
                          styles.watermark,
                          {
                            color: currentTextColor,
                          },
                        ]}
                      >
                        made with Hey Hannah
                      </Text>
                    </View>

                    {!startedWriting ? (
                      <Text
                        style={[
                          styles.placeholderText,
                          {
                            color: currentTextColor,
                            fontSize: fontSize,
                            textAlign: currentAlignment,
                            fontFamily: currentFontFamily,
                            opacity: 0.6, // 60% opacity
                          },
                        ]}
                      ></Text>
                    ) : null}

                    {/* Invisible text for measurement - always rendered */}
                    <Text
                      ref={measureTextRef}
                      style={[
                        styles.measureText,
                        {
                          color: currentTextColor,
                          fontSize: fontSize,
                          textAlign: currentAlignment,
                          fontFamily: currentFontFamily,
                        },
                      ]}
                    >
                      {text}
                    </Text>

                    {/* TextInput for user interaction - hidden during capture and preview */}
                    {!isPreviewMode && (
                      <TextInput
                        ref={textInputRef}
                        style={[
                          styles.textInput,
                          {
                            color: isCapturing ? "transparent" : currentTextColor,
                            fontSize: fontSize,
                            textAlign: currentAlignment,
                            fontFamily: currentFontFamily,
                          },
                        ]}
                        value={text}
                        onChangeText={handleTextChange}
                        placeholder="Say something..."
                        multiline
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        textAlignVertical="top"
                      />
                    )}
                  </View>
                </TouchableWithoutFeedback>
              )
            ) : (
              /* Gallery view */
              <GalleryView
                sortedGalleryImages={sortedGalleryImages}
                onImageSelection={handleImageSelection}
                onImageActionSheet={showImageActionSheet}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Preview overlay - rendered outside main layout */}
      {isPreviewMode && (
        <TouchableWithoutFeedback onPress={exitPreviewMode}>
          <View style={styles.previewOverlay}>
            <View style={styles.previewOverlayBackground} />

            {/* Preview header with conditional buttons based on preview source */}
            <View style={styles.previewHeader}>
              {previewReturnView === "gallery" ? (
                // Gallery preview: GALLERY, EDIT buttons on left, SHARE on right
                <>
                  <View style={styles.previewLeftButtons}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        exitPreviewMode(); // This will return to gallery
                      }}
                    >
                      <View style={[styles.shareIcon, { borderColor: "#FFFFFF" }]}>
                        <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>📁</Text>
                      </View>
                      <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>GALLERY</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        // Exit preview and go to edit view for this image
                        setIsPreviewMode(false);
                        setCurrentView("create");
                        setPreviewReturnView("create");
                      }}
                    >
                      <View style={[styles.shareIcon, { borderColor: "#FFFFFF" }]}>
                        <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>🖋</Text>
                      </View>
                      <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>EDIT</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleShareFromPreview();
                    }}
                  >
                    <View style={[styles.shareIcon, { borderColor: "#FFFFFF" }]}>
                      <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>↗</Text>
                    </View>
                    <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>SHARE</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Create view preview: EDIT on left, SHARE on right
                <>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      exitPreviewMode();
                    }}
                  >
                    <View style={[styles.shareIcon, { borderColor: "#FFFFFF" }]}>
                      <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>🖋</Text>
                    </View>
                    <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>EDIT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleShareFromPreview();
                    }}
                  >
                    <View style={[styles.shareIcon, { borderColor: "#FFFFFF" }]}>
                      <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>↗</Text>
                    </View>
                    <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>SHARE</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {text.length > 0 ? (
              <ScrollView
                style={[
                  styles.previewScrollContainer,
                  {
                    flex: 1,
                  },
                ]}
                contentContainerStyle={[
                  styles.previewCenterContainer,
                  {
                    minHeight: Dimensions.get("window").height - 120, // Available height below buttons
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 120, // Space for header buttons and labels in pixels
                    paddingBottom: 0, // No bottom padding needed
                  },
                ]}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={[
                    styles.previewContainerOverlay,
                    {
                      backgroundColor: currentBackgroundColor,
                      height: previewHeight, // Use actual calculated height to match saved image
                      width: Dimensions.get("window").width,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.previewText,
                      {
                        color: currentTextColor,
                        fontSize: fontSize,
                        textAlign: currentAlignment,
                        fontFamily: currentFontFamily,
                      },
                    ]}
                  >
                    {text}
                  </Text>
                  <Text
                    style={[
                      styles.watermark,
                      {
                        color: currentTextColor,
                      },
                    ]}
                  >
                    made with Hey Hannah
                  </Text>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.emptyPreviewContainer}>
                <Text style={styles.emptyPreviewText}>
                  nothing written yet -- touch anywhere to exit preview mode
                </Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Delete confirmation modal */}
      <DeleteModal
        visible={deleteModalVisible}
        imageToDelete={imageToDelete}
        onConfirm={deleteImageFromGallery}
        onCancel={cancelDelete}
      />

      {/* Share modal */}
      <ShareModal
        visible={shareModalVisible}
        imageToShare={imageToShare}
        galleryImages={galleryImages}
        captureTextRef={captureTextRef}
        onClose={closeShareModal}
        onCopyImage={copyImageFromGallery}
        restoreImageFromGallery={restoreImageFromGallery}
      />

      {/* Info modal */}
      <InfoModal visible={infoModalVisible} imageToInfo={imageToInfo} onClose={closeInfoModal} />

      {/* Color selection menu */}
      <ColorMenu
        colorMenuVisible={colorMenuVisible}
        shadeMenuVisible={shadeMenuVisible}
        colorMenuAnimation={colorMenuAnimation}
        colorMenuType={colorMenuType}
        shadeMenuColor={shadeMenuColor}
        highlightedRow={highlightedRow}
        highlightedColumn={highlightedColumn}
        bgColorMode={bgColorMode}
        bgColorModeSelection={bgColorModeSelection}
        textColorMode={textColorMode}
        textColorModeSelection={textColorModeSelection}
        onClose={closeColorMenu}
        onCloseShadeSelector={closeShadeSelector}
        onDismissShadeSelector={dismissShadeSelector}
        onSelectColorVariation={selectColorVariation}
        onSelectPalette={selectPalette}
        onSelectDirectColor={selectDirectColor}
        onSelectShadeColor={(shade, rowIndex) => {
          // Generate the shade grid to get the complete row
          let colorIndex = -1;
          let found = false;
          // Find which color position (0-7) the shadeMenuColor represents
          for (let i = 0; i < 8 && !found; i++) {
            for (let j = 0; j < ALL_COLORS.length; j++) {
              if (ALL_COLORS[j][i] === shadeMenuColor) {
                colorIndex = i;
                found = true;
                break;
              }
            }
          }

          const shadeGrid = generateShadesWithExistingColors(shadeMenuColor, colorIndex);
          const selectedRow = shadeGrid[rowIndex];

          // Save the selected row as a new custom palette
          const newPaletteIndex = saveShadeRowAsPalette(selectedRow);

          // Switch to the new custom palette
          if (colorMenuType === "background") {
            setBgColorMode("palette");
            setBgColorModeSelection(newPaletteIndex);
            // Find which position in the row matches the selected shade
            const colorPosition = selectedRow.findIndex((color) => color === shade);
            setBackgroundColorIndex(colorPosition !== -1 ? colorPosition : 0);
          } else {
            setTextColorMode("palette");
            setTextColorModeSelection(newPaletteIndex);
            // Find which position in the row matches the selected shade
            const colorPosition = selectedRow.findIndex((color) => color === shade);
            setTextColorIndex(colorPosition !== -1 ? colorPosition : 0);
          }

          // Update the current color with selected shade
          setSelectedShadeColor(shade);
          setSelectedShadeType(colorMenuType); // Remember which type this shade applies to

          // Highlight the row that contains the selected shade
          setHighlightedRow(rowIndex);
          setHighlightedColumn(-1);

          // Don't close the shade menu - let user continue exploring shades
          // The menu will be closed manually by user or when they select a different color
        }}
        onRowSelect={(rowIndex) => {
          // Generate the shade grid to get the complete row
          let colorIndex = -1;
          let found = false;
          // Find which color position (0-7) the shadeMenuColor represents
          for (let i = 0; i < 8 && !found; i++) {
            for (let j = 0; j < ALL_COLORS.length; j++) {
              if (ALL_COLORS[j][i] === shadeMenuColor) {
                colorIndex = i;
                found = true;
                break;
              }
            }
          }

          const shadeGrid = generateShadesWithExistingColors(shadeMenuColor, colorIndex);
          const selectedRow = shadeGrid[rowIndex];

          // Save the selected row as a new custom palette
          const newPaletteIndex = saveShadeRowAsPalette(selectedRow);

          // Switch to the new custom palette
          if (colorMenuType === "background") {
            setBgColorMode("palette");
            setBgColorModeSelection(newPaletteIndex);
            // Use the first color in the row as default
            setBackgroundColorIndex(0);
          } else {
            setTextColorMode("palette");
            setTextColorModeSelection(newPaletteIndex);
            // Use the first color in the row as default
            setTextColorIndex(0);
          }

          // Update the current color with the first shade in the row
          setSelectedShadeColor(selectedRow[0]);
          setSelectedShadeType(colorMenuType);

          // Highlight the selected row
          setHighlightedRow(rowIndex);
          setHighlightedColumn(-1);

          // Don't close the shade menu - let user continue exploring shades
        }}
        onColumnSelect={(columnIndex) => {
          setHighlightedColumn(columnIndex);
          setHighlightedRow(-1);
        }}
        onOpenShadeSelector={openShadeSelector}
      />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
