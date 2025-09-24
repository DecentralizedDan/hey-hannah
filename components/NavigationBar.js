import React from "react";
import { View, TouchableOpacity, Pressable, Text } from "react-native";
import styles from "../styles/AppStyles";

const NavigationBar = ({
  currentView,
  insets,
  startedWriting,
  text,
  showUndo,
  activeImageId,
  gallerySortMode,
  isHoldingNew,
  onGalleryView,
  onNewImage,
  onNewPressIn,
  onNewPressOut,
  onUndo,
  onToggleGallerySortMode,
  onEditView,
}) => {
  if (currentView === "create") {
    return (
      <View style={[styles.navigationContainer, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onGalleryView}>
          <Text style={styles.navigationText}>Gallery</Text>
        </TouchableOpacity>
        {startedWriting && text.trim() && !showUndo && (
          <Pressable onPress={onNewImage} onPressIn={onNewPressIn} onPressOut={onNewPressOut}>
            <Text
              style={[
                styles.navigationText,
                {
                  backgroundColor: isHoldingNew ? "rgba(255, 204, 2, 0.2)" : "transparent",
                },
              ]}
            >
              New
            </Text>
          </Pressable>
        )}
        {showUndo && (
          <TouchableOpacity onPress={onUndo}>
            <Text style={styles.navigationText}>Undo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (currentView === "gallery") {
    return (
      <View style={[styles.navigationContainer, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={onToggleGallerySortMode}>
          <Text style={styles.navigationText}>
            {gallerySortMode === "newest"
              ? "Newest"
              : gallerySortMode === "oldest"
              ? "Oldest"
              : gallerySortMode === "favorites"
              ? "Favorites"
              : "Random"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onEditView}>
          <Text style={styles.navigationText}>{activeImageId ? "Edit" : "New"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

export default NavigationBar;
