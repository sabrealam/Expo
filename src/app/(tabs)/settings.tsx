import { router } from "expo-router";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your preferences & account</Text>
        </View>

        {/* Account Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <Pressable
            style={({ pressed }) => [
              styles.rowItem,
              pressed && styles.rowItemPressed,
            ]}
            onPress={() => router.push("/login")}
          >
            <View style={[styles.iconBox, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="person" size={20} color="#4F46E5" />
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Sign In / Switch Account</Text>
              <Text style={styles.rowSubtitle}>Phone & OTP verification</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* App Info Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App Details</Text>

          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="information-circle" size={20} color="#10B981" />
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Version</Text>
              <Text style={styles.rowSubtitle}>1.0.0 (Expo SDK 58)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={[styles.iconBox, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="hardware-chip" size={20} color="#F59E0B" />
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Platform</Text>
              <Text style={styles.rowSubtitle}>{Platform.OS.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [
              styles.rowItem,
              pressed && styles.rowItemPressed,
            ]}
            onPress={() => {
              Alert.alert("Cache Cleared", "Temporary application cache has been reset.");
            }}
          >
            <View style={[styles.iconBox, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="trash" size={20} color="#EF4444" />
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowTitle}>Clear Cache</Text>
              <Text style={styles.rowSubtitle}>Free up local temporary files</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowItemPressed: {
    opacity: 0.7,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },
});
