import React from "react";
import {
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import styles from "../styles/AppStyles";

const PreviewOverlay = ({
  isPreviewMode,
  previewReturnView,
  text,
  fontSize,
  currentAlignment,
  currentFontFamily,
  currentBackgroundColor,
  currentTextColor,
  previewHeight,
  onExitPreview,
  onEditFromPreview,
  onShareFromPreview,
}) => {
  if (!isPreviewMode) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={onExitPreview}>
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
                    onExitPreview(); // This will return to gallery
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
                    onEditFromPreview();
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
                  onShareFromPreview();
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
                  onExitPreview();
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
                  onShareFromPreview();
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
  );
};

export default PreviewOverlay;
