const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ituro natin kung nasaan ang main CSS file natin
module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
