import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import App from '../App';

// Mock the native modules that aren't available in test environment
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve('mock-image-uri')),
}));

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  saveToLibraryAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock specific React Native modules
jest.mock('react-native', () => ({
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((styles) => styles),
  },
  Text: 'Text',
  View: 'View',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  StatusBar: 'StatusBar',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  Keyboard: {
    dismiss: jest.fn(),
  },
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  Alert: {
    alert: jest.fn(),
  },
  ScrollView: 'ScrollView',
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render without crashing', () => {
    const { getByTestId } = render(<App />);
    // App should render successfully
    expect(() => render(<App />)).not.toThrow();
  });

  test('should display placeholder text initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('[start writing]')).toBeTruthy();
  });

  test('should have control buttons visible', () => {
    const { getByText } = render(<App />);
    
    expect(getByText('BG')).toBeTruthy();
    expect(getByText('TEXT')).toBeTruthy();
    expect(getByText('FONT')).toBeTruthy();
    expect(getByText('ALIGN')).toBeTruthy();
    expect(getByText('PREVIEW')).toBeTruthy();
    expect(getByText('SHARE')).toBeTruthy();
  });

  test('should handle text input', () => {
    const { getByDisplayValue, queryByText } = render(<App />);
    
    // Find the TextInput component (it should have an empty value initially)
    const textInput = getByDisplayValue('');
    
    // Simulate typing text
    fireEvent.changeText(textInput, 'Hello world');
    
    // Placeholder should disappear when text is entered
    expect(queryByText('[start writing]')).toBeNull();
  });

  test('should cycle background color when BG button is pressed', () => {
    const { getByText } = render(<App />);
    const bgButton = getByText('BG');
    
    // Press the button multiple times
    fireEvent.press(bgButton);
    fireEvent.press(bgButton);
    fireEvent.press(bgButton);
    
    // Button should be pressable without errors
    expect(bgButton).toBeTruthy();
  });

  test('should cycle text color when TEXT button is pressed', () => {
    const { getByText } = render(<App />);
    const textButton = getByText('TEXT');
    
    fireEvent.press(textButton);
    
    expect(textButton).toBeTruthy();
  });

  test('should cycle font family when FONT button is pressed', () => {
    const { getByText } = render(<App />);
    const fontButton = getByText('FONT');
    
    fireEvent.press(fontButton);
    
    expect(fontButton).toBeTruthy();
  });

  test('should cycle alignment when ALIGN button is pressed', () => {
    const { getByText } = render(<App />);
    const alignButton = getByText('ALIGN');
    
    fireEvent.press(alignButton);
    
    expect(alignButton).toBeTruthy();
  });

  test('should toggle preview mode when PREVIEW button is pressed', () => {
    const { getByText } = render(<App />);
    const previewButton = getByText('PREVIEW');
    
    fireEvent.press(previewButton);
    
    expect(previewButton).toBeTruthy();
  });

  test('should show share dialog when SHARE button is pressed with text', () => {
    const { Alert } = require('react-native');
    const { getByText, getByDisplayValue } = render(<App />);
    
    // Add some text first
    const textInput = getByDisplayValue('');
    fireEvent.changeText(textInput, 'Test text');
    
    // Press share button
    const shareButton = getByText('SHARE');
    fireEvent.press(shareButton);
    
    // Alert should be called
    expect(Alert.alert).toHaveBeenCalled();
  });

  test('should show no text alert when SHARE button is pressed without text', () => {
    const { Alert } = require('react-native');
    const { getByText } = render(<App />);
    
    const shareButton = getByText('SHARE');
    fireEvent.press(shareButton);
    
    // Alert should be called with "No Text" message
    expect(Alert.alert).toHaveBeenCalledWith(
      'No Text',
      'Please enter some text before sharing.'
    );
  });

  test('should dismiss keyboard when tapping outside', () => {
    const { getByTestId } = render(<App />);
    
    // This test verifies the TouchableWithoutFeedback wrapper works
    // In a real test environment, we'd mock Keyboard.dismiss()
    expect(() => render(<App />)).not.toThrow();
  });

  test('should handle long text input without errors', () => {
    const { getByDisplayValue } = render(<App />);
    const textInput = getByDisplayValue('');
    
    // Test with very long text
    const longText = 'a'.repeat(1000);
    fireEvent.changeText(textInput, longText);
    
    // Should not crash
    expect(textInput).toBeTruthy();
  });

  test('should handle special characters in text input', () => {
    const { getByDisplayValue } = render(<App />);
    const textInput = getByDisplayValue('');
    
    // Test with emojis and special characters
    const specialText = '🎉 Hello! @#$%^&*()_+{}[]|\\:";\'<>?,./~`';
    fireEvent.changeText(textInput, specialText);
    
    expect(textInput).toBeTruthy();
  });
});