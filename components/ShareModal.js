import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { saveImageForSharing } from "../utils/fileUtils";
import styles from "../styles/AppStyles";

const ShareModal = ({
  visible,
  imageToShare,
  galleryImages,
  captureTextRef,
  onClose,
  onCopyImage,
  restoreImageFromGallery,
}) => {
  if (!visible || !imageToShare) {
    return null;
  }

  const handleSaveToPhotos = async () => {
    onClose();
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
  };

  const handleCopyToClipboard = () => {
    onClose();
    onCopyImage(imageToShare.id);
  };

  const handleShareViaApps = async () => {
    onClose();
    try {
      if (await Sharing.isAvailableAsync()) {
        // Check if the stored file exists and is accessible
        const fileInfo = await FileSystem.getInfoAsync(imageToShare.path);
        let shareUri = imageToShare.path;

        if (fileInfo.exists) {
          // File exists, save it with meaningful filename for sharing
          const existingFilenames = galleryImages.map((img) => img.filename);
          shareUri = await saveImageForSharing(
            imageToShare.path,
            imageToShare.text,
            existingFilenames
          );
        } else {
          // File doesn't exist, recreate by restoring the image and capturing it
          restoreImageFromGallery(imageToShare);

          // Wait a moment for the image to render, then capture it
          await new Promise((resolve) => setTimeout(resolve, 100));

          let capturedUri;
          try {
            capturedUri = await captureRef(captureTextRef, {
              format: "jpg",
              quality: 1.0,
            });
          } catch (captureError) {
            if (
              captureError?.message?.includes("drawViewHierarchyInRect") ||
              captureError?.code === "EUNSPECIFIED"
            ) {
              throw new Error(
                "The text is too large to share. Try reducing the text size or using less text."
              );
            } else {
              throw captureError;
            }
          }

          // Save the captured image with meaningful filename
          const existingFilenames = galleryImages.map((img) => img.filename);
          shareUri = await saveImageForSharing(capturedUri, imageToShare.text, existingFilenames);
        }

        await Sharing.shareAsync(shareUri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share your text image",
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", `Failed to share image: ${error.message || error.toString()}`);
    }
  };

  return (
    <View style={styles.shareModalOverlay}>
      <View style={styles.shareModalContainer}>
        <Text style={styles.shareModalTitle}>Share Image</Text>
        <Text style={styles.shareModalMessage}>Choose how to share your image:</Text>
        <View style={styles.shareModalButtons}>
          <TouchableOpacity
            style={[styles.shareModalButton, styles.shareOptionButton]}
            onPress={handleSaveToPhotos}
          >
            <Text style={styles.shareOptionText}>Save to Photos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareModalButton, styles.shareOptionButton]}
            onPress={handleCopyToClipboard}
          >
            <Text style={styles.shareOptionText}>Copy to Clipboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareModalButton, styles.shareOptionButton]}
            onPress={handleShareViaApps}
          >
            <Text style={styles.shareOptionText}>Share via Apps</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shareModalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ShareModal;
