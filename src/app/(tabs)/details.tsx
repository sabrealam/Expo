import { router } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>🎉</Text>
          <Text style={styles.title}>New Page</Text>
          <Text style={styles.description}>
            You navigated to this screen using Expo Router file-based routing!
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>How this works:</Text>
            <Text style={styles.infoText}>
              • File: <Text style={styles.code}>src/app/details.tsx</Text>
            </Text>
            <Text style={styles.infoText}>
              • Route URL: <Text style={styles.code}>/details</Text>
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/")}
          >
            <Text style={styles.backButtonText}>← Switch to Uploader Tab</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 4,
  },
  code: {
    fontFamily: Platform.select({ ios: "Courier", android: "monospace", default: "monospace" }),
    color: "#4F46E5",
    fontWeight: "600",
  },
  backButton: {
    width: "100%",
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
