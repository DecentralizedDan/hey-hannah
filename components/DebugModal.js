import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import styles from "../styles/AppStyles";
import { COLOR_VALUES } from "../constants/colors";

const DebugModal = ({ visible, imageToDebug, onClose }) => {
  if (!imageToDebug) return null;

  const debugFields = [
    { key: "backgroundColor", label: "Background Color" },
    { key: "backgroundPalette", label: "Background Palette" },
    { key: "textColor", label: "Text Color" },
    { key: "textPalette", label: "Text Palette" },
    { key: "alignment", label: "Alignment" },
    { key: "fontFamily", label: "Font Family" },
    { key: "fontSize", label: "Font Size" },
    { key: "createdAt", label: "Created At" },
  ];

  const getActualColor = (colorValue) => {
    if (!colorValue) return null;
    if (colorValue.startsWith("#")) return colorValue;
    return COLOR_VALUES[colorValue] || colorValue;
  };

  const formatValue = (key, value) => {
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
        <View style={styles.debugFieldValueContainer}>
          <View style={[styles.debugColorSquare, { backgroundColor: actualColor }]} />
          <Text style={styles.debugFieldValue}>{formattedValue}</Text>
        </View>
      );
    }

    return <Text style={styles.debugFieldValue}>{formattedValue}</Text>;
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.debugModalContainer}>
          <View style={styles.debugModalHeader}>
            <Text style={styles.debugModalTitle}>Debug Info</Text>
            <TouchableOpacity style={styles.debugModalCloseButton} onPress={onClose}>
              <Text style={styles.debugModalCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.debugModalContent}>
            {debugFields.map(({ key, label }) => (
              <View key={key} style={styles.debugField}>
                <Text style={styles.debugFieldLabel}>{label}:</Text>
                {renderFieldValue(key, imageToDebug[key])}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default DebugModal;
