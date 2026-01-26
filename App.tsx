import React from "react";
import "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator"; // Siguraduhing tama ang path na ito

export default function App() {
  // Ang AppNavigator ang "pangunahing gate" ng app mo
  return <AppNavigator />;
}
