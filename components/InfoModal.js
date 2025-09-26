import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import * as FileSystem from "expo-file-system";
import styles from "../styles/AppStyles";
import { COLOR_VALUES } from "../constants/colors";

const InfoModal = ({ visible, imageToInfo, onClose }) => {
  const [fileSize, setFileSize] = useState(null);

  const getFileSize = async (filePath) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists && fileInfo.size !== undefined) {
        return fileInfo.size;
      }
      return null;
    } catch (error) {
      console.error("Error getting file size:", error);
      return null;
    }
  };

  // All hooks must be called before any early returns
  useEffect(() => {
    const fetchFileSize = async () => {
      if (imageToInfo && imageToInfo.path) {
        const size = await getFileSize(imageToInfo.path);
        setFileSize(size);
      }
    };

    if (visible && imageToInfo) {
      fetchFileSize();
    } else {
      setFileSize(null); // Reset when modal is closed
    }
  }, [visible, imageToInfo]);

  if (!imageToInfo) return null;

  const debugFields = [
    { key: "backgroundColor", label: "Background Color" },
    { key: "backgroundPalette", label: "Background Palette" },
    { key: "textColor", label: "Text Color" },
    { key: "textPalette", label: "Text Palette" },
    { key: "alignment", label: "Alignment" },
    { key: "fontFamily", label: "Font Family" },
    { key: "fontSize", label: "Font Size" },
    { key: "fileSize", label: "File Size" },
    { key: "createdAt", label: "Created At" },
  ];

  const formatFileSize = (bytes) => {
    if (bytes === null || bytes === undefined) return "N/A";
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getActualColor = (colorValue) => {
    if (!colorValue) return null;
    if (colorValue.startsWith("#")) return colorValue;
    return COLOR_VALUES[colorValue] || colorValue;
  };

  const formatValue = (key, value) => {
    if (key === "fileSize") {
      return formatFileSize(fileSize);
    }

    if (value === null || value === undefined) {
      return "N/A";
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (key === "createdAt") {
      return new Date(value).toLocaleString();
    }

    return String(value);
  };

  const renderFieldValue = (key, value) => {
    const isColorField = key === "backgroundColor" || key === "textColor";
    const formattedValue = formatValue(key, value);

    if (isColorField && value) {
      const actualColor = getActualColor(value);
      return (
        <View style={styles.infoFieldValueContainer}>
          <View style={[styles.infoColorSquare, { backgroundColor: actualColor }]} />
          <Text style={styles.infoFieldValue}>{formattedValue}</Text>
        </View>
      );
    }

    return <Text style={styles.infoFieldValue}>{formattedValue}</Text>;
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.infoModalContainer}>
          <View style={styles.infoModalHeader}>
            <Text style={styles.infoModalTitle}>Info</Text>
            <TouchableOpacity style={styles.infoModalCloseButton} onPress={onClose}>
              <Text style={styles.infoModalCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.infoModalContent}>
            {debugFields.map(({ key, label }) => (
              <View key={key} style={styles.infoField}>
                <Text style={styles.infoFieldLabel}>{label}:</Text>
                {renderFieldValue(key, imageToInfo[key])}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default InfoModal;
