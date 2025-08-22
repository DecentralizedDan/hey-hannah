module.exports = {
  extends: ["expo", "@react-native"],
  rules: {
    "max-len": ["error", { code: 100, ignoreUrls: true, ignoreStrings: true }],
  },
};
