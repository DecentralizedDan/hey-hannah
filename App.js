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
} from "react-native";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

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

export default function App() {
  const baseSize = 32; // font size in pixels

  const [text, setText] = useState("");
  const [backgroundColorIndex, setBackgroundColorIndex] = useState(0);
  const [textColorIndex, setTextColorIndex] = useState(0);
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

  // Initialize with random background color and complementary text color
  useEffect(() => {
    const randomBgIndex = Math.floor(Math.random() * COLORS.length);
    const bgColor = COLORS[randomBgIndex];
    const complementaryColor = COMPLEMENTARY_COLORS[bgColor];
    const textIndex = COLORS.indexOf(complementaryColor);

    setBackgroundColorIndex(randomBgIndex);
    setTextColorIndex(textIndex);
  }, []);

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

  const togglePreviewMode = async () => {
    if (!isPreviewMode) {
      Keyboard.dismiss();
      // Calculate preview height to match export before showing preview
      if (text.length > 0) {
        try {
          // Wait a moment for keyboard to dismiss and text to render
          await new Promise((resolve) => setTimeout(resolve, 150));
          const measuredHeight = await measureTextHeight();
          const padding = Dimensions.get("window").width * 0.1; // Padding in pixels
          const watermarkHeight = 40; // Space for watermark and margin in pixels
          const calculatedHeight = Math.max(measuredHeight + padding + watermarkHeight, 200); // Minimum height of 200 in pixels

          setPreviewHeight(calculatedHeight);
        } catch (error) {
          console.log("Height calculation error:", error);
          setPreviewHeight(400); // Fallback height in pixels
        }
      }
    }

    setIsPreviewMode(!isPreviewMode);
  };

  const exitPreviewMode = () => {
    if (isPreviewMode) {
      setIsPreviewMode(false);
    }
  };

  const measureTextHeight = () => {
    return new Promise((resolve) => {
      // Try to use the measure text ref first (for preview), fallback to capture ref
      const refToUse = measureTextRef.current || captureTextRef.current;

      if (refToUse && typeof refToUse.measure === "function") {
        refToUse.measure((_x, _y, _width, height) => {
          // Log the measured height in the terminal for debugging
          resolve(height);
        });
      } else {
        // Fallback: measure the TextInput if available
        if (textInputRef.current && typeof textInputRef.current.measure === "function") {
          textInputRef.current.measure((_x, _y, _width, height) => {
            resolve(height);
          });
        } else {
          resolve(200); // Fallback height in pixels
        }
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
      { text: "Save to Photos", onPress: saveToPhotos },
      { text: "Send Message", onPress: shareAsMessage },
      { text: "Share to Socials (Instagram, etc.)", onPress: shareToSocials },
    ]);
  };

  const saveToPhotos = async () => {
    try {
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

      // Wait a moment for keyboard to hide and UI to update
      setTimeout(async () => {
        try {
          setIsCapturing(true);

          // Wait a bit for the capture text to render
          await new Promise((resolve) => setTimeout(resolve, 100));

          const measuredHeight = await measureTextHeight();
          const padding = Dimensions.get("window").width * 0.1; // Padding in pixels
          const watermarkHeight = 40; // Space for watermark and margin in pixels
          const captureHeight = Math.max(measuredHeight + padding + watermarkHeight, 200); // Minimum height of 200 in pixels

          const uri = await captureRef(captureTextRef.current, {
            format: "jpg",
            quality: 1.0,
            result: "tmpfile",
            height: captureHeight,
          });

          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert("Success", "Image saved to Photos!");
        } catch (error) {
          console.error("Capture error:", error);
          Alert.alert("Error", "Failed to save image to Photos.");
        } finally {
          setIsCapturing(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Permission error:", error);
      Alert.alert("Error", "Failed to save image to Photos.");
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

      // Wait a moment for keyboard to hide and UI to update
      setTimeout(async () => {
        try {
          if (!captureTextRef.current) {
            Alert.alert("Error", "Text area not ready for capture.");
            return;
          }

          setIsCapturing(true);

          // Wait a bit for the capture text to render
          await new Promise((resolve) => setTimeout(resolve, 100));

          const measuredHeight = await measureTextHeight();
          const padding = Dimensions.get("window").width * 0.1; // Padding in pixels
          const watermarkHeight = 40; // Space for watermark and margin in pixels
          const captureHeight = Math.max(measuredHeight + padding + watermarkHeight, 200); // Minimum height of 200 in pixels

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
          console.error("Share error:", error);
          Alert.alert("Error", `Failed to share image: ${error.message}`);
        } finally {
          setIsCapturing(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Failed to share image.");
    }
  };

  const shareToSocials = async () => {
    try {
      if (!text.trim()) {
        Alert.alert("No Text", "Please enter some text before sharing.");
        return;
      }

      // Dismiss keyboard for clean capture
      Keyboard.dismiss();

      // Wait a moment for keyboard to hide and UI to update
      setTimeout(async () => {
        try {
          setIsCapturing(true);

          // Wait a bit for the capture text to render
          await new Promise((resolve) => setTimeout(resolve, 100));

          if (!captureTextRef.current) {
            Alert.alert("Error", "Text area not ready for capture.");
            return;
          }

          const measuredHeight = await measureTextHeight();
          const padding = Dimensions.get("window").width * 0.1; // Padding in pixels
          const watermarkHeight = 40; // Space for watermark and margin in pixels
          const captureHeight = Math.max(measuredHeight + padding + watermarkHeight, 200); // Minimum height of 200 in pixels

          const uri = await captureRef(captureTextRef.current, {
            format: "jpg",
            quality: 1.0,
            result: "tmpfile",
            height: captureHeight,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType: "image/jpeg",
              dialogTitle: "Share to Socials (Instagram, etc.)",
              UTI: "com.instagram.photo", // Hint for Instagram
            });
          } else {
            Alert.alert("Error", "Sharing is not available on this device.");
          }
        } catch (error) {
          console.error("Socials share error:", error);
          Alert.alert("Error", `Failed to share to Instagram: ${error.message}`);
        } finally {
          setIsCapturing(false);
        }
      }, 1000); // Delay in milliseconds
    } catch (error) {
      console.error("Socials share error:", error);
      Alert.alert("Error", "Failed to share to Instagram.");
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
            <StatusBar barStyle="dark-content" />

            {/* Controls at top */}
            {!isPreviewMode && (
              <View style={styles.topControlsContainer}>
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
                {/* Hidden text for capture - only visible during capture */}
                {isCapturing && text.length > 0 ? (
                  <View
                    ref={captureTextRef}
                    style={[styles.captureContainer, { backgroundColor: currentBackgroundColor }]}
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
                ) : !startedWriting ? (
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
                  >
                    [start writing]
                  </Text>
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
                    placeholder=""
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
              <View
                style={[
                  styles.previewContainerOverlay,
                  {
                    backgroundColor: currentBackgroundColor,
                    height: previewHeight,
                    top: Dimensions.get("window").height / 2 - previewHeight / 2, // Center vertically on screen
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
  previewContainerOverlay: {
    position: "absolute",
    // width: Dimensions.get("window").width * 0.9, // 90% of screen width in pixels
    // left: Dimensions.get("window").width * 0.05, // 5% margin on left in pixels
    paddingTop: "5%",
    paddingBottom: "5%",
    borderRadius: 0,
    // No paddingHorizontal - already handled by container positioning
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
    paddingTop: 50, // Account for status bar in pixels
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
