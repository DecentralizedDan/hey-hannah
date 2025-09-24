import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { COLORS, COLOR_VALUES, ALIGNMENTS } from "../constants/colors";
import { FONT_FAMILIES } from "../constants/fonts";
import styles from "../styles/AppStyles";

const GalleryView = ({
  sortedGalleryImages,
  activeImageId,
  backgroundColorIndex,
  textColorIndex,
  alignment,
  fontFamily,
  fontSize,
  text,
  onImageSelection,
  onImageActionSheet,
}) => {
  return (
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
                    onPress={() => onImageSelection(image)}
                    onLongPress={() => onImageActionSheet(image)}
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
                              (activeImageId === image.id ? fontSize : image.fontSize) * 0.21, // Precisely tuned to match original character density
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
  );
};

export default GalleryView;
