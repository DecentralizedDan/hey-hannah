import React, { useRef } from "react";
import { View, TouchableOpacity, Pressable, Text } from "react-native";
import { ALIGNMENTS } from "../constants/colors";
import styles from "../styles/AppStyles";

const TopControls = ({
  currentBackgroundColor,
  currentTextColor,
  currentAlignment,
  currentTextSizeLabel,
  isHoldingPreview,
  onCycleBackgroundColor,
  onOpenBackgroundColorMenu,
  onCycleTextColor,
  onOpenTextColorMenu,
  onCycleFontFamily,
  onCycleTextSize,
  onCycleAlignment,
  onTogglePreview,
  onPreviewPressIn,
  onPreviewPressOut,
  onShare,
}) => {
  const bgLongPressTimer = useRef(null);
  const textLongPressTimer = useRef(null);
  const bgLongPressFired = useRef(false);
  const textLongPressFired = useRef(false);

  const handleBgPressIn = () => {
    bgLongPressFired.current = false;
    bgLongPressTimer.current = setTimeout(() => {
      bgLongPressFired.current = true;
      onOpenBackgroundColorMenu();
    }, 500);
  };

  const handleBgPressOut = () => {
    if (bgLongPressTimer.current) {
      clearTimeout(bgLongPressTimer.current);
      bgLongPressTimer.current = null;

      // Only cycle color if long press didn't fire (i.e., it was a short press)
      if (!bgLongPressFired.current) {
        onCycleBackgroundColor();
      }
    }
  };

  const handleTextPressIn = () => {
    textLongPressFired.current = false;
    textLongPressTimer.current = setTimeout(() => {
      textLongPressFired.current = true;
      onOpenTextColorMenu();
    }, 500);
  };

  const handleTextPressOut = () => {
    if (textLongPressTimer.current) {
      clearTimeout(textLongPressTimer.current);
      textLongPressTimer.current = null;

      // Only cycle color if long press didn't fire (i.e., it was a short press)
      if (!textLongPressFired.current) {
        onCycleTextColor();
      }
    }
  };

  return (
    <View style={[styles.topControlsContainer, { paddingTop: 20 }]}>
      {/* Background color control */}
      <Pressable
        testID="bg-color-control"
        style={styles.controlButton}
        onPressIn={handleBgPressIn}
        onPressOut={handleBgPressOut}
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
      </Pressable>

      {/* Text color control */}
      <Pressable
        testID="text-color-control"
        style={styles.controlButton}
        onPressIn={handleTextPressIn}
        onPressOut={handleTextPressOut}
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
      </Pressable>

      {/* Font family control */}
      <TouchableOpacity testID="font-control" style={styles.controlButton} onPress={onCycleFontFamily}>
        <View style={[styles.fontIcon, { borderColor: "#FFFFFF" }]}>
          <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>Aa</Text>
        </View>
        <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>FONT</Text>
      </TouchableOpacity>

      {/* Text size control */}
      <TouchableOpacity testID="size-control" style={styles.controlButton} onPress={onCycleTextSize}>
        <View style={[styles.sizeIcon, { borderColor: "#FFFFFF" }]}>
          <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>{currentTextSizeLabel}</Text>
        </View>
        <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>SIZE</Text>
      </TouchableOpacity>

      {/* Alignment control */}
      <TouchableOpacity testID="alignment-control" style={styles.controlButton} onPress={onCycleAlignment}>
        <View style={[styles.alignmentIcon, { borderColor: "#FFFFFF" }]}>
          <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>
            {currentAlignment === "left" ? "←" : currentAlignment === "center" ? "↔" : "→"}
          </Text>
        </View>
        <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>ALIGN</Text>
      </TouchableOpacity>

      {/* Preview control */}
      <Pressable
        testID="preview-control"
        style={styles.controlButton}
        onPress={onTogglePreview}
        onPressIn={onPreviewPressIn}
        onPressOut={onPreviewPressOut}
      >
        <View
          style={[
            styles.previewIcon,
            {
              borderColor: "#FFFFFF",
              backgroundColor: isHoldingPreview ? "rgba(255, 255, 255, 0.2)" : "transparent",
            },
          ]}
        >
          <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>📄</Text>
        </View>
        <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>PREVIEW</Text>
      </Pressable>

      {/* Share control */}
      <TouchableOpacity testID="share-control" style={styles.controlButton} onPress={onShare}>
        <View style={[styles.shareIcon, { borderColor: "#FFFFFF" }]}>
          <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>↗</Text>
        </View>
        <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>SHARE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TopControls;
