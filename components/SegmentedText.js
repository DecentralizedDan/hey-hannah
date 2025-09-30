import React from "react";
import { Text } from "react-native";
import { getSizeValue } from "../constants/textSizing";

/**
 * SegmentedText component renders text with mixed font sizes
 * Each segment can have its own size while maintaining consistent styling
 */
const SegmentedText = ({
  segments = [],
  magnification = 1.0,
  style = {},
  numberOfLines,
  onLayout,
  ...textProps
}) => {
  // If no segments, render empty text
  if (!segments || segments.length === 0) {
    return (
      <Text style={style} numberOfLines={numberOfLines} onLayout={onLayout} {...textProps}>
        {""}
      </Text>
    );
  }

  // If only one segment, render as simple Text component
  if (segments.length === 1) {
    const segment = segments[0];
    const fontSize = getSizeValue(segment.size, magnification);

    return (
      <Text
        style={[style, { fontSize }]}
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
    <Text style={style} numberOfLines={numberOfLines} onLayout={onLayout} {...textProps}>
      {segments.map((segment, index) => {
        const fontSize = getSizeValue(segment.size, magnification);

        return (
          <Text key={index} style={{ fontSize }}>
            {segment.text}
          </Text>
        );
      })}
    </Text>
  );
};

export default SegmentedText;

