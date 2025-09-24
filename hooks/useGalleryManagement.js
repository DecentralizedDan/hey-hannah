import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { COLORS } from "../constants/colors";
import { generateFilename } from "../utils/fileUtils";

export const useGalleryManagement = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [activeImageId, setActiveImageId] = useState(null);
  const [gallerySortMode, setGallerySortMode] = useState("newest");

  // Load gallery images
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

  const toggleGallerySortMode = () => {
    setGallerySortMode((prev) => {
      if (prev === "newest") return "favorites";
      if (prev === "favorites") return "oldest";
      if (prev === "oldest") return "random";
      return "newest"; // from random back to newest
    });
  };

  const createNewImageMetadata = (
    text,
    backgroundColorIndex,
    textColorIndex,
    alignment,
    fontFamily,
    fontSize,
    previewHeight
  ) => {
    const existingFilenames = galleryImages.map((img) => img.filename);
    const filename = generateFilename(text, existingFilenames);
    const timestamp = Date.now();

    return {
      id: timestamp,
      filename,
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
  };

  const deleteImageFromGallery = async (imageId) => {
    try {
      // Find the image to delete
      const imageToDelete = galleryImages.find((img) => img.id === imageId);
      if (!imageToDelete) return false;

      // Delete the image file
      const fileInfo = await FileSystem.getInfoAsync(imageToDelete.path);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(imageToDelete.path);
      }

      // Update gallery list
      const updatedImages = galleryImages.filter((img) => img.id !== imageId);
      setGalleryImages(updatedImages);

      // Save updated list to FileSystem
      const galleryMetadataPath = FileSystem.documentDirectory + "gallery/metadata.json";
      await FileSystem.writeAsStringAsync(galleryMetadataPath, JSON.stringify(updatedImages));

      return true;
    } catch (error) {
      if (__DEV__) console.error("Failed to delete image:", error);
      return false;
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

      return true;
    } catch (error) {
      if (__DEV__) console.error("Failed to toggle favorite:", error);
      return false;
    }
  };

  // Load gallery on mount
  useEffect(() => {
    loadGalleryImages();
  }, []);

  return {
    galleryImages,
    setGalleryImages,
    activeImageId,
    setActiveImageId,
    gallerySortMode,
    setGallerySortMode,
    loadGalleryImages,
    getSortedGalleryImages,
    toggleGallerySortMode,
    createNewImageMetadata,
    deleteImageFromGallery,
    toggleFavoriteImage,
  };
};
