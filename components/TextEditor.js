import React from "react";
import { View, TextInput, Text, TouchableWithoutFeedback } from "react-native";
import styles from "../styles/AppStyles";

const TextEditor = ({
  currentBackgroundColor,
  currentTextColor,
  fontSize,
  currentAlignment,
  currentFontFamily,
  text,
  startedWriting,
  isCapturing,
  isPreviewMode,
  textInputRef,
  measureTextRef,
  captureTextRef,
  onTextChange,
  onExitPreview,
}) => {
  return (
    <TouchableWithoutFeedback onPress={isPreviewMode ? onExitPreview : undefined}>
      <View
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
            onChangeText={onTextChange}
            placeholder="Say something..."
            multiline
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            textAlignVertical="top"
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default TextEditor;
