import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
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

export default function App() {
  const baseSize = 32; // font size in pixels

  const [text, setText] = useState("");
  const [backgroundColorIndex, setBackgroundColorIndex] = useState(0);
  const [textColorIndex, setTextColorIndex] = useState(0);
  const [alignment, setAlignment] = useState(0); // 0=left, 1=center, 2=right
  const [fontSize, setFontSize] = useState(baseSize);
  const [isCapturing, setIsCapturing] = useState(false);
  const [textHeight, setTextHeight] = useState(0);
  const blinkAnimation = new Animated.Value(0.5);
  const textInputRef = React.useRef(null);
  const textAreaRef = useRef(null);
  const captureTextRef = useRef(null);

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
    const maxLength = 500;

    if (text.length === 0) {
      setFontSize(baseSize);
      return;
    }

    // Do not shrink font size until textLength exceeds 2 * (maxLength / 2)
    const shrinkThreshold = maxLength * 0.75;
    let calculatedSize;
    if (textLength <= shrinkThreshold) {
      calculatedSize = baseSize;
    } else {
      calculatedSize =
        baseSize -
        ((textLength - shrinkThreshold) / (maxLength - shrinkThreshold)) * (baseSize - minSize);
      calculatedSize = Math.max(minSize, Math.min(baseSize, calculatedSize));
    }

    setFontSize(Math.round(calculatedSize));
  }, [text]);

  // Blinking animation for placeholder
  useEffect(() => {
    const blink = () => {
      Animated.sequence([
        Animated.timing(blinkAnimation, {
          toValue: 0.1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnimation, {
          toValue: 0.75, // Back to 75%
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => blink());
    };

    if (text.length === 0) {
      blink();
    } else {
      blinkAnimation.setValue(0.5);
    }
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

  const currentBackgroundColor = COLOR_VALUES[COLORS[backgroundColorIndex]];
  const currentTextColor = COLOR_VALUES[COLORS[textColorIndex]];
  const currentAlignment = ALIGNMENTS[alignment];

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const measureTextHeight = () => {
    return new Promise((resolve) => {
      if (captureTextRef.current) {
        captureTextRef.current.measure((x, y, width, height) => {
          resolve(height);
        });
      } else {
        resolve(0);
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
          const padding = Dimensions.get("window").width * 0.1; // 5% padding on each side
          const captureHeight = Math.max(measuredHeight + padding, 200); // Minimum height of 200

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
          const padding = Dimensions.get("window").width * 0.1; // 5% padding on each side
          const captureHeight = Math.max(measuredHeight + padding, 200); // Minimum height of 200

          const uri = await captureRef(captureTextRef.current, {
            format: "jpg",
            quality: 1.0,
            result: "tmpfile",
            height: captureHeight,
          });

          console.log("Captured image URI:", uri);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.flex}>
          <StatusBar barStyle="dark-content" />

          {/* Controls at top */}
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

            {/* Alignment control */}
            <TouchableOpacity style={styles.controlButton} onPress={cycleAlignment}>
              <View style={[styles.alignmentIcon, { borderColor: "#FFFFFF" }]}>
                <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>
                  {currentAlignment === "left" ? "⫷" : currentAlignment === "center" ? "⫸" : "⫸"}
                </Text>
              </View>
              <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>ALIGN</Text>
            </TouchableOpacity>

            {/* Share control */}
            <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
              <View style={[styles.shareIcon, { borderColor: "#FFFFFF" }]}>
                <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>↗</Text>
              </View>
              <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>SHARE</Text>
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
          </View>

          {/* Main text area */}
          <View
            ref={textAreaRef}
            style={[styles.textContainer, { backgroundColor: currentBackgroundColor }]}
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
                    },
                  ]}
                >
                  {text}
                </Text>
              </View>
            ) : text.length === 0 ? (
              <Animated.Text
                style={[
                  styles.placeholderText,
                  {
                    color: currentTextColor,
                    fontSize: fontSize,
                    textAlign: currentAlignment,
                    opacity: blinkAnimation,
                  },
                ]}
              >
                [start writing]
              </Animated.Text>
            ) : null}

            {/* TextInput for user interaction - hidden during capture */}
            <TextInput
              ref={textInputRef}
              style={[
                styles.textInput,
                {
                  color: isCapturing ? "transparent" : currentTextColor,
                  fontSize: fontSize,
                  textAlign: currentAlignment,
                },
              ]}
              value={text}
              onChangeText={setText}
              placeholder=""
              multiline
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              textAlignVertical="top"
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  },
  topControlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 50, // Account for status bar
    backgroundColor: "#000000", // Black background for controls
  },
  controlButton: {
    alignItems: "center",
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 5,
  },
  alignmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  shareIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  alignmentText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  controlLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
