/**
 * Lightweight test to verify that all color shades are ordered from darkest to lightest
 */

import { ALL_SHADES } from "../constants/shades.js";

/**
 * Calculate relative luminance of a color using the WCAG formula
 * Higher values = lighter colors, lower values = darker colors
 * @param {string} hexColor - Hex color string (e.g., "#FF0000")
 * @returns {number} Relative luminance value between 0 and 1
 */
function calculateLuminance(hexColor) {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

/**
 * Test that a single shade array is ordered from darkest to lightest
 * @param {string[]} shadeArray - Array of hex color strings
 * @param {string} colorName - Name of the color for error reporting
 * @returns {object} Test result with success status and details
 */
function testShadeOrdering(shadeArray, colorName) {
  const luminanceValues = shadeArray.map(calculateLuminance);
  const errors = [];

  for (let i = 1; i < luminanceValues.length; i++) {
    const prevLuminance = luminanceValues[i - 1];
    const currentLuminance = luminanceValues[i];

    if (currentLuminance < prevLuminance) {
      errors.push({
        index: i,
        prevColor: shadeArray[i - 1],
        currentColor: shadeArray[i],
        prevLuminance: prevLuminance.toFixed(4),
        currentLuminance: currentLuminance.toFixed(4),
      });
    }
  }

  return {
    colorName,
    success: errors.length === 0,
    totalShades: shadeArray.length,
    errors: errors,
  };
}

/**
 * Run tests on all shade arrays
 * @returns {object} Complete test results
 */
function testAllShades() {
  const colorNames = ["RED", "ORANGE", "YELLOW", "GREEN", "BLUE", "PURPLE", "WHITE", "BLACK"];
  const results = [];
  let totalErrors = 0;

  console.log("🎨 Testing shade ordering from darkest to lightest...\n");

  ALL_SHADES.forEach((shadeArray, index) => {
    const result = testShadeOrdering(shadeArray, colorNames[index]);
    results.push(result);

    if (result.success) {
      console.log(`✅ ${result.colorName}: ${result.totalShades} shades correctly ordered`);
    } else {
      console.log(`❌ ${result.colorName}: ${result.errors.length} ordering error(s) found`);
      result.errors.forEach((error) => {
        console.log(
          `   Index ${error.index}: ${error.prevColor} (${error.prevLuminance}) should be darker than ${error.currentColor} (${error.currentLuminance})`
        );
      });
      totalErrors += result.errors.length;
    }
  });

  console.log("\n📊 Test Summary:");
  console.log(`Colors tested: ${results.length}`);
  console.log(`Total shades: ${results.reduce((sum, r) => sum + r.totalShades, 0)}`);
  console.log(`Total ordering errors: ${totalErrors}`);
  console.log(`Overall result: ${totalErrors === 0 ? "✅ PASS" : "❌ FAIL"}`);

  return {
    results,
    totalErrors,
    success: totalErrors === 0,
  };
}

// Export for use in other contexts
export { testAllShades, testShadeOrdering, calculateLuminance };

// Run test if this file is executed directly
if (
  typeof process !== "undefined" &&
  process.argv &&
  process.argv[1] &&
  process.argv[1].includes("shades-order.test.js")
) {
  testAllShades();
}
