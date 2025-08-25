import {
  calculateFontSize,
  getNextColorIndex,
  getNextAlignmentIndex,
  getNextFontFamilyIndex,
  getComplementaryColor,
  getRandomColorPair,
  getColorValue,
  getAlignmentName,
  getFontFamilyName,
  isValidText,
  COLORS,
  ALIGNMENTS,
  FONT_FAMILIES,
} from '../utils/textUtils';

describe('Font Size Calculation', () => {
  const baseSize = 32; // Font size in pixels
  const minSize = 20; // Minimum font size in pixels
  const shrinkStart = 300; // Text length threshold

  test('should return base size for empty text', () => {
    expect(calculateFontSize('')).toBe(baseSize);
    expect(calculateFontSize(null)).toBe(baseSize);
    expect(calculateFontSize(undefined)).toBe(baseSize);
  });

  test('should return base size for short text', () => {
    const shortText = 'Hello world';
    expect(calculateFontSize(shortText)).toBe(baseSize);
  });

  test('should return base size for text at shrink threshold', () => {
    const text = 'a'.repeat(300);
    expect(calculateFontSize(text)).toBe(baseSize);
  });

  test('should shrink font size for long text', () => {
    const longText = 'a'.repeat(400);
    const result = calculateFontSize(longText);
    expect(result).toBeLessThan(baseSize);
    expect(result).toBeGreaterThanOrEqual(minSize);
  });

  test('should not go below minimum size', () => {
    const veryLongText = 'a'.repeat(1000);
    const result = calculateFontSize(veryLongText);
    expect(result).toBeGreaterThanOrEqual(minSize);
  });

  test('should use custom parameters', () => {
    const text = 'a'.repeat(100);
    const customBase = 40; // Custom base size in pixels
    const customMin = 15; // Custom minimum size in pixels
    const customShrink = 50; // Custom shrink threshold
    
    const result = calculateFontSize(text, customBase, customMin, customShrink);
    expect(result).toBeLessThan(customBase);
    expect(result).toBeGreaterThanOrEqual(customMin);
  });

  test('should return integer values', () => {
    const text = 'a'.repeat(350);
    const result = calculateFontSize(text);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('Color Cycling', () => {
  test('should cycle through colors correctly', () => {
    expect(getNextColorIndex(0)).toBe(1);
    expect(getNextColorIndex(COLORS.length - 1)).toBe(0);
    expect(getNextColorIndex(3)).toBe(4);
  });

  test('should handle invalid indices', () => {
    expect(getNextColorIndex(-1)).toBe(0);
    expect(getNextColorIndex(COLORS.length)).toBe(1);
  });

  test('should work with custom color arrays', () => {
    const customColors = ['red', 'blue', 'green'];
    expect(getNextColorIndex(0, customColors)).toBe(1);
    expect(getNextColorIndex(2, customColors)).toBe(0);
  });
});

describe('Alignment Cycling', () => {
  test('should cycle through alignments correctly', () => {
    expect(getNextAlignmentIndex(0)).toBe(1);
    expect(getNextAlignmentIndex(1)).toBe(2);
    expect(getNextAlignmentIndex(2)).toBe(0);
  });

  test('should handle invalid indices', () => {
    expect(getNextAlignmentIndex(-1)).toBe(0);
    expect(getNextAlignmentIndex(ALIGNMENTS.length)).toBe(1);
  });
});

describe('Font Family Cycling', () => {
  test('should cycle through font families correctly', () => {
    expect(getNextFontFamilyIndex(0)).toBe(1);
    expect(getNextFontFamilyIndex(1)).toBe(2);
    expect(getNextFontFamilyIndex(2)).toBe(0);
  });

  test('should handle invalid indices', () => {
    expect(getNextFontFamilyIndex(-1)).toBe(0);
    expect(getNextFontFamilyIndex(FONT_FAMILIES.length)).toBe(1);
  });
});

describe('Complementary Colors', () => {
  test('should return correct complementary colors', () => {
    expect(getComplementaryColor('white')).toBe('black');
    expect(getComplementaryColor('black')).toBe('white');
    expect(getComplementaryColor('red')).toBe('green');
    expect(getComplementaryColor('blue')).toBe('orange');
  });

  test('should return black for unknown colors', () => {
    expect(getComplementaryColor('unknown')).toBe('black');
    expect(getComplementaryColor('')).toBe('black');
    expect(getComplementaryColor(null)).toBe('black');
  });
});

describe('Random Color Pair', () => {
  test('should return valid color indices', () => {
    const { backgroundIndex, textIndex } = getRandomColorPair();
    
    expect(backgroundIndex).toBeGreaterThanOrEqual(0);
    expect(backgroundIndex).toBeLessThan(COLORS.length);
    expect(textIndex).toBeGreaterThanOrEqual(0);
    expect(textIndex).toBeLessThan(COLORS.length);
  });

  test('should return complementary colors', () => {
    // Run multiple times to test randomness
    for (let i = 0; i < 10; i++) {
      const { backgroundIndex, textIndex } = getRandomColorPair();
      const backgroundColor = COLORS[backgroundIndex];
      const textColor = COLORS[textIndex];
      const expectedTextColor = getComplementaryColor(backgroundColor);
      
      expect(textColor).toBe(expectedTextColor);
    }
  });
});

describe('Color Value Lookup', () => {
  test('should return correct hex values', () => {
    expect(getColorValue('white')).toBe('#FFFFFF');
    expect(getColorValue('black')).toBe('#000000');
    expect(getColorValue('red')).toBe('#FF0000');
  });

  test('should return black for unknown colors', () => {
    expect(getColorValue('unknown')).toBe('#000000');
    expect(getColorValue('')).toBe('#000000');
  });
});

describe('Name Lookups', () => {
  test('should return correct alignment names', () => {
    expect(getAlignmentName(0)).toBe('left');
    expect(getAlignmentName(1)).toBe('center');
    expect(getAlignmentName(2)).toBe('right');
  });

  test('should return default alignment for invalid index', () => {
    expect(getAlignmentName(-1)).toBe('left');
    expect(getAlignmentName(10)).toBe('left');
  });

  test('should return correct font family names', () => {
    expect(getFontFamilyName(0)).toBe('System');
    expect(getFontFamilyName(1)).toBe('Courier');
    expect(getFontFamilyName(2)).toBe('Times New Roman');
  });

  test('should return default font family for invalid index', () => {
    expect(getFontFamilyName(-1)).toBe('System');
    expect(getFontFamilyName(10)).toBe('System');
  });
});

describe('Text Validation', () => {
  test('should validate text correctly', () => {
    expect(isValidText('Hello world')).toBe(true);
    expect(isValidText('a')).toBe(true);
    expect(isValidText('   text with spaces   ')).toBe(true);
  });

  test('should reject invalid text', () => {
    expect(isValidText('')).toBe(false);
    expect(isValidText('   ')).toBe(false);
    expect(isValidText(null)).toBe(false);
    expect(isValidText(undefined)).toBe(false);
    expect(isValidText(123)).toBe(false);
  });
});