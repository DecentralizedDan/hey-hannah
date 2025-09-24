import * as FileSystem from "expo-file-system";

/**
 * Generates a meaningful filename based on text content with date and time
 * @param {string} text - The text content to base the filename on
 * @param {Array} existingFilenames - Array of existing filenames to avoid duplicates
 * @returns {string} - Generated filename with .jpg extension
 */
const generateFilename = (text, existingFilenames = []) => {
  // Generate date string in DD-MM-YYYY format
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0"); // Day in DD format
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month in MM format
  const year = now.getFullYear(); // Year in YYYY format
  const dateString = `${day}-${month}-${year}`;

  if (!text || text.trim() === "") {
    const timestamp = Date.now();
    return `text-image-${timestamp}-${dateString}.jpg`;
  }

  // Clean and process the text for filename
  let cleanText = text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .substring(0, 40); // Limit to 40 characters to leave room for date

  // If after cleaning we have no valid characters, fall back to timestamp
  if (cleanText === "") {
    const timestamp = Date.now();
    return `text-image-${timestamp}-${dateString}.jpg`;
  }

  let baseFilename = `${cleanText}-${dateString}`;
  let filename = `${baseFilename}.jpg`;
  let counter = 2; // Start counter at 2 for duplicates (first duplicate is the 2nd file)

  // Check for duplicates and add incremental number if needed
  while (existingFilenames.includes(filename)) {
    filename = `${cleanText}-${dateString}-${counter}.jpg`;
    counter++;
  }

  return filename;
};

/**
 * Saves a captured image with a meaningful filename for sharing
 * @param {string} capturedUri - The URI of the captured image
 * @param {string} text - The text content to base the filename on
 * @param {Array} existingFilenames - Array of existing filenames to avoid duplicates
 * @returns {string} - Path to the saved file with meaningful filename
 */
const saveImageForSharing = async (capturedUri, text, existingFilenames = []) => {
  try {
    const meaningfulFilename = generateFilename(text, existingFilenames);
    const shareDir = FileSystem.cacheDirectory + "share/";

    // Ensure share directory exists
    const dirInfo = await FileSystem.getInfoAsync(shareDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(shareDir, { intermediates: true });
    }

    const finalPath = shareDir + meaningfulFilename;

    // Copy the captured image to the new location with meaningful filename
    await FileSystem.copyAsync({
      from: capturedUri,
      to: finalPath,
    });

    return finalPath;
  } catch (error) {
    console.error("Error saving image for sharing:", error);
    return capturedUri; // Fall back to original URI
  }
};

export { generateFilename, saveImageForSharing };
