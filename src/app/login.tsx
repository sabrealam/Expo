import { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { requestPhoneNumberHint } from "expo-phone-number-hint-autofill";

type LoginStep = "phone" | "otp";

export default function LoginScreen() {
  const [step, setStep] = useState<LoginStep>("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectingPhone, setDetectingPhone] = useState(false);

  // Mock OTP State
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Refs for auto-advancing 4 OTP boxes
  const box0 = useRef<any>(null);
  const box1 = useRef<any>(null);
  const box2 = useRef<any>(null);
  const box3 = useRef<any>(null);
  const inputRefs = [box0, box1, box2, box3];

  // Auto-launch Google Play Services Phone Hint on Android when entering screen
  useEffect(() => {
    if (Platform.OS === "android") {
      const timer = setTimeout(() => {
        triggerNativePhoneHint();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-countdown timer for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timer]);

  // Calls Android Google Play Services Phone Number Hint API directly
  const triggerNativePhoneHint = async (isManual = false) => {
    if (Platform.OS !== "android") {
      if (isManual) {
        Alert.alert("Notice", "Google Play Services Phone Hint is only available on Android devices.");
      }
      return;
    }

    try {
      setDetectingPhone(true);
      const result = await requestPhoneNumberHint();

      if (result.success && result.phoneNumber) {
        // E.g. "+919876543210" or "9876543210"
        let raw = result.phoneNumber.replace(/\s+/g, "");
        let clean = raw;
        if (clean.startsWith("+91")) {
          clean = clean.slice(3);
        } else if (clean.startsWith("+")) {
          clean = clean.slice(clean.length - 10);
        }
        clean = clean.replace(/\D/g, "");

        setPhoneNumber(clean);
        // Automatically dispatch OTP immediately with 0 typing!
        executeSendOtp(clean);
      } else if (isManual && result.error) {
        Alert.alert(
          "Notice",
          "Automatic SIM detection requires an Android APK / Development build (it does not run in Expo Go). Please enter your number below."
        );
      }
    } catch (error) {
      console.log("Phone hint dismissed or error:", error);
    } finally {
      setDetectingPhone(false);
    }
  };

  // Generate 4-digit mock OTP
  const generateMockOtp = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    return code;
  };

  // Send OTP
  const executeSendOtp = (targetNumber: string) => {
    setLoading(true);
    setTimeout(() => {
      generateMockOtp();
      setLoading(false);
      setStep("otp");
      setOtpDigits(["", "", "", ""]);
      setOtpError(null);
      setTimer(30);
      setTimerActive(true);

      // Focus the first digit box
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 300);
    }, 600);
  };

  const handleManualSendOtp = () => {
    const cleanNumber = phoneNumber.trim().replace(/\D/g, "");
    if (cleanNumber.length < 10) {
      Alert.alert("Invalid Phone Number", "Please enter a valid 10-digit mobile number.");
      return;
    }
    executeSendOtp(cleanNumber);
  };

  // Step 2: Handle individual digit entry & auto-advance
  const handleOtpChange = (value: string, index: number) => {
    setOtpError(null);
    const cleaned = value.replace(/\D/g, "");

    // If user pasted a full 4-digit code into one box
    if (cleaned.length === 4) {
      const parts = cleaned.split("");
      setOtpDigits(parts);
      inputRefs[3].current?.focus();
      verifyOtp(cleaned);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next box if digit was typed
    if (cleaned && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-verify when 4th digit is filled
    if (newDigits.every((d) => d.length === 1)) {
      verifyOtp(newDigits.join(""));
    }
  };

  // Handle backspace navigation between boxes
  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Verify OTP
  const verifyOtp = (code: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code === generatedOtp) {
        Alert.alert(
          "Login Successful! 🎉",
          `Welcome! Logged in with ${countryCode} ${phoneNumber}`,
          [
            {
              text: "Continue to App",
              onPress: () => router.replace("/"),
            },
          ]
        );
      } else {
        setOtpError("Incorrect OTP. Please check the code and try again.");
      }
    }, 500);
  };

  // One-tap Auto-fill Mock OTP
  const autoFillMockOtp = () => {
    if (generatedOtp) {
      const digits = generatedOtp.split("");
      setOtpDigits(digits);
      verifyOtp(generatedOtp);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.headerIcon}>📱</Text>
            </View>
            <Text style={styles.title}>
              {step === "phone" ? "Welcome Back" : "Verify OTP"}
            </Text>
            <Text style={styles.subtitle}>
              {step === "phone"
                ? "Sign in with your mobile number"
                : `We sent a 4-digit verification code to ${countryCode} ${phoneNumber}`}
            </Text>
          </View>

          {/* ── STEP 1: PHONE NUMBER INPUT ── */}
          {step === "phone" && (
            <View style={styles.card}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                {Platform.OS === "android" && (
                  <Pressable
                    style={styles.detectBtn}
                    onPress={() => triggerNativePhoneHint(true)}
                    disabled={detectingPhone}
                  >
                    {detectingPhone ? (
                      <ActivityIndicator size="small" color="#4F46E5" />
                    ) : (
                      <Text style={styles.detectBtnText}>⚡ Detect SIM</Text>
                    )}
                  </Pressable>
                )}
              </View>

              <View style={styles.phoneInputRow}>
                <View style={styles.countryPicker}>
                  <Text style={styles.flag}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                </View>

                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  // OS autofill triggers
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  dataDetectorTypes="phoneNumber"
                />
              </View>

              {/* Submit Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && styles.btnPressed,
                  loading && styles.btnDisabled,
                ]}
                onPress={handleManualSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send OTP →</Text>
                )}
              </Pressable>

              <Text style={styles.termsText}>
                On Android, Google Play Services detects your SIM card directly without typing.
              </Text>
            </View>
          )}

          {/* ── STEP 2: 4-DIGIT OTP VERIFICATION ── */}
          {step === "otp" && (
            <View style={styles.card}>
              {/* Mock OTP Notification Banner */}
              {generatedOtp && (
                <View style={styles.mockBanner}>
                  <View style={styles.mockBannerHeader}>
                    <Text style={styles.mockTag}>MOCK SMS</Text>
                    <Text style={styles.mockOtpCode}>{generatedOtp}</Text>
                  </View>
                  <Text style={styles.mockBannerText}>
                    Use this code to test verification, or tap below to auto-fill.
                  </Text>
                  <Pressable
                    style={styles.mockFillBtn}
                    onPress={autoFillMockOtp}
                  >
                    <Text style={styles.mockFillBtnText}>⚡ 1-Tap Auto-fill & Verify</Text>
                  </Pressable>
                </View>
              )}

              <Text style={styles.inputLabel}>Enter 4-Digit Code</Text>

              {/* 4 Digit Boxes */}
              <View style={styles.otpBoxesRow}>
                {otpDigits.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={inputRefs[idx]}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                      otpError ? styles.otpBoxError : null,
                    ]}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, idx)}
                    onKeyPress={({ nativeEvent }) =>
                      handleOtpKeyPress(nativeEvent.key, idx)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                  />
                ))}
              </View>

              {otpError && (
                <Text style={styles.errorText}>⚠️ {otpError}</Text>
              )}

              {/* Resend & Change Number Row */}
              <View style={styles.otpActionsRow}>
                <Pressable
                  disabled={timerActive}
                  onPress={() => {
                    generateMockOtp();
                    setTimer(30);
                    setTimerActive(true);
                    setOtpDigits(["", "", "", ""]);
                    setOtpError(null);
                    inputRefs[0].current?.focus();
                  }}
                >
                  <Text
                    style={[
                      styles.resendText,
                      timerActive ? styles.resendDisabled : styles.resendActive,
                    ]}
                  >
                    {timerActive
                      ? `Resend OTP in ${timer}s`
                      : "Resend OTP"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setStep("phone");
                    setGeneratedOtp(null);
                  }}
                >
                  <Text style={styles.changeNumberText}>Change Number</Text>
                </Pressable>
              </View>

              {/* Verify Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && styles.btnPressed,
                  loading && styles.btnDisabled,
                ]}
                onPress={() => verifyOtp(otpDigits.join(""))}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify & Proceed</Text>
                )}
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: "center",
    flexGrow: 1,
  },

  // ── Header ──
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 290,
  },

  // ── Card ──
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
  },
  detectBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
  },

  // ── Phone Input ──
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    overflow: "hidden",
  },
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  // ── Buttons ──
  primaryBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  btnDisabled: {
    backgroundColor: "#9CA3AF",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  termsText: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 14,
    lineHeight: 16,
  },

  // ── Mock Banner ──
  mockBanner: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  mockBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  mockTag: {
    fontSize: 11,
    fontWeight: "800",
    color: "#15803D",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  mockOtpCode: {
    fontSize: 22,
    fontWeight: "900",
    color: "#15803D",
    letterSpacing: 4,
  },
  mockBannerText: {
    fontSize: 12,
    color: "#166534",
    marginBottom: 10,
  },
  mockFillBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  mockFillBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // ── OTP Boxes ──
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  otpBox: {
    width: 60,
    height: 64,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  otpBoxFilled: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  otpBoxError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 14,
  },

  // ── OTP Actions ──
  otpActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  resendText: {
    fontSize: 13,
    fontWeight: "600",
  },
  resendActive: {
    color: "#4F46E5",
  },
  resendDisabled: {
    color: "#9CA3AF",
  },
  changeNumberText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
});
