import React, { forwardRef } from "react";
import { Text } from "react-native";
import { getSizeValue } from "../constants/textSizing";

/**
 * SegmentedText component renders text with mixed font sizes
 * Each segment can have its own size while maintaining consistent styling
 */
const SegmentedText = forwardRef(
  (
    { segments = [], magnification = 1.0, style = {}, numberOfLines, onLayout, ...textProps },
    ref
  ) => {
    // If no segments, render empty text
    if (!segments || segments.length === 0) {
      return (
        <Text
          ref={ref}
          style={style}
          numberOfLines={numberOfLines}
          onLayout={onLayout}
          {...textProps}
        >
          {""}
        </Text>
      );
    }

    // If only one segment, render as simple Text component
    if (segments.length === 1) {
      const segment = segments[0];
      const fontSize = getSizeValue(segment.size, magnification);
      const validFontSize =
        fontSize && !isNaN(fontSize) && isFinite(fontSize) && fontSize > 0 ? fontSize : 32;

      return (
        <Text
          ref={ref}
          style={[style, { fontSize: validFontSize }]}
          numberOfLines={numberOfLines}
          onLayout={onLayout}
          {...textProps}
        >
          {segment.text}
        </Text>
      );
    }

    // Multiple segments - render nested Text components
    // The outer Text provides base styling, inner Text components provide size overrides
    return (
      <Text
        ref={ref}
        style={style}
        numberOfLines={numberOfLines}
        onLayout={onLayout}
        {...textProps}
      >
        {segments.map((segment, index) => {
          const fontSize = getSizeValue(segment.size, magnification);
          const validFontSize =
            fontSize && !isNaN(fontSize) && isFinite(fontSize) && fontSize > 0 ? fontSize : 32;

          return (
            <Text key={index} style={{ fontSize: validFontSize }}>
              {segment.text}
            </Text>
          );
        })}
      </Text>
    );
  }
);

SegmentedText.displayName = "SegmentedText";

export default SegmentedText;
