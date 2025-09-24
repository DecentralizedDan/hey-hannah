import React from "react";
import { View, TouchableOpacity, Pressable, Text } from "react-native";
import { ALIGNMENTS } from "../constants/colors";
import styles from "../styles/AppStyles";

const TopControls = ({
  currentBackgroundColor,
  currentTextColor,
  currentAlignment,
  isHoldingPreview,
  onCycleBackgroundColor,
  onOpenBackgroundColorMenu,
  onCycleTextColor,
  onOpenTextColorMenu,
  onCycleFontFamily,
  onCycleAlignment,
  onTogglePreview,
  onPreviewPressIn,
  onPreviewPressOut,
  onShare,
}) => {
  return (
    <View style={[styles.topControlsContainer, { paddingTop: 20 }]}>
      {/* Background color control */}
      <TouchableOpacity
        style={styles.controlButton}
        onPress={onCycleBackgroundColor}
        onLongPress={onOpenBackgroundColorMenu}
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
        onPress={onCycleTextColor}
        onLongPress={onOpenTextColorMenu}
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
      <TouchableOpacity style={styles.controlButton} onPress={onCycleFontFamily}>
        <View style={[styles.fontIcon, { borderColor: "#FFFFFF" }]}>
          <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>Aa</Text>
        </View>
        <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>FONT</Text>
      </TouchableOpacity>

      {/* Alignment control */}
      <TouchableOpacity style={styles.controlButton} onPress={onCycleAlignment}>
        <View style={[styles.alignmentIcon, { borderColor: "#FFFFFF" }]}>
          <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>
            {currentAlignment === "left" ? "←" : currentAlignment === "center" ? "↔" : "→"}
          </Text>
        </View>
        <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>ALIGN</Text>
      </TouchableOpacity>

      {/* Preview control */}
      <Pressable
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
      <TouchableOpacity style={styles.controlButton} onPress={onShare}>
        <View style={[styles.shareIcon, { borderColor: "#FFFFFF" }]}>
          <Text style={[styles.alignmentText, { color: "#FFFFFF" }]}>↗</Text>
        </View>
        <Text style={[styles.controlLabel, { color: "#FFFFFF" }]}>SHARE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TopControls;
