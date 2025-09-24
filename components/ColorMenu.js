import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  Animated,
  Dimensions,
} from "react-native";
import { COLORS, ALL_COLORS } from "../constants/colors";
import { generateShadesWithExistingColors } from "../utils/colorUtils";
import styles from "../styles/AppStyles";

const ColorMenu = ({
  colorMenuVisible,
  shadeMenuVisible,
  colorMenuAnimation,
  colorMenuType,
  shadeMenuColor,
  highlightedRow,
  highlightedColumn,
  bgColorMode,
  bgColorModeSelection,
  textColorMode,
  textColorModeSelection,
  onClose,
  onCloseShadeSelector,
  onDismissShadeSelector,
  onSelectColorVariation,
  onSelectPalette,
  onSelectDirectColor,
  onSelectShadeColor,
  onRowSelect,
  onColumnSelect,
  onOpenShadeSelector,
}) => {
  if (!colorMenuVisible && !shadeMenuVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.colorMenuOverlay,
        {
          transform: [
            {
              translateY: colorMenuAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [Dimensions.get("window").width, 0], // Slide up from bottom in pixels
              }),
            },
          ],
        },
      ]}
    >
      <TouchableWithoutFeedback onPress={shadeMenuVisible ? onDismissShadeSelector : onClose}>
        <View style={styles.colorMenuBackground} />
      </TouchableWithoutFeedback>

      <View style={styles.colorMenuContainer}>
        {/* 9x9 Grid */}
        <View style={styles.colorGrid}>
          {/* Top row: empty corner + down arrows */}
          <View style={styles.colorGridRow}>
            {/* Exit/Back button in top-left corner */}
            <TouchableOpacity
              style={[styles.colorCell, styles.exitCell]}
              onPress={shadeMenuVisible ? onCloseShadeSelector : onClose}
            >
              <Text style={styles.exitText}>{shadeMenuVisible ? "←" : "×"}</Text>
            </TouchableOpacity>

            {/* Radio buttons for color variations or shade columns */}
            {!shadeMenuVisible
              ? // Regular color variation radio buttons
                COLORS.map((_, colorIndex) => (
                  <TouchableOpacity
                    key={`radio-column-${colorIndex}`}
                    style={[styles.colorCell, styles.radioCell]}
                    onPress={() => onSelectColorVariation(colorIndex)}
                  >
                    <View style={styles.radioButton}>
                      <View
                        style={[
                          styles.radioButtonInner,
                          (colorMenuType === "background" &&
                            bgColorMode === "variations" &&
                            bgColorModeSelection === colorIndex) ||
                          (colorMenuType === "text" &&
                            textColorMode === "variations" &&
                            textColorModeSelection === colorIndex)
                            ? styles.radioButtonSelected
                            : null,
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                ))
              : // Shade selector column radio buttons (8 columns)
                Array.from({ length: 8 }, (_, columnIndex) => (
                  <TouchableOpacity
                    key={`shade-column-${columnIndex}`}
                    style={[styles.colorCell, styles.radioCell]}
                    onPress={() => onColumnSelect(columnIndex)}
                  >
                    <View style={styles.radioButton}>
                      <View
                        style={[
                          styles.radioButtonInner,
                          highlightedColumn === columnIndex ? styles.radioButtonSelected : null,
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
          </View>

          {/* 8 rows of colors or shades */}
          {!shadeMenuVisible
            ? // Regular palette rows
              ALL_COLORS.map((palette, paletteIndex) => (
                <View key={`palette-${paletteIndex}`} style={styles.colorGridRow}>
                  {/* Radio button for palette selection */}
                  <TouchableOpacity
                    style={[styles.colorCell, styles.radioCell]}
                    onPress={() => onSelectPalette(paletteIndex)}
                  >
                    <View style={styles.radioButton}>
                      <View
                        style={[
                          styles.radioButtonInner,
                          (colorMenuType === "background" &&
                            bgColorMode === "palette" &&
                            bgColorModeSelection === paletteIndex) ||
                          (colorMenuType === "text" &&
                            textColorMode === "palette" &&
                            textColorModeSelection === paletteIndex)
                            ? styles.radioButtonSelected
                            : null,
                        ]}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* 8 colors in this palette with row highlight overlay */}
                  <View style={styles.colorRowContainer}>
                    {palette.map((color, colorIndex) => (
                      <TouchableOpacity
                        key={`color-${paletteIndex}-${colorIndex}`}
                        style={[styles.colorCell, { backgroundColor: color }]}
                        onPress={() => onSelectDirectColor(paletteIndex, colorIndex)}
                        onLongPress={() => onOpenShadeSelector(color, colorIndex)}
                      />
                    ))}

                    {/* Row highlight overlay */}
                    {highlightedRow === paletteIndex && (
                      <View style={styles.rowHighlight} pointerEvents="none" />
                    )}
                  </View>
                </View>
              ))
            : // Shade selector rows
              (() => {
                // Find the color index from COLORS array based on shadeMenuColor
                let colorIndex = 0;
                let found = false;
                for (let i = 0; i < COLORS.length && !found; i++) {
                  // Check if any palette contains this color at this index
                  for (let j = 0; j < ALL_COLORS.length; j++) {
                    if (ALL_COLORS[j][i] === shadeMenuColor) {
                      colorIndex = i;
                      found = true;
                      break;
                    }
                  }
                }

                const shadeGrid = generateShadesWithExistingColors(shadeMenuColor, colorIndex);

                return shadeGrid.map((shadeRow, rowIndex) => (
                  <View key={`shade-row-${rowIndex}`} style={styles.colorGridRow}>
                    {/* Radio button for shade row selection */}
                    <TouchableOpacity
                      style={[styles.colorCell, styles.radioCell]}
                      onPress={() => onRowSelect(rowIndex)}
                    >
                      <View style={styles.radioButton}>
                        <View
                          style={[
                            styles.radioButtonInner,
                            highlightedRow === rowIndex ? styles.radioButtonSelected : null,
                          ]}
                        />
                      </View>
                    </TouchableOpacity>

                    {/* 8 shade colors in this row with highlight overlay */}
                    <View style={styles.colorRowContainer}>
                      {shadeRow.map((shade, colIndex) => (
                        <TouchableOpacity
                          key={`shade-${rowIndex}-${colIndex}`}
                          style={[styles.colorCell, { backgroundColor: shade }]}
                          onPress={() => onSelectShadeColor(shade, rowIndex)}
                        />
                      ))}

                      {/* Row highlight overlay */}
                      {highlightedRow === rowIndex && (
                        <View style={styles.rowHighlight} pointerEvents="none" />
                      )}
                    </View>
                  </View>
                ));
              })()}

          {/* Column highlight overlays */}
          {highlightedColumn !== -1 && (
            <View style={styles.columnHighlightContainer} pointerEvents="none">
              <View
                style={[
                  styles.columnHighlight,
                  {
                    left: (Dimensions.get("window").width / 9) * (highlightedColumn + 1), // Skip first column (arrows) in pixels
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

export default ColorMenu;
