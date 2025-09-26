import appConfig from "../app.json";

/**
 * Gets the current app version from app.json
 * @returns {string} App version (e.g., "1.2.0")
 */
export const getAppVersion = () => {
  return appConfig.expo.version;
};

/**
 * Gets the current iOS build number from app.json
 * @returns {string} Build number (e.g., "11")
 */
export const getBuildNumber = () => {
  return appConfig.expo.ios.buildNumber;
};

/**
 * Gets complete version information for metadata
 * @returns {object} Object containing version and build number
 */
export const getVersionInfo = () => {
  return {
    appVersion: getAppVersion(),
    buildNumber: getBuildNumber(),
  };
};
