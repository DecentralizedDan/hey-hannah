import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
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
// Using FileSystem for simple JSON storage

const COLORS = ["red", "orange", "yellow", "green", "blue", "purple", "white", "black"];

// Legacy COLOR_VALUES for backward compatibility
const COLOR_VALUES = {
  white: "#FFFFFF",
  black: "#000000",
  red: "#FF0000",
  blue: "#0000FF",
  green: "#00FF00",
  yellow: "#FFFF00",
  purple: "#800080",
  orange: "#FFA500",
};

// All 64 colors organized into 8 palettes of 8 colors each
const ALL_COLORS = [
  // 0: Default palette (improved versions of current colors)
  ["#FF3333", "#FF7700", "#FFDD00", "#33DD33", "#3377FF", "#AA33FF", "#FFFFFF", "#222222"],

  // 1: Pastel palette
  ["#FFB3B3", "#FFB380", "#FFF5AA", "#B3FFB3", "#B3CCFF", "#E6B3FF", "#FEFEFE", "#888888"],

  // 2: Earth tones palette
  ["#D85555", "#DD8844", "#DDAA33", "#669944", "#5588AA", "#8855AA", "#F5F0EA", "#3D3D3D"],

  // 3: Ocean palette
  ["#FF6B6B", "#FF9F6B", "#FFD56B", "#6BFF9F", "#6BAAFF", "#9F6BFF", "#F0FDFF", "#4A4A4A"],

  // 4: Sunset palette
  ["#FF4D6D", "#FF8A5C", "#FFD93D", "#8CFF6B", "#6B9DFF", "#D67AFF", "#FFF8F0", "#2A2A2A"],

  // 5: Pure colors (highly saturated)
  ["#FF0000", "#FF8800", "#FFFF00", "#00FF00", "#0066FF", "#8800FF", "#FFFFFF", "#000000"],

  // 6: Jewel tones palette
  ["#990033", "#CC4400", "#998800", "#004D66", "#1A1A99", "#660099", "#F7F7F7", "#1A1A1A"],

  // 7: Toxic/Garish palette
  ["#FF0080", "#FF6600", "#CCFF00", "#00FF80", "#0080FF", "#8000FF", "#FFFFFF", "#000000"],
];

const GOLDEN_COLOR = "#FFCC02";

const ALIGNMENTS = ["left", "center", "right"];

