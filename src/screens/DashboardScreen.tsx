import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Libsys Mobile Dashboard (TypeScript)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default DashboardScreen;
