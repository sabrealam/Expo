import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as IntentLauncher from "expo-intent-launcher";

type SelectedFile = {
  name: string;
  size: number | null;
  uri: string;
  mimeType: string | null;
  isImage?: boolean;
};

function formatBytes(bytes: number | null): string {
  if (bytes == null) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Index() {
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [loading, setLoading] = useState(false);

  // Runtime permission hooks from expo-image-picker
  const [cameraPermission, requestCameraPermission] =
    ImagePicker.useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const openAppSettings = async () => {
    if (Platform.OS === "android") {
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
          { data: "package:" + "expo" }
        );
      } catch {
        await Linking.openSettings();
      }
    } else {
      await Linking.openSettings();
    }
  };

  const handleRequestCamera = async () => {
    if (cameraPermission?.status === ImagePicker.PermissionStatus.DENIED && !cameraPermission.canAskAgain) {
      Alert.alert(
        "Camera Permission Blocked",
        "Camera access was permanently denied. Please allow it in device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openAppSettings },
        ]
      );
      return;
    }
    const res = await requestCameraPermission();
    if (res.granted) {
      Alert.alert("Permission Granted", "Camera permission is now enabled.");
    }
  };

  const handleRequestMedia = async () => {
    if (mediaPermission?.status === ImagePicker.PermissionStatus.DENIED && !mediaPermission.canAskAgain) {
      Alert.alert(
        "Photos Permission Blocked",
        "Photos & media access was permanently denied. Please allow it in device settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openAppSettings },
        ]
      );
      return;
    }
    const res = await requestMediaPermission();
    if (res.granted) {
      Alert.alert("Permission Granted", "Photos & media permission is now enabled.");
    }
  };

  // 1. Pick any file/document
  const pickDocument = async () => {
    setLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        const isImg =
          asset.mimeType?.startsWith("image/") ||
          /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(asset.name);
        setFile({
          name: asset.name,
          size: asset.size ?? null,
          uri: asset.uri,
          mimeType: asset.mimeType ?? null,
          isImage: isImg,
        });
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Could not select file.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Take photo with Camera
  const takePhoto = async () => {
    if (!cameraPermission?.granted) {
      const req = await requestCameraPermission();
      if (!req.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please grant camera access to take pictures.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: openAppSettings },
          ]
        );
        return;
      }
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setFile({
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize ?? null,
          uri: asset.uri,
          mimeType: asset.mimeType || "image/jpeg",
          isImage: true,
        });
      }
    } catch (error) {
      console.error("Error launching camera:", error);
      Alert.alert("Error", "Could not capture image from camera.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Choose photo from library
  const pickPhotoFromLibrary = async () => {
    if (!mediaPermission?.granted) {
      const req = await requestMediaPermission();
      if (!req.granted) {
        Alert.alert(
          "Media Permission Required",
          "Please grant access to your photo library.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: openAppSettings },
          ]
        );
        return;
      }
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setFile({
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize ?? null,
          uri: asset.uri,
          mimeType: asset.mimeType || "image/jpeg",
          isImage: true,
        });
      }
    } catch (error) {
      console.error("Error picking photo:", error);
      Alert.alert("Error", "Could not pick photo.");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => setFile(null);

  const openHotspotSettings = async () => {
    if (Platform.OS === "android") {
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.TETHER_SETTINGS
        );
      } catch {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.WIRELESS_SETTINGS
        );
      }
    } else if (Platform.OS === "ios") {
      await Linking.openSettings();
    } else {
      Alert.alert("Not supported", "Hotspot settings are not available on this platform.");
    }
  };

  const openMobileDataSettings = async () => {
    if (Platform.OS === "android") {
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.DATA_USAGE_SETTINGS
        );
      } catch {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.WIRELESS_SETTINGS
        );
      }
    } else if (Platform.OS === "ios") {
      await Linking.openSettings();
    } else {
      Alert.alert("Not supported", "Mobile data settings are not available on this platform.");
    }
  };

  const cameraGranted = cameraPermission?.granted;
  const mediaGranted = mediaPermission?.granted;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── System Toggles ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Quick Settings</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={({ pressed }) => [
                styles.toggleBtn,
                styles.toggleHotspot,
                pressed && styles.togglePressed,
              ]}
              onPress={openHotspotSettings}
            >
              <Text style={styles.toggleIcon}>📡</Text>
              <Text style={styles.toggleLabel}>Hotspot</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.toggleBtn,
                styles.toggleData,
                pressed && styles.togglePressed,
              ]}
              onPress={openMobileDataSettings}
            >
              <Text style={styles.toggleIcon}>📶</Text>
              <Text style={styles.toggleLabel}>Mobile Data</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Permissions Manager ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>App Permissions</Text>
          <View style={styles.permissionCard}>
            <View style={styles.permissionRow}>
              <View style={styles.permissionTextContainer}>
                <Text style={styles.permissionTitle}>📷 Camera</Text>
                <Text style={styles.permissionDesc}>
                  Required to take photos directly with camera
                </Text>
              </View>
              <Pressable
                style={[
                  styles.statusBadge,
                  cameraGranted ? styles.badgeGranted : styles.badgePending,
                ]}
                onPress={handleRequestCamera}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    cameraGranted
                      ? styles.badgeTextGranted
                      : styles.badgeTextPending,
                  ]}
                >
                  {cameraGranted ? "Granted ✓" : "Allow"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.permissionDivider} />

            <View style={styles.permissionRow}>
              <View style={styles.permissionTextContainer}>
                <Text style={styles.permissionTitle}>🖼️ Photos & Files</Text>
                <Text style={styles.permissionDesc}>
                  Required to choose media from device library
                </Text>
              </View>
              <Pressable
                style={[
                  styles.statusBadge,
                  mediaGranted ? styles.badgeGranted : styles.badgePending,
                ]}
                onPress={handleRequestMedia}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    mediaGranted
                      ? styles.badgeTextGranted
                      : styles.badgeTextPending,
                  ]}
                >
                  {mediaGranted ? "Granted ✓" : "Allow"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── File & Camera Upload ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Upload or Capture</Text>
          <Text style={styles.sectionSubtitle}>
            Select a document, take a photo, or choose from gallery
          </Text>

          {/* Action Buttons */}
          <View style={styles.uploadOptionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.uploadOptionBtn,
                pressed && styles.uploadOptionPressed,
              ]}
              onPress={takePhoto}
              disabled={loading}
            >
              <Text style={styles.optionIcon}>📸</Text>
              <Text style={styles.optionLabel}>Camera</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.uploadOptionBtn,
                pressed && styles.uploadOptionPressed,
              ]}
              onPress={pickPhotoFromLibrary}
              disabled={loading}
            >
              <Text style={styles.optionIcon}>🖼️</Text>
              <Text style={styles.optionLabel}>Gallery</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.uploadOptionBtn,
                pressed && styles.uploadOptionPressed,
              ]}
              onPress={pickDocument}
              disabled={loading}
            >
              <Text style={styles.optionIcon}>📄</Text>
              <Text style={styles.optionLabel}>Files</Text>
            </Pressable>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Opening picker...</Text>
            </View>
          )}

          {file && !loading && (
            <View style={styles.fileCard}>
              {file.isImage && (
                <Image
                  source={{ uri: file.uri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              )}

              <View style={styles.fileInfo}>
                <Text style={styles.fileIcon}>{file.isImage ? "🖼️" : "📎"}</Text>
                <View style={styles.fileMeta}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatBytes(file.size)}
                    {file.mimeType ? ` • ${file.mimeType}` : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnUpload,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={() => {
                    Alert.alert(
                      "File Ready to Upload",
                      `Name: ${file.name}\nSize: ${formatBytes(file.size)}\nURI: ${file.uri}`
                    );
                    console.log("Ready to upload:", file);
                  }}
                >
                  <Text style={styles.btnUploadText}>Upload File</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnRemove,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={removeFile}
                >
                  <Text style={styles.btnRemoveText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          )}
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 14,
  },

  // ── Quick Toggles ──
  toggleRow: {
    flexDirection: "row",
    gap: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleHotspot: {
    backgroundColor: "#EEF2FF",
  },
  toggleData: {
    backgroundColor: "#ECFDF5",
  },
  togglePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  toggleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  // ── Permission Card ──
  permissionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  permissionTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  permissionDesc: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  permissionDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 78,
    alignItems: "center",
  },
  badgeGranted: {
    backgroundColor: "#DEF7EC",
  },
  badgePending: {
    backgroundColor: "#4F46E5",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeTextGranted: {
    color: "#03543F",
  },
  badgeTextPending: {
    color: "#FFFFFF",
  },

  // ── Upload Action Buttons ──
  uploadOptionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  uploadOptionBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadOptionPressed: {
    backgroundColor: "#F3F4F6",
    borderColor: "#4F46E5",
    transform: [{ scale: 0.98 }],
  },
  optionIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B7280",
  },

  // ── File Card ──
  fileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 8,
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: "#F3F4F6",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  fileIcon: {
    fontSize: 26,
    marginRight: 10,
  },
  fileMeta: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  fileSize: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPressed: {
    opacity: 0.75,
  },
  btnUpload: {
    backgroundColor: "#4F46E5",
  },
  btnUploadText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  btnRemove: {
    backgroundColor: "#F3F4F6",
  },
  btnRemoveText: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 14,
  },
});
