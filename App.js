import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
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
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import { RNShake } from "react-native-shake";

const COLORS = ["white", "black", "red", "blue", "green", "yellow", "purple", "orange"];

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

const COMPLEMENTARY_COLORS = {
  white: "black",
  black: "white",
  red: "green",
  blue: "orange",
  green: "red",
  yellow: "purple",
  purple: "yellow",
  orange: "blue",
};

const ALIGNMENTS = ["left", "center", "right"];

const FONT_FAMILIES = [
  "System", // Default system font
  "Courier", // Built-in monospace font available on both iOS and Android
  "Times New Roman", // Classic serif font available on both iOS and Android
];

function AppContent() {
  const insets = useSafeAreaInsets();
  const baseSize = 32; // font size in pixels

  const [text, setText] = useState("");
  const [backgroundColorIndex, setBackgroundColorIndex] = useState(5); // default yellow background
  const [textColorIndex, setTextColorIndex] = useState(3); // default blue text
  const [alignment, setAlignment] = useState(0); // 0=left, 1=center, 2=right
  const [fontSize, setFontSize] = useState(baseSize);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(400); // Larger default height in pixels
  const [startedWriting, setStartedWriting] = useState(false);
  const [fontFamily, setFontFamily] = useState(0); // 0=default, 1=monospace
  const textInputRef = React.useRef(null);
  const textAreaRef = useRef(null);
  const captureTextRef = useRef(null);
  const measureTextRef = useRef(null);

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

  // Setup shake detection
  useEffect(() => {
    const subscription = RNShake.addListener(() => {
      handleShakeGesture();
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const cycleBackgroundColor = () => {
    setBackgroundColorIndex((prev) => (prev + 1) % COLORS.length);
  };

  const cycleTextColor = () => {
    setTextColorIndex((prev) => (prev + 1) % COLORS.length);
  };

  const cycleAlignment = () => {
    setAlignment((prev) => (prev + 1) % ALIGNMENTS.length);
  };

  const cycleFontFamily = () => {
    setFontFamily((prev) => (prev + 1) % FONT_FAMILIES.length);
  };

  const currentAlignment = ALIGNMENTS[alignment];
  const currentBackgroundColor = COLOR_VALUES[COLORS[backgroundColorIndex]];
  const currentFontFamily =
    FONT_FAMILIES[fontFamily] === "System" ? undefined : FONT_FAMILIES[fontFamily];
  const currentTextColor = COLOR_VALUES[COLORS[textColorIndex]];

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleTextChange = (newText) => {
    setText(newText);
    if (newText.length > 0 && !startedWriting) {
      setStartedWriting(true);
    }
  };

  const handleShakeGesture = () => {
    // Only clear text if there is text to clear
    if (text.length > 0) {
      Alert.alert("Clear Text", "Shake detected! Do you want to clear the current text?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setText("");
            setStartedWriting(false);
            // Exit preview mode if active
            if (isPreviewMode) {
              setIsPreviewMode(false);
            }
          },
        },
      ]);
    }
  };

  const togglePreviewMode = async () => {
    try {
      if (!isPreviewMode) {
        Keyboard.dismiss();
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
      Alert.alert("No Text", "Please enter some text before sharing.");
      return;
    }

    Alert.alert("Share Text Image", "Choose how to share your text:", [
      { text: "Cancel", style: "cancel" },
      { text: "Save", onPress: saveToPhotos },
      { text: "Copy", onPress: copyImageToClipboard },
      { text: "Share", onPress: shareAsMessage },
    ]);
  };

  const copyImageToClipboard = async () => {
    try {
      if (!text.trim()) {
        Alert.alert("No Text", "Please enter some text before copying.");
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
        Alert.alert("No Text", "Please enter some text before saving.");
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
          await new Promise((resolve) => setTimeout(resolve, 300)); // Increased delay in milliseconds

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
          await new Promise((resolve) => setTimeout(resolve, 300)); // Increased delay in milliseconds

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
      setTimeout(performShare, 1000); // Delay in milliseconds
    } catch (error) {
      if (__DEV__) console.error("Share error:", error);
      Alert.alert("Error", "Failed to share image.");
    }
  };

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

            {/* Controls at top */}
            {!isPreviewMode && (
              <View style={[styles.topControlsContainer, { paddingTop: insets.top + 15 }]}>
                {/* Background color control */}
                <TouchableOpacity style={styles.controlButton} onPress={cycleBackgroundColor}>
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
                <TouchableOpacity style={styles.controlButton} onPress={cycleTextColor}>
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
                <TouchableOpacity style={styles.controlButton} onPress={togglePreviewMode}>
                  <View style={[styles.previewIcon, { borderColor: "#FFFFFF" }]}>
                    <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>📄</Text>
                  </View>
                  <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>PREVIEW</Text>
                </TouchableOpacity>

                {/* Share control */}
                <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
                  <View style={[styles.shareIcon, { borderColor: "#FFFFFF" }]}>
                    <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>↗</Text>
                  </View>
                  <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>SHARE</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Main text area */}
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
                  ref={captureTextRef}
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Preview overlay - rendered outside main layout */}
      {isPreviewMode && (
        <TouchableWithoutFeedback onPress={exitPreviewMode}>
          <View style={styles.previewOverlay}>
            <View style={styles.previewOverlayBackground} />
            {text.length > 0 ? (
              <ScrollView
                style={[
                  styles.previewScrollContainer,
                  {
                    maxHeight: Dimensions.get("window").height - 100, // Leave space for margins in pixels
                    top: 50, // Top margin in pixels
                  },
                ]}
                contentContainerStyle={{ flexGrow: 1 }}
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
  },
  captureText: {
    textAlignVertical: "top",
    flex: 1,
  },
  watermark: {
    fontSize: 12, // Watermark text size in pixels
    textAlign: "center",
    marginTop: 20, // Top margin in pixels
    opacity: 0.7,
    fontStyle: "italic",
  },
  previewContainer: {
    position: "absolute",
    width: "100%",

    // width: "90%", // Match the captured image width
    // left: "5%", // Center horizontally
    // paddingHorizontal: "5%",
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
  previewScrollContainer: {
    position: "absolute",
    width: Dimensions.get("window").width,
    left: 0,
  },
  previewContainerOverlay: {
    paddingTop: "5%",
    paddingBottom: "5%",
    borderRadius: 0,
    minHeight: "100%",
  },
  previewText: {
    textAlignVertical: "top",
    flex: 1,
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
    paddingVertical: 15, // Vertical padding in pixels
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
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
