#!/usr/bin/env node

/**
 * Simple test runner for shade ordering validation
 * Usage: node test-shades.js
 */

import { testAllShades } from "./tests/shades-order.test.js";

// Run the test
const testResult = testAllShades();

// Exit with appropriate code
process.exit(testResult.success ? 0 : 1);