const FONT_FAMILIES = [
  "System", // Default system font
  "Courier", // Built-in monospace font available on both iOS and Android
  "Times New Roman", // Classic serif font available on both iOS and Android
  "Helvetica-Bold", // Bold weight of classic Helvetica font
  "Impact", // Strong condensed font for maximum impact
  "Courgette_400Regular", // Casual script with rounded characters
  "PermanentMarker_400Regular", // Bold marker-style font for creative impact
  "BlackOpsOne_400Regular", // Military stencil style, very bold and strong
  "Quicksand_400Regular", // Modern rounded font, friendly like Comic Sans
];

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

  const [text, setText] = useState("");
  const [backgroundColorIndex, setBackgroundColorIndex] = useState(2); // default yellow background
  const [textColorIndex, setTextColorIndex] = useState(4); // default blue text
  const [alignment, setAlignment] = useState(0); // 0=left, 1=center, 2=right

  // Color palette state management
  const [bgColorMode, setBgColorMode] = useState("palette"); // "palette" or "variations"
  const [bgColorModeSelection, setBgColorModeSelection] = useState(0); // 0-7 (palette or variation index)
  const [textColorMode, setTextColorMode] = useState("palette"); // "palette" or "variations"
  const [textColorModeSelection, setTextColorModeSelection] = useState(0); // 0-7 (palette or variation index)

  // Color selection menu state
  const [colorMenuVisible, setColorMenuVisible] = useState(false);
  const [colorMenuType, setColorMenuType] = useState("background"); // "background" or "text"
  const [highlightedRow, setHighlightedRow] = useState(-1); // -1 means no highlight
  const [highlightedColumn, setHighlightedColumn] = useState(-1); // -1 means no highlight
  const colorMenuAnimation = useRef(new Animated.Value(0)).current;

  // Shade selector menu state
  const [shadeMenuVisible, setShadeMenuVisible] = useState(false);
  const [shadeMenuColor, setShadeMenuColor] = useState("#0000FF"); // The base color for shades
  const [originalColorMenuState, setOriginalColorMenuState] = useState({
    bgColorMode: "palette",
    bgColorModeSelection: 0,
    textColorMode: "palette",
    textColorModeSelection: 0,
    highlightedRow: -1,
    highlightedColumn: -1,
  });
  const [fontSize, setFontSize] = useState(baseSize);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(400); // Larger default height in pixels
  const [startedWriting, setStartedWriting] = useState(false);
  const [fontFamily, setFontFamily] = useState(0); // 0=default, 1=monospace
  const [currentView, setCurrentView] = useState("create"); // 'create' or 'gallery'
  const [galleryImages, setGalleryImages] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [imageToShare, setImageToShare] = useState(null);
  const [activeImageId, setActiveImageId] = useState(null); // Track which gallery image is currently being edited
  const [gallerySortMode, setGallerySortMode] = useState("newest");
  const [isTransitioning, setIsTransitioning] = useState(false); // 'newest', 'oldest', 'favorites', 'random'
  const [previewReturnView, setPreviewReturnView] = useState("create"); // Track which view to return to after preview
  const [isHoldingPreview, setIsHoldingPreview] = useState(false); // Track if preview button is being held
  const [isHoldingNew, setIsHoldingNew] = useState(false); // Track if new button is being held
  const [deletedText, setDeletedText] = useState(""); // Store deleted text for undo functionality
  const [showUndo, setShowUndo] = useState(false); // Track if undo option should be shown
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
  };

  const cycleTextColor = () => {
    setTextColorIndex((prev) => (prev + 1) % COLORS.length);
  };

  // Color menu functions
  const openColorMenu = (type) => {
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
    setHighlightedRow(-1);
    setHighlightedColumn(-1);
    closeColorMenu();
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

    // Set shade selector state
    setShadeMenuColor(color);
    setShadeMenuVisible(true);

    // Generate shades and find the row containing the long-pressed color
    const shadeGrid = generateShadesWithExistingColors(color, colorIndex);
    let targetRow = 0;

    // Find which row contains the specific color that was long-pressed
    for (let row = 0; row < shadeGrid.length; row++) {
      if (shadeGrid[row].includes(color)) {
        targetRow = row;
        break;
      }
    }

    // Highlight the row containing the long-pressed color
    setHighlightedRow(targetRow);
    setHighlightedColumn(-1);
  };

  const closeShadeSelector = () => {
    // Restore original color menu state
    setBgColorMode(originalColorMenuState.bgColorMode);
    setBgColorModeSelection(originalColorMenuState.bgColorModeSelection);
    setTextColorMode(originalColorMenuState.textColorMode);
    setTextColorModeSelection(originalColorMenuState.textColorModeSelection);
    setHighlightedRow(originalColorMenuState.highlightedRow);
    setHighlightedColumn(originalColorMenuState.highlightedColumn);

    // Reset selected shade color
    setSelectedShadeColor(null);

    // Close shade selector
    setShadeMenuVisible(false);
  };

  const cycleAlignment = () => {
    setAlignment((prev) => (prev + 1) % ALIGNMENTS.length);
  };

  const cycleFontFamily = () => {
    setFontFamily((prev) => (prev + 1) % FONT_FAMILIES.length);
  };

  const toggleGallerySortMode = () => {
    setGallerySortMode((prev) => {
      if (prev === "newest") return "favorites";
      if (prev === "favorites") return "oldest";
      if (prev === "oldest") return "random";
      return "newest"; // from random back to newest
    });
  };

  // Helper function to generate 64 shades of a color using linear interpolation
  const generateColorShades = (baseColor) => {
    // Parse hex color to RGB
    const hex = baseColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const shades = [];

    // Generate 64 shades from darkest (near black) to lightest (near white)
    for (let i = 0; i < 64; i++) {
      // Calculate interpolation factor (0 to 1)
      const t = i / 63;

      // Interpolate from black (0,0,0) through base color to white (255,255,255)
      let newR, newG, newB;

      if (t <= 0.5) {
        // First half: interpolate from black to base color
        const factor = t * 2; // 0 to 1
        newR = Math.round(r * factor);
        newG = Math.round(g * factor);
        newB = Math.round(b * factor);
      } else {
        // Second half: interpolate from base color to white
        const factor = (t - 0.5) * 2; // 0 to 1
        newR = Math.round(r + (255 - r) * factor);
        newG = Math.round(g + (255 - g) * factor);
        newB = Math.round(b + (255 - b) * factor);
      }

      // Convert back to hex
      const hexR = newR.toString(16).padStart(2, "0");
      const hexG = newG.toString(16).padStart(2, "0");
      const hexB = newB.toString(16).padStart(2, "0");

      shades.push(`#${hexR}${hexG}${hexB}`);
    }

    return shades;
  };

  // Helper function to find existing colors of the same type and integrate them into shade continuum
  const generateShadesWithExistingColors = (baseColor, colorIndex) => {
    // Generate base 64 shades
    const generatedShades = generateColorShades(baseColor);

    // Find all existing colors of this type (same colorIndex) from all 8 palettes
    const existingColors = [];
    for (let paletteIndex = 0; paletteIndex < ALL_COLORS.length; paletteIndex++) {
      const color = ALL_COLORS[paletteIndex][colorIndex];
      existingColors.push({
        color: color,
        paletteIndex: paletteIndex,
        originalIndex: paletteIndex, // Keep track of array order for conflicts
      });
    }

    // Calculate lightness for each existing color to position in continuum
    const getColorLightness = (hexColor) => {
      const hex = hexColor.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      // Simple lightness calculation using relative luminance
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };

    // Sort existing colors by lightness, then by original array order for conflicts
    existingColors.sort((a, b) => {
      const lightnessA = getColorLightness(a.color);
      const lightnessB = getColorLightness(b.color);
      if (Math.abs(lightnessA - lightnessB) < 0.01) {
        // Very similar lightness
        return a.originalIndex - b.originalIndex; // Use array order
      }
      return lightnessA - lightnessB;
    });

    // Replace generated shades with existing colors at appropriate positions
    const finalShades = [...generatedShades];
    existingColors.forEach((existingColor) => {
      const lightness = getColorLightness(existingColor.color);
      // Map lightness (0-1) to position (0-63)
      const position = Math.round(lightness * 63);
      finalShades[position] = existingColor.color;
    });

    // Organize into 8x8 grid (8 rows of 8 shades each)
    const shadeGrid = [];
    for (let row = 0; row < 8; row++) {
      const rowShades = [];
      for (let col = 0; col < 8; col++) {
        const index = row * 8 + col;
        rowShades.push(finalShades[index]);
      }
      shadeGrid.push(rowShades);
    }

    return shadeGrid;
  };

  // State for tracking selected shade colors when in shade mode
  const [selectedShadeColor, setSelectedShadeColor] = useState(null);

  // Helper functions to get current colors from new palette system
  const getCurrentBackgroundColor = () => {
    // If in shade mode and a shade is selected, use that
    if (shadeMenuVisible && selectedShadeColor && colorMenuType === "background") {
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

  const getCurrentTextColor = () => {
    // If in shade mode and a shade is selected, use that
    if (shadeMenuVisible && selectedShadeColor && colorMenuType === "text") {
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

  const currentAlignment = ALIGNMENTS[alignment];
  const currentBackgroundColor = getCurrentBackgroundColor();
  const currentFontFamily =
    FONT_FAMILIES[fontFamily] === "System" ? undefined : FONT_FAMILIES[fontFamily];
  const currentTextColor = getCurrentTextColor();

  // Create sorted gallery images based on current sort mode
  const getSortedGalleryImages = () => {
    const imagesCopy = [...galleryImages];

    switch (gallerySortMode) {
      case "oldest":
        return imagesCopy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "favorites":
        return imagesCopy.sort((a, b) => {
          // First sort by favorite status (favorites first)
          if (a.isFavorited && !b.isFavorited) return -1;
          if (!a.isFavorited && b.isFavorited) return 1;
          // Then by newest for items with same favorite status
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      case "random":
        // Fisher-Yates shuffle algorithm
        for (let i = imagesCopy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [imagesCopy[i], imagesCopy[j]] = [imagesCopy[j], imagesCopy[i]];
        }
        return imagesCopy;
      case "newest":
      default:
        return imagesCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

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
        if (__DEV__) console.log("Haptic feedback not available:", error);
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
        if (__DEV__) console.log("Haptic feedback not available:", error);
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

  // Gallery functions
  const loadGalleryImages = async () => {
    try {
      const galleryMetadataPath = FileSystem.documentDirectory + "gallery/metadata.json";
      const fileInfo = await FileSystem.getInfoAsync(galleryMetadataPath);
      if (fileInfo.exists) {
        const galleryData = await FileSystem.readAsStringAsync(galleryMetadataPath);
        const images = JSON.parse(galleryData);
        // Sort by creation date descending (newest first)
        const sortedImages = images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setGalleryImages(sortedImages);
      }
    } catch (error) {
      if (__DEV__) console.error("Failed to load gallery:", error);
    }
  };

  const createNewImage = async (uri, galleryDir) => {
    // Create permanent file
    const timestamp = Date.now();
    const filename = `text-image-${timestamp}.jpg`;
    const permanentPath = galleryDir + filename;

    await FileSystem.copyAsync({
      from: uri,
      to: permanentPath,
    });

    // Save metadata
    const metadata = {
      id: timestamp,
      filename,
      path: permanentPath,
      text: text, // Full text content
      backgroundColor: COLORS[backgroundColorIndex],
      backgroundColorIndex,
      textColor: COLORS[textColorIndex],
      textColorIndex,
      alignment,
      fontFamily,
      fontSize,
      previewHeight,
      isFavorited: false,
      createdAt: new Date().toISOString(),
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
          console.log("Current view:", currentView);
          console.log("Text content:", text.substring(0, 50) + "...");
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

          // Create new file with current timestamp
          const timestamp = Date.now();
          const filename = `text-image-${timestamp}.jpg`;
          const permanentPath = galleryDir + filename;

          await FileSystem.copyAsync({
            from: uri,
            to: permanentPath,
          });

          // Check if content has actually changed
          const contentChanged =
            existingImage.text !== text ||
            existingImage.backgroundColorIndex !== backgroundColorIndex ||
            existingImage.textColorIndex !== textColorIndex ||
            existingImage.alignment !== alignment ||
            existingImage.fontFamily !== fontFamily ||
            existingImage.fontSize !== fontSize;

          // Update metadata with new timestamp and current date only if content changed
          const updatedMetadata = {
            ...existingImage,
            filename,
            path: permanentPath,
            text: text, // Full text content
            backgroundColor: COLORS[backgroundColorIndex],
            backgroundColorIndex,
            textColor: COLORS[textColorIndex],
            textColorIndex,
            alignment,
            fontFamily,
            fontSize,
            previewHeight,
            isFavorited: existingImage.isFavorited || false, // Preserve favorite status
            createdAt: contentChanged ? new Date().toISOString() : existingImage.createdAt, // Only update date if content changed
          };

          // Replace the existing image in the array
          newGalleryImages = [...galleryImages];
          newGalleryImages[existingImageIndex] = updatedMetadata;
          imageId = activeImageId;

          if (__DEV__) {
            console.log(
              "Updated image metadata with date:",
              new Date(updatedMetadata.createdAt).toLocaleDateString()
            );
          }
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

    // Switch to create view with clean state
    setCurrentView("create");

    // Now restore the actual image data after the clean state is rendered
    setTimeout(() => {
      setText(imageData.text);
      setBackgroundColorIndex(imageData.backgroundColorIndex);
      setTextColorIndex(imageData.textColorIndex);
      setAlignment(imageData.alignment);
      setFontFamily(imageData.fontFamily);
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
    setCurrentView("create");
  };

  const handleNewImage = async () => {
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
    }
  };

  const deleteImageFromGallery = async (imageId) => {
    try {
      // Find the image to delete
      const imageToDelete = galleryImages.find((img) => img.id === imageId);
      if (!imageToDelete) return;

      // Delete the image file
      const fileInfo = await FileSystem.getInfoAsync(imageToDelete.path);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(imageToDelete.path);
      }

      // Update gallery list
      const updatedImages = galleryImages.filter((img) => img.id !== imageId);
      setGalleryImages(updatedImages);

      // If we deleted the currently active image, clear the activeImageId and reset to blank state
      if (activeImageId === imageId) {
        setActiveImageId(null);
        setText("");
        setBackgroundColorIndex(5); // default yellow background
        setTextColorIndex(3); // default blue text
        setAlignment(0); // left alignment
        setFontFamily(0); // default font
        setFontSize(baseSize);
        setPreviewHeight(400); // default height in pixels
        setStartedWriting(false);
        setIsPreviewMode(false);
      }

      // Save updated list to FileSystem
      const galleryMetadataPath = FileSystem.documentDirectory + "gallery/metadata.json";
      await FileSystem.writeAsStringAsync(galleryMetadataPath, JSON.stringify(updatedImages));

      // Close modal
      setDeleteModalVisible(false);
      setImageToDelete(null);
    } catch (error) {
      if (__DEV__) console.error("Failed to delete image:", error);
      Alert.alert("Error", "Failed to delete image.");
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

      // Create new metadata with current timestamp and date
      const timestamp = Date.now();
      const filename = `text-image-${timestamp}.jpg`;
      const galleryDir = FileSystem.documentDirectory + "gallery/";
      const permanentPath = galleryDir + filename;

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

  const toggleFavoriteImage = async (imageId) => {
    try {
      // Find and update the image
      const updatedImages = galleryImages.map((img) => {
        if (img.id === imageId) {
          return { ...img, isFavorited: !img.isFavorited };
        }
        return img;
      });

      setGalleryImages(updatedImages);

      // Save updated list to FileSystem
      const galleryMetadataPath = FileSystem.documentDirectory + "gallery/metadata.json";
      await FileSystem.writeAsStringAsync(galleryMetadataPath, JSON.stringify(updatedImages));
    } catch (error) {
      if (__DEV__) console.error("Failed to toggle favorite:", error);
      Alert.alert("Error", "Failed to update favorite status.");
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
        if (__DEV__) console.log("Image copy failed, copying text instead:", imageError);

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

  const handleShareFromPreview = async () => {
    try {
      const uri = await captureRef(captureTextRef, {
        format: "jpg",
        quality: 1.0,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
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

      // First, restore the image to the editor (same as handleImageSelection but without auto-save)
      // Reset all state to defaults first
      setText("");
      setBackgroundColorIndex(5); // default background
      setTextColorIndex(3); // default text color
      setAlignment(0); // default alignment
      setFontFamily(0); // default font
      setStartedWriting(false);
      setActiveImageId(null);

      // Restore the image data immediately
      setText(image.text);
      setBackgroundColorIndex(image.backgroundColorIndex);
      setTextColorIndex(image.textColorIndex);
      setAlignment(image.alignment);
      setFontFamily(image.fontFamily);
      setPreviewHeight(image.previewHeight);
      setStartedWriting(true);
      setActiveImageId(image.id);

      // Switch to create view and activate preview mode simultaneously
      setCurrentView("create");
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
        options: ["Preview", favoriteOption, "Copy", "Duplicate", "Share", "Delete", "Cancel"],
        destructiveButtonIndex: 5, // Delete option
        cancelButtonIndex: 6,
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
          case 5: // Delete
            confirmDelete(image);
            break;
          default:
            // Cancel - do nothing
            break;
        }
      }
    );
  };

  // Load gallery on component mount
  useEffect(() => {
    loadGalleryImages();
  }, []);

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
        if (__DEV__) console.log("Image copy failed, copying text instead:", imageError);

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

          if (__DEV__) console.log("Attempting to capture with height:", captureHeight);

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

          if (__DEV__) console.log("Capture successful, saving to library:", uri);

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
            await Sharing.shareAsync(uri, {
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
            {!isPreviewMode && currentView === "create" && (
              <View style={[styles.navigationContainer, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={handleGalleryView}>
                  <Text style={styles.navigationText}>Gallery</Text>
                </TouchableOpacity>
                {startedWriting && text.trim() && !showUndo && (
                  <Pressable
                    onPress={handleNewImage}
                    onPressIn={handleNewPressIn}
                    onPressOut={handleNewPressOut}
                  >
                    <Text
                      style={[
                        styles.navigationText,
                        {
                          backgroundColor: isHoldingNew ? "rgba(255, 204, 2, 0.2)" : "transparent",
                        },
                      ]}
                    >
                      New
                    </Text>
                  </Pressable>
                )}
                {showUndo && (
                  <TouchableOpacity onPress={handleUndo}>
                    <Text style={styles.navigationText}>Undo</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {!isPreviewMode && currentView === "gallery" && (
              <View style={[styles.navigationContainer, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={toggleGallerySortMode}>
                  <Text style={styles.navigationText}>
                    {gallerySortMode === "newest"
                      ? "Newest"
                      : gallerySortMode === "oldest"
                      ? "Oldest"
                      : gallerySortMode === "favorites"
                      ? "Favorites"
                      : "Random"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEditView}>
                  <Text style={styles.navigationText}>{activeImageId ? "Edit" : "New"}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Controls at top */}
            {!isPreviewMode && currentView === "create" && (
              <View style={[styles.topControlsContainer, { paddingTop: 20 }]}>
                {/* Background color control */}
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={cycleBackgroundColor}
                  onLongPress={() => openColorMenu("background")}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      {
                        backgroundColor: currentBackgroundColor,
                        borderColor: "#FFFFFF",
                      },
                    ]}
                  />
                  <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>BG</Text>
                </TouchableOpacity>

                {/* Text color control */}
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={cycleTextColor}
                  onLongPress={() => openColorMenu("text")}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      {
                        backgroundColor: currentTextColor,
                        borderColor: "#FFFFFF",
                      },
                    ]}
                  />
                  <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>TEXT</Text>
                </TouchableOpacity>

                {/* Font family control */}
                <TouchableOpacity style={styles.controlButton} onPress={cycleFontFamily}>
                  <View style={[styles.fontIcon, { borderColor: "#FFFFFF" }]}>
                    <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>Aa</Text>
                  </View>
                  <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>FONT</Text>
                </TouchableOpacity>

                {/* Alignment control */}
                <TouchableOpacity style={styles.controlButton} onPress={cycleAlignment}>
                  <View style={[styles.alignmentIcon, { borderColor: "#FFFFFF" }]}>
                    <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>
                      {currentAlignment === "left"
                        ? "←"
                        : currentAlignment === "center"
                        ? "↔"
                        : "→"}
                    </Text>
                  </View>
                  <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>ALIGN</Text>
                </TouchableOpacity>

                {/* Preview control */}
                <Pressable
                  style={styles.controlButton}
                  onPress={togglePreviewMode}
                  onPressIn={handlePreviewPressIn}
                  onPressOut={handlePreviewPressOut}
                >
                  <View
                    style={[
                      styles.previewIcon,
                      {
                        borderColor: "#FFFFFF",
                        backgroundColor: isHoldingPreview
                          ? "rgba(255, 255, 255, 0.2)"
                          : "transparent",
                      },
                    ]}
                  >
                    <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>📄</Text>
                  </View>
                  <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>PREVIEW</Text>
                </Pressable>

                {/* Share control */}
                <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
                  <View style={[styles.shareIcon, { borderColor: "#FFFFFF" }]}>
                    <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>↗</Text>
                  </View>
                  <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>SHARE</Text>
                </TouchableOpacity>
              </View>
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
              <View style={styles.galleryContainer}>
                <ScrollView
                  style={styles.galleryScrollView}
                  contentContainerStyle={styles.galleryContent}
                  showsVerticalScrollIndicator={false}
                >
                  {sortedGalleryImages.length === 0 ? (
                    <View style={styles.emptyGalleryContainer}>
                      <Text style={styles.emptyGalleryText}>
                        No saved images yet. Create some text art and use "New" to save it!
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.thumbnailGrid}>
                      {sortedGalleryImages.map((image, index) => {
                        return (
                          <View
                            key={image.id}
                            style={[
                              styles.thumbnailContainer,
                              // Remove right margin for every 3rd item (right column)
                              (index + 1) % 3 === 0 && { marginRight: 0 },
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.thumbnailTouchable}
                              onPress={() => handleImageSelection(image)}
                              onLongPress={() => showImageActionSheet(image)}
                            >
                              <View
                                style={[
                                  styles.thumbnail,
                                  {
                                    backgroundColor:
                                      activeImageId === image.id
                                        ? COLORS[backgroundColorIndex]
                                        : COLOR_VALUES[image.backgroundColor],
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.thumbnailText,
                                    {
                                      color:
                                        activeImageId === image.id
                                          ? COLORS[textColorIndex]
                                          : COLOR_VALUES[image.textColor],
                                      fontSize:
                                        (activeImageId === image.id ? fontSize : image.fontSize) *
                                        0.21, // Precisely tuned to match original character density
                                      textAlign:
                                        activeImageId === image.id
                                          ? ALIGNMENTS[alignment]
                                          : ALIGNMENTS[image.alignment],
                                      fontFamily:
                                        activeImageId === image.id
                                          ? FONT_FAMILIES[fontFamily] === "System"
                                            ? undefined
                                            : FONT_FAMILIES[fontFamily]
                                          : FONT_FAMILIES[image.fontFamily] === "System"
                                          ? undefined
                                          : FONT_FAMILIES[image.fontFamily],
                                    },
                                  ]}
                                  numberOfLines={15}
                                  ellipsizeMode="tail"
                                >
                                  {activeImageId === image.id ? text : image.text}
                                </Text>
                              </View>
                              <Text style={styles.thumbnailDate}>
                                {new Date(image.createdAt).toLocaleDateString()}
                              </Text>
                            </TouchableOpacity>
                            {/* Heart icon for favorited images */}
                            {image.isFavorited && (
                              <View style={styles.heartIcon}>
                                <Text style={styles.heartIconText}>❤️</Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </ScrollView>
              </View>
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
      {deleteModalVisible && (
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>Delete Image</Text>
            <Text style={styles.deleteModalMessage}>This action cannot be undone.</Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.cancelButton]}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.confirmButton]}
                onPress={() => deleteImageFromGallery(imageToDelete?.id)}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Share modal */}
      {shareModalVisible && imageToShare && (
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContainer}>
            <Text style={styles.shareModalTitle}>Share Image</Text>
            <Text style={styles.shareModalMessage}>Choose how to share your image:</Text>
            <View style={styles.shareModalButtons}>
              <TouchableOpacity
                style={[styles.shareModalButton, styles.shareOptionButton]}
                onPress={async () => {
                  closeShareModal();
                  // Save to Photos
                  try {
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status !== "granted") {
                      Alert.alert(
                        "Permission Required",
                        "Please grant photo library permissions to save images."
                      );
                      return;
                    }
                    await MediaLibrary.saveToLibraryAsync(imageToShare.path);
                    Alert.alert("Success", "Image saved to Photos!");
                  } catch (error) {
                    Alert.alert("Error", "Failed to save image to Photos.");
                  }
                }}
              >
                <Text style={styles.shareOptionText}>Save to Photos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareModalButton, styles.shareOptionButton]}
                onPress={() => {
                  closeShareModal();
                  copyImageFromGallery(imageToShare.id);
                }}
              >
                <Text style={styles.shareOptionText}>Copy to Clipboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareModalButton, styles.shareOptionButton]}
                onPress={async () => {
                  closeShareModal();
                  try {
                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(imageToShare.path, {
                        mimeType: "image/jpeg",
                        dialogTitle: "Share your text image",
                      });
                    } else {
                      Alert.alert("Error", "Sharing is not available on this device.");
                    }
                  } catch (error) {
                    Alert.alert("Error", "Failed to share image.");
                  }
                }}
              >
                <Text style={styles.shareOptionText}>Share via Apps</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareModalButton, styles.cancelButton]}
                onPress={closeShareModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Color selection menu */}
      {(colorMenuVisible || shadeMenuVisible) && (
        <Animated.View
          style={[
            styles.colorMenuOverlay,
            {
              transform: [
                {
                  translateY: colorMenuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [Dimensions.get("window").width, 0], // Slide up from bottom in pixels
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={closeColorMenu}>
            <View style={styles.colorMenuBackground} />
          </TouchableWithoutFeedback>

          <View style={styles.colorMenuContainer}>
            {/* 9x9 Grid */}
            <View style={styles.colorGrid}>
              {/* Top row: empty corner + down arrows */}
              <View style={styles.colorGridRow}>
                {/* Exit/Back button in top-left corner */}
                <TouchableOpacity
                  style={[styles.colorCell, styles.exitCell]}
                  onPress={shadeMenuVisible ? closeShadeSelector : closeColorMenu}
                >
                  <Text style={styles.exitText}>{shadeMenuVisible ? "←" : "×"}</Text>
                </TouchableOpacity>

                {/* Radio buttons for color variations or shade columns */}
                {!shadeMenuVisible
                  ? // Regular color variation radio buttons
                    COLORS.map((_, colorIndex) => (
                      <TouchableOpacity
                        key={`radio-column-${colorIndex}`}
                        style={[styles.colorCell, styles.radioCell]}
                        onPress={() => selectColorVariation(colorIndex)}
                      >
                        <View style={styles.radioButton}>
                          <View
                            style={[
                              styles.radioButtonInner,
                              (colorMenuType === "background" &&
                                bgColorMode === "variations" &&
                                bgColorModeSelection === colorIndex) ||
                              (colorMenuType === "text" &&
                                textColorMode === "variations" &&
                                textColorModeSelection === colorIndex)
                                ? styles.radioButtonSelected
                                : null,
                            ]}
                          />
                        </View>
                      </TouchableOpacity>
                    ))
                  : // Shade selector column radio buttons (8 columns)
                    Array.from({ length: 8 }, (_, columnIndex) => (
                      <TouchableOpacity
                        key={`shade-column-${columnIndex}`}
                        style={[styles.colorCell, styles.radioCell]}
                        onPress={() => {
                          setHighlightedColumn(columnIndex);
                          setHighlightedRow(-1);
                        }}
                      >
                        <View style={styles.radioButton}>
                          <View
                            style={[
                              styles.radioButtonInner,
                              highlightedColumn === columnIndex ? styles.radioButtonSelected : null,
                            ]}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
              </View>

              {/* 8 rows of colors or shades */}
              {!shadeMenuVisible
                ? // Regular palette rows
                  ALL_COLORS.map((palette, paletteIndex) => (
                    <View key={`palette-${paletteIndex}`} style={styles.colorGridRow}>
                      {/* Radio button for palette selection */}
                      <TouchableOpacity
                        style={[styles.colorCell, styles.radioCell]}
                        onPress={() => selectPalette(paletteIndex)}
                      >
                        <View style={styles.radioButton}>
                          <View
                            style={[
                              styles.radioButtonInner,
                              (colorMenuType === "background" &&
                                bgColorMode === "palette" &&
                                bgColorModeSelection === paletteIndex) ||
                              (colorMenuType === "text" &&
                                textColorMode === "palette" &&
                                textColorModeSelection === paletteIndex)
                                ? styles.radioButtonSelected
                                : null,
                            ]}
                          />
                        </View>
                      </TouchableOpacity>

                      {/* 8 colors in this palette with row highlight overlay */}
                      <View style={styles.colorRowContainer}>
                        {palette.map((color, colorIndex) => (
                          <TouchableOpacity
                            key={`color-${paletteIndex}-${colorIndex}`}
                            style={[styles.colorCell, { backgroundColor: color }]}
                            onPress={() => selectDirectColor(paletteIndex, colorIndex)}
                            onLongPress={() => openShadeSelector(color, colorIndex)}
                          />
                        ))}

                        {/* Row highlight overlay */}
                        {highlightedRow === paletteIndex && (
                          <View style={styles.rowHighlight} pointerEvents="none" />
                        )}
                      </View>
                    </View>
                  ))
                : // Shade selector rows
                  (() => {
                    // Find the color index from COLORS array based on shadeMenuColor
                    let colorIndex = 0;
                    for (let i = 0; i < COLORS.length; i++) {
                      // Check if any palette contains this color at this index
                      for (let j = 0; j < ALL_COLORS.length; j++) {
                        if (ALL_COLORS[j][i] === shadeMenuColor) {
                          colorIndex = i;
                          break;
                        }
                      }
                    }

                    const shadeGrid = generateShadesWithExistingColors(shadeMenuColor, colorIndex);

                    return shadeGrid.map((shadeRow, rowIndex) => (
                      <View key={`shade-row-${rowIndex}`} style={styles.colorGridRow}>
                        {/* Radio button for shade row selection */}
                        <TouchableOpacity
                          style={[styles.colorCell, styles.radioCell]}
                          onPress={() => {
                            setHighlightedRow(rowIndex);
                            setHighlightedColumn(-1);
                          }}
                        >
                          <View style={styles.radioButton}>
                            <View
                              style={[
                                styles.radioButtonInner,
                                highlightedRow === rowIndex ? styles.radioButtonSelected : null,
                              ]}
                            />
                          </View>
                        </TouchableOpacity>

                        {/* 8 shade colors in this row with highlight overlay */}
                        <View style={styles.colorRowContainer}>
                          {shadeRow.map((shade, colIndex) => (
                            <TouchableOpacity
                              key={`shade-${rowIndex}-${colIndex}`}
                              style={[styles.colorCell, { backgroundColor: shade }]}
                              onPress={() => {
                                // Update the current color with selected shade
                                setSelectedShadeColor(shade);
                              }}
                            />
                          ))}

                          {/* Row highlight overlay */}
                          {highlightedRow === rowIndex && (
                            <View style={styles.rowHighlight} pointerEvents="none" />
                          )}
                        </View>
                      </View>
                    ));
                  })()}

              {/* Column highlight overlays */}
              {highlightedColumn !== -1 && (
                <View style={styles.columnHighlightContainer} pointerEvents="none">
                  <View
                    style={[
                      styles.columnHighlight,
                      {
                        left: (Dimensions.get("window").width / 9) * (highlightedColumn + 1), // Skip first column (arrows) in pixels
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: "5%",
    overflow: "visible",
  },
  textInput: {
    flex: 1,
    textAlignVertical: "top",
    lineHeight: undefined, // Let it calculate automatically
    position: "absolute",
    width: "100%",
    height: "100%",
    paddingHorizontal: "5%",
    paddingTop: "5%",
  },
  placeholderText: {
    position: "absolute",
    width: "100%",
    height: "100%",
    textAlignVertical: "center",
    fontWeight: "bold",
    paddingHorizontal: "5%",
    paddingTop: "5%",
  },
  captureContainer: {
    position: "absolute",
    width: "100%",
    paddingHorizontal: "5%",
    paddingTop: "5%",
    paddingBottom: "5%",
    flex: 1,
    justifyContent: "space-between",
  },
  captureText: {
    textAlignVertical: "top",
    flex: 0,
  },
  watermark: {
    fontSize: 12, // Watermark text size in pixels
    textAlign: "center",
    marginTop: 40, // Minimum top margin from text in pixels
    opacity: 0.7,
    fontStyle: "italic",
  },
  previewContainer: {
    position: "absolute",
    width: "100%",
    paddingTop: "5%",
    paddingBottom: "5%",
    borderRadius: 0,
    overflow: "visible",
  },
  previewOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: Dimensions.get("window").width, // Full screen width in pixels
    height: Dimensions.get("window").height, // Full screen height in pixels
    zIndex: 1000, // Ensure it's on top
  },
  previewOverlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000", // Black background
  },
  previewHeader: {
    position: "absolute",
    top: 60, // Space from top of screen in pixels
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20, // Horizontal padding in pixels
    zIndex: 1001, // Above the overlay background
  },
  previewLeftButtons: {
    flexDirection: "row",
    gap: 20, // Space between BACK and EDIT buttons in pixels
  },
  previewCenterContainer: {
    // Centering properties will be applied inline for proper dynamic values
  },
  previewScrollContainer: {
    width: Dimensions.get("window").width,
  },
  previewContainerOverlay: {
    paddingTop: "5%",
    paddingBottom: "5%",
    borderRadius: 0,
  },
  previewText: {
    textAlignVertical: "top",
    paddingHorizontal: "5%", // Text padding in pixels
  },
  measureText: {
    position: "absolute",
    opacity: 0, // Invisible but measurable
    textAlignVertical: "top",
    paddingHorizontal: "5%",
    paddingTop: "5%",
    width: "100%",
    pointerEvents: "none", // Don't interfere with touch events
  },
  emptyPreviewContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -150 }, { translateY: -25 }], // Center the 300px wide container
    width: 300, // Fixed width in pixels
    height: 50, // Fixed height in pixels
    justifyContent: "center",
    alignItems: "center",
  },
  emptyPreviewText: {
    color: "#FFFFFF", // White text on black background
    fontSize: 16, // Font size in pixels
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.8,
  },
  topControlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 5, // Vertical padding in pixels
    paddingHorizontal: 20, // Horizontal padding in pixels
    backgroundColor: "#000000", // Black background for controls
  },
  controlButton: {
    alignItems: "center",
  },
  colorCircle: {
    width: 40, // Button width in pixels
    height: 40, // Button height in pixels
    borderRadius: 20, // Corner radius in pixels
    borderWidth: 2, // Border thickness in pixels
    marginBottom: 5, // Bottom margin in pixels
  },
  alignmentIcon: {
    width: 40, // Icon width in pixels
    height: 40, // Icon height in pixels
    borderRadius: 20, // Corner radius in pixels
    borderWidth: 2, // Border thickness in pixels
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5, // Bottom margin in pixels
  },
  shareIcon: {
    width: 40, // Icon width in pixels
    height: 40, // Icon height in pixels
    borderRadius: 20, // Corner radius in pixels
    borderWidth: 2, // Border thickness in pixels
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5, // Bottom margin in pixels
  },
  previewIcon: {
    width: 40, // Icon width in pixels
    height: 40, // Icon height in pixels
    borderRadius: 20, // Corner radius in pixels
    borderWidth: 2, // Border thickness in pixels
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5, // Bottom margin in pixels
  },
  fontIcon: {
    width: 40, // Icon width in pixels
    height: 40, // Icon height in pixels
    borderRadius: 20, // Corner radius in pixels
    borderWidth: 2, // Border thickness in pixels
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5, // Bottom margin in pixels
  },
  alignmentText: {
    fontSize: 18, // Text size in pixels
    fontWeight: "bold",
  },
  controlLabel: {
    fontSize: 10, // Label text size in pixels
    fontWeight: "bold",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20, // Horizontal padding in pixels
    paddingVertical: 5, // Vertical padding in pixels
    backgroundColor: "#000000", // Black background
  },
  navigationText: {
    color: GOLDEN_COLOR,
    fontSize: 14, // Navigation text size in pixels
    fontWeight: "500",
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: "#000000", // Black background
  },
  galleryScrollView: {
    flex: 1,
  },
  galleryContent: {
    padding: 20, // Content padding in pixels
  },
  emptyGalleryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100, // Vertical padding in pixels
  },
  emptyGalleryText: {
    color: "#FFFFFF", // White text
    fontSize: 16, // Font size in pixels
    textAlign: "center",
    fontStyle: "italic",
    opacity: 0.7,
    paddingHorizontal: 40, // Horizontal padding in pixels
  },
  thumbnailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  thumbnailContainer: {
    width: "31%", // Three columns with gaps
    marginBottom: 20, // Bottom margin in pixels
    marginRight: "3.5%", // Right margin for spacing between columns
  },
  currentWorkContainer: {
    borderWidth: 2, // Border thickness in pixels
    borderColor: GOLDEN_COLOR, // Golden border to highlight current work
    borderRadius: 8, // Border radius in pixels
  },
  thumbnail: {
    aspectRatio: 9 / 12.8, // 20% shorter height than iPhone screen ratio
    borderRadius: 8, // Corner radius in pixels
    padding: 10, // Inner padding in pixels
    justifyContent: "flex-start",
    alignItems: "left",
    overflow: "hidden", // Clip content that exceeds height
  },
  thumbnailText: {
    fontWeight: "500",
  },
  thumbnailDate: {
    color: GOLDEN_COLOR,
    fontSize: 12, // Date text size in pixels
    textAlign: "center",
    marginTop: 5, // Top margin in pixels
    opacity: 0.8,
  },
  thumbnailTouchable: {
    flex: 1,
  },
  deleteButton: {
    position: "absolute",
    top: -5, // Top offset in pixels
    right: -5, // Right offset in pixels
    width: 24, // Button width in pixels
    height: 24, // Button height in pixels
    borderRadius: 12, // Corner radius in pixels
    backgroundColor: "#FF0000", // Red background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Ensure it's above thumbnail
  },
  deleteButtonText: {
    color: "#FFFFFF", // White text
    fontSize: 14, // Font size in pixels
    fontWeight: "bold",
    lineHeight: 16, // Line height in pixels
  },
  deleteModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black overlay
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001, // Above everything else
  },
  deleteModalContainer: {
    backgroundColor: "#FFFFFF", // White background
    borderRadius: 12, // Corner radius in pixels
    padding: 20, // Container padding in pixels
    margin: 20, // Container margin in pixels
    maxWidth: 300, // Maximum width in pixels
    width: "80%",
  },
  deleteModalTitle: {
    fontSize: 18, // Title text size in pixels
    fontWeight: "bold",
    color: "#000000", // Black text
    textAlign: "center",
    marginBottom: 10, // Bottom margin in pixels
  },
  deleteModalMessage: {
    fontSize: 16, // Message text size in pixels
    color: "#333333", // Dark gray text
    textAlign: "center",
    marginBottom: 20, // Bottom margin in pixels
    lineHeight: 22, // Line height in pixels
  },
  deleteModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteModalButton: {
    flex: 1,
    padding: 12, // Button padding in pixels
    borderRadius: 8, // Corner radius in pixels
    marginHorizontal: 5, // Horizontal margin in pixels
  },
  cancelButton: {
    backgroundColor: "#E0E0E0", // Light gray background
  },
  confirmButton: {
    backgroundColor: "#FF0000", // Red background
  },
  cancelButtonText: {
    color: "#333333", // Dark gray text
    fontSize: 16, // Font size in pixels
    fontWeight: "600",
    textAlign: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF", // White text
    fontSize: 16, // Font size in pixels
    fontWeight: "600",
    textAlign: "center",
  },
  heartIcon: {
    position: "absolute",
    top: 5, // Top offset in pixels
    left: 5, // Left offset in pixels
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent white background
    borderRadius: 12, // Corner radius in pixels
    padding: 4, // Icon padding in pixels
    zIndex: 5, // Above thumbnail content
  },
  heartIconText: {
    fontSize: 16, // Heart emoji size in pixels
  },
  shareModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black overlay
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1002, // Above delete modal
  },
  shareModalContainer: {
    backgroundColor: "#FFFFFF", // White background
    borderRadius: 12, // Corner radius in pixels
    padding: 20, // Container padding in pixels
    margin: 20, // Container margin in pixels
    maxWidth: 300, // Maximum width in pixels
    width: "80%",
  },
  shareModalTitle: {
    fontSize: 18, // Title text size in pixels
    fontWeight: "bold",
    color: "#000000", // Black text
    textAlign: "center",
    marginBottom: 10, // Bottom margin in pixels
  },
  shareModalMessage: {
    fontSize: 16, // Message text size in pixels
    color: "#333333", // Dark gray text
    textAlign: "center",
    marginBottom: 20, // Bottom margin in pixels
    lineHeight: 22, // Line height in pixels
  },
  shareModalButtons: {
    flexDirection: "column",
  },
  shareModalButton: {
    padding: 12, // Button padding in pixels
    borderRadius: 8, // Corner radius in pixels
    marginVertical: 5, // Vertical margin in pixels
  },
  shareOptionButton: {
    backgroundColor: "#007AFF", // iOS blue background
  },
  shareOptionText: {
    color: "#FFFFFF", // White text
    fontSize: 16, // Font size in pixels
    fontWeight: "600",
    textAlign: "center",
  },

  // Color menu styles
  colorMenuOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Dimensions.get("window").width, // Square grid, height equals screen width in pixels
    zIndex: 1003, // Above all other modals
  },
  colorMenuBackground: {
    position: "absolute",
    top: -Dimensions.get("window").height, // Cover entire screen above menu
    left: 0,
    right: 0,
    height: Dimensions.get("window").height, // Full screen height in pixels
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
  },
  colorMenuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000", // Black background for menu area
  },
  colorGrid: {
    width: Dimensions.get("window").width, // Full screen width in pixels
    height: Dimensions.get("window").width, // Square grid in pixels
  },
  colorGridRow: {
    flexDirection: "row",
    flex: 1,
  },
  colorCell: {
    flex: 1,
    borderWidth: 1, // Border thickness in pixels
    borderColor: "#333333", // Dark gray border
  },
  radioCell: {
    backgroundColor: "#222222", // Dark background for radio buttons
    justifyContent: "center",
    alignItems: "center",
  },
  radioButton: {
    width: 20, // Radio button outer circle width in pixels
    height: 20, // Radio button outer circle height in pixels
    borderRadius: 10, // Circular shape in pixels
    borderWidth: 2, // Border thickness in pixels
    borderColor: "#FFFFFF", // White border
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  radioButtonInner: {
    width: 10, // Radio button inner circle width in pixels
    height: 10, // Radio button inner circle height in pixels
    borderRadius: 5, // Circular shape in pixels
    backgroundColor: "transparent",
  },
  radioButtonSelected: {
    backgroundColor: "#FFCC02", // Golden fill when selected
  },
  exitCell: {
    backgroundColor: "#000000", // Black background for exit button
    justifyContent: "center",
    alignItems: "center",
  },
  exitText: {
    color: "#FFFFFF", // White X text
    fontSize: 28, // Large X size in pixels
    fontWeight: "bold",
  },
  colorRowContainer: {
    flexDirection: "row",
    flex: 8, // Takes up 8 units of the 9-unit row (excluding arrow)
    position: "relative",
  },
  rowHighlight: {
    position: "absolute",
    top: -2, // Extend outside the row in pixels
    left: -2, // Extend outside the row in pixels
    right: -2, // Extend outside the row in pixels
    bottom: -2, // Extend outside the row in pixels
    borderWidth: 3, // Thick golden border in pixels
    borderColor: "#FFCC02", // Golden highlight color
    backgroundColor: "transparent", // Transparent background
    pointerEvents: "none", // Don't interfere with touches
  },
  columnHighlightContainer: {
    position: "absolute",
    top: Dimensions.get("window").width / 9, // Start after the arrow row in pixels
    left: 0,
    right: 0,
    height: Dimensions.get("window").width * (8 / 9), // Height of 8 color rows in pixels
    pointerEvents: "none",
  },
  columnHighlight: {
    position: "absolute",
    top: -2, // Extend above column in pixels
    bottom: -2, // Extend below column in pixels
    width: Dimensions.get("window").width / 9 + 4, // Column width plus border extension in pixels
    borderWidth: 3, // Thick golden border in pixels
    borderColor: "#FFCC02", // Golden highlight color
    backgroundColor: "transparent", // Transparent background
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
