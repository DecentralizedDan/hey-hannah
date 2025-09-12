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
  ActionSheetIOS,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
// Using FileSystem for simple JSON storage

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

const GOLDEN_COLOR = "#FFCC02";

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
  const [currentView, setCurrentView] = useState("create"); // 'create' or 'gallery'
  const [galleryImages, setGalleryImages] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [imageToShare, setImageToShare] = useState(null);
  const [activeImageId, setActiveImageId] = useState(null); // Track which gallery image is currently being edited
  const [gallerySortMode, setGallerySortMode] = useState("newest");
  const [isTransitioning, setIsTransitioning] = useState(false); // 'newest', 'oldest', 'random'
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

  const toggleGallerySortMode = () => {
    setGallerySortMode((prev) => {
      if (prev === "newest") return "oldest";
      if (prev === "oldest") return "random";
      return "newest"; // from random back to newest
    });
  };

  const currentAlignment = ALIGNMENTS[alignment];
  const currentBackgroundColor = COLOR_VALUES[COLORS[backgroundColorIndex]];
  const currentFontFamily =
    FONT_FAMILIES[fontFamily] === "System" ? undefined : FONT_FAMILIES[fontFamily];
  const currentTextColor = COLOR_VALUES[COLORS[textColorIndex]];

  // Create sorted gallery images based on current sort mode
  const getSortedGalleryImages = () => {
    const imagesCopy = [...galleryImages];

    switch (gallerySortMode) {
      case "oldest":
        return imagesCopy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
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
      Alert.alert("No Text", "Please write something before sharing.");
      return;
    }

    Alert.alert("Share Text Image", "How will you share your text:", [
      { text: "Cancel", style: "cancel" },
      { text: "Save", onPress: saveToPhotos },
      { text: "Copy", onPress: copyImageToClipboard },
      { text: "Share", onPress: shareAsMessage },
    ]);
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

          // Update metadata with new timestamp and current date
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
            createdAt: new Date().toISOString(), // Update to current date
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
    // Set transitioning state to hide content during switch
    setIsTransitioning(true);

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

  const showImageActionSheet = (image) => {
    const favoriteOption = image.isFavorited ? "Unfavorite" : "Favorite";

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [favoriteOption, "Duplicate", "Copy", "Share", "Delete", "Cancel"],
        destructiveButtonIndex: 4, // Delete option
        cancelButtonIndex: 5,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0: // Favorite/Unfavorite
            toggleFavoriteImage(image.id);
            break;
          case 1: // Duplicate
            duplicateImageInGallery(image.id);
            break;
          case 2: // Copy
            copyImageFromGallery(image.id);
            break;
          case 3: // Share
            showShareModal(image);
            break;
          case 4: // Delete
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
                {startedWriting && text.trim() && (
                  <TouchableOpacity onPress={handleNewImage}>
                    <Text style={styles.navigationText}>New</Text>
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
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
