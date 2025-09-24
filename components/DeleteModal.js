import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "../styles/AppStyles";

const DeleteModal = ({ visible, imageToDelete, onConfirm, onCancel }) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.deleteModalOverlay}>
      <View style={styles.deleteModalContainer}>
        <Text style={styles.deleteModalTitle}>Delete Image</Text>
        <Text style={styles.deleteModalMessage}>This action cannot be undone.</Text>
        <View style={styles.deleteModalButtons}>
          <TouchableOpacity
            style={[styles.deleteModalButton, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteModalButton, styles.confirmButton]}
            onPress={() => onConfirm(imageToDelete?.id)}
          >
            <Text style={styles.confirmButtonText}>Yes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DeleteModal;
