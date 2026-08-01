import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
// Import your API client function here:
import { loginApi } from "../../api/authApi";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1779599507365-1944b37b2980?w=800&h=1600&fit=crop&auto=format&q=80";

export default function Login() {
  const [PhoneOrEmail, setPhoneOrEmail] = useState("alex@swiftserve.com");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signIn } = useAuth();
  const router = useRouter();

  // const handleSubmit = async () => {
  //   if (!email || !password) {
  //     setErrorMessage("Please enter both email and password.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setErrorMessage(null);

  //     // --- REPLACE THIS BLOCK WITH YOUR REAL API CALL ---
  //     // const response = await loginApi({ email, password });
  //     // await signIn(response.token);

  //     // Temporary simulated API call matching your context:
  //     await new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         if (password === "wrong") reject(new Error("Invalid credentials"));
  //         else resolve({ token: "mock-jwt-token-12345" });
  //       }, 1400);
  //     });

  //     await signIn("mock-jwt-token-12345");
  //     // --------------------------------------------------
  //   } catch (err: any) {
  //     setErrorMessage(err.message || "Failed to sign in. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  const handleSubmit = async () => {
    console.log("👉 Sign In button pressed!"); // Check if this shows up in your Metro bundler console

    if (!PhoneOrEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      console.log("🚀 Calling loginApi with:", PhoneOrEmail);
      const response = await loginApi({ phoneOrEmail: PhoneOrEmail, password });
      console.log("✅ API Response received:", response);

      if (response.status === 200) {
        await signIn(response.data);
        router.replace("/(dashboard)/dashboard");
      }
    } catch (err: any) {
      console.error("❌ Login error caught:", err);
      setErrorMessage(
        err.message || "Network request failed. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Background Image */}
      <Image
        source={{ uri: BG_IMAGE }}
        style={styles.bgImage}
        contentFit="cover"
      />

      {/* Dark Gradient Overlay equivalent */}
      <View style={styles.overlay} />

      {/* Teal Glow Top Effect */}
      <View style={styles.tealGlow} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header — Upper Area */}
        <View style={styles.brandContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="wrench-clock"
              size={36}
              color="#00d4aa"
            />
          </View>

          <Text style={styles.title}>SwiftServe POS</Text>
          <Text style={styles.subtitle}>Service Center Management</Text>

          {/* Stats Pills */}
          <View style={styles.statsRow}>
            {[
              { value: "2,400+", label: "Jobs done" },
              { value: "$48K", label: "This month" },
              { value: "4.9★", label: "Rating" },
            ].map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>Sign in</Text>
          <Text style={styles.cardSubtitle}>
            Enter your credentials to continue
          </Text>

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={18}
                color="#4a5568"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Email address"
                placeholderTextColor="#4a5568"
                keyboardType="email-address"
                autoCapitalize="none"
                value={PhoneOrEmail}
                onChangeText={setPhoneOrEmail}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#4a5568"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, { paddingRight: 40 }]}
                placeholder="••••••••"
                placeholderTextColor="#4a5568"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={styles.eyeIconContainer}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#4a5568"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Options row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.rememberMe}>
              <View style={styles.checkbox}>
                <Ionicons name="checkmark" size={10} color="#00d4aa" />
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#080a0d" />
                <Text style={styles.submitButtonText}>Signing in…</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          SwiftServe POS v2.4 · © 2026 SwiftServe Inc.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080a0d",
  },
  bgImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.28,
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(8,10,13,0.85)",
  },
  tealGlow: {
    position: "absolute",
    top: -80,
    alignSelf: "center",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(0,212,170,0.12)",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 60,
  },
  brandContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(0,212,170,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(0,212,170,0.28)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f0f2f6",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    alignItems: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e8eaf0",
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
  },
  loginCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(14,17,24,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e8eaf0",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 69, 58, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 69, 58, 0.3)",
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#ff453a",
    fontSize: 12,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7a94",
    marginBottom: 6,
  },
  inputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    zIndex: 1,
  },
  textInput: {
    width: "100%",
    paddingLeft: 42,
    paddingRight: 16,
    paddingVertical: 12,
    borderRadius: 16,
    fontSize: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    color: "#e8eaf0",
  },
  eyeIconContainer: {
    position: "absolute",
    right: 14,
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 14,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "rgba(0,212,170,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,212,170,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 12,
    color: "#6b7a94",
  },
  forgotText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#00d4aa",
  },
  submitButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#00d4aa",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#00d4aa",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#080a0d",
  },
  footerText: {
    textAlign: "center",
    fontSize: 10,
    color: "rgba(255,255,255,0.15)",
    marginTop: 16,
  },
});
