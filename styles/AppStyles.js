import { StyleSheet, Dimensions } from "react-native";
import { GOLDEN_COLOR } from "../constants/colors";

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
    minHeight: 50, // Minimum height in pixels
    justifyContent: "flex-start",
  },
  captureText: {
    textAlignVertical: "top",
    flex: 0,
  },
  watermark: {
    fontSize: 12, // Watermark text size in pixels
    textAlign: "center",
    marginTop: 20, // Minimum top margin from text in pixels
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
  sizeIcon: {
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
    alignItems: "flex-start",
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

  // Info modal styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent black overlay
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1004, // Above all other modals
  },
  infoModalContainer: {
    backgroundColor: "#FFFFFF", // White background
    borderRadius: 12, // Corner radius in pixels
    padding: 20, // Container padding in pixels
    margin: 20, // Container margin in pixels
    maxWidth: 350, // Maximum width in pixels
    width: "85%",
    maxHeight: "70%",
  },
  infoModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15, // Bottom margin in pixels
  },
  infoModalTitle: {
    fontSize: 18, // Title text size in pixels
    fontWeight: "bold",
    color: "#000000", // Black text
  },
  infoModalCloseButton: {
    padding: 8, // Button padding in pixels
    borderRadius: 15, // Corner radius in pixels
    backgroundColor: "#E0E0E0", // Light gray background
    width: 30, // Button width in pixels
    height: 30, // Button height in pixels
    justifyContent: "center",
    alignItems: "center",
  },
  infoModalCloseButtonText: {
    color: "#333333", // Dark gray text
    fontSize: 16, // Font size in pixels
    fontWeight: "bold",
  },
  infoModalContent: {
    maxHeight: "100%",
  },
  infoField: {
    marginBottom: 12, // Bottom margin in pixels
    paddingBottom: 8, // Bottom padding in pixels
    borderBottomWidth: 1, // Border thickness in pixels
    borderBottomColor: "#E0E0E0", // Light gray border
  },
  infoFieldLabel: {
    fontSize: 14, // Label text size in pixels
    fontWeight: "600",
    color: "#666666", // Gray text
    marginBottom: 4, // Bottom margin in pixels
  },
  infoFieldValue: {
    fontSize: 16, // Value text size in pixels
    color: "#000000", // Black text
    lineHeight: 20, // Line height in pixels
  },
  infoFieldValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoColorSquare: {
    width: 20, // Square width in pixels
    height: 20, // Square height in pixels
    marginRight: 8, // Right margin in pixels
    borderWidth: 1, // Border thickness in pixels
    borderColor: "#CCCCCC", // Light gray border
    borderRadius: 2, // Corner radius in pixels
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

export default styles;
