import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { loginApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [PhoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    console.log("👉 Sign In button pressed!");

    if (!PhoneOrEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      console.log("🚀 Calling loginApi with:", PhoneOrEmail);

      const response = await loginApi({
        phoneOrEmail: PhoneOrEmail,
        password,
      });

      console.log("✅ API Response received:", response);

      if (response.status === 200) {
        await signIn(response.data);
        router.replace("/(dashboard)/(tabs)/dashboard");
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
      className="flex-1 bg-[#070b0f]"
    >
      <Image
        source={require("../../assets/images/login.jpg")}
        contentFit="cover"
        cachePolicy="memory-disk"
        className="absolute inset-0 h-full w-full"
        style={{
          opacity: 0.55,
        }}
      />

      <View className="absolute inset-0 bg-[rgba(5,9,13,0.55)]" />

      {/* TEAL AMBIENT GLOW */}
      <View
        className="absolute -top-[110px] self-center rounded-full bg-[rgba(0,212,170,0.10)]"
        style={{
          width: 360,
          height: 360,
        }}
      />

      {/* MAIN CONTENT */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-end",
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* BRAND */}
        <View className="flex-1 items-center justify-center pb-6">
          {/* App Icon */}
          <View
            className="mb-5 items-center justify-center rounded-[24px] border-[1.5px] border-[rgba(0,212,170,0.35)] bg-[rgba(0,212,170,0.13)]"
            style={{
              width: 82,
              height: 82,
              shadowColor: "#00d4aa",
              shadowOffset: {
                width: 0,
                height: 6,
              },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <MaterialCommunityIcons
              name="wrench-clock"
              size={36}
              color="#00d4aa"
            />
          </View>

          {/* App Title */}
          <Text className="mb-2 text-[32px] font-bold tracking-[-0.5px] text-[#f4f7f8]">
            SwiftServe POS
          </Text>

          {/* Subtitle */}
          <Text className="text-[16px] text-[rgba(235,242,244,0.72)]">
            Service Center Management
          </Text>
        </View>

        {/* LOGIN CARD */}
        <View
          className="rounded-[24px] border border-[rgba(255,255,255,0.14)] bg-[rgba(8,14,19,0.94)] p-6"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 9,
          }}
        >
          {/* Card Title */}
          <Text className="mb-1 text-[21px] font-bold text-[#f0f4f5]">
            Sign in
          </Text>

          {/* Card Subtitle */}
          <Text className="mb-5 text-[14px] text-[rgba(220,230,232,0.58)]">
            Enter your credentials to continue
          </Text>

          {/* ERROR */}
          {errorMessage && (
            <View className="mb-4 flex-row items-center rounded-xl border border-[rgba(255,69,58,0.30)] bg-[rgba(255,69,58,0.13)] px-3 py-[11px]">
              <Ionicons name="alert-circle-outline" size={18} color="#ff6b6b" />

              <Text className="ml-2 flex-1 text-center text-[14px] text-[#ff6b6b]">
                {errorMessage}
              </Text>
            </View>
          )}

          {/* EMAIL */}
          <View className="mb-[14px]">
            <Text className="mb-[6px] text-[14px] font-medium text-[#8b98ad]">
              Email
            </Text>

            <View className="relative flex-row items-center">
              <Ionicons
                name="mail-outline"
                size={19}
                color="#8290a5"
                style={{
                  position: "absolute",
                  left: 14,
                  zIndex: 1,
                }}
              />

              <TextInput
                className="w-full rounded-2xl border border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.065)] py-3 pl-[42px] pr-4 text-[16px] text-[#e8eef0]"
                placeholder="Email address"
                placeholderTextColor="#68758a"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={PhoneOrEmail}
                onChangeText={setPhoneOrEmail}
              />
            </View>
          </View>

          {/* PASSWORD */}
          <View className="mb-[14px]">
            <Text className="mb-[6px] text-[14px] font-medium text-[#8b98ad]">
              Password
            </Text>

            <View className="relative flex-row items-center">
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color="#8290a5"
                style={{
                  position: "absolute",
                  left: 14,
                  zIndex: 1,
                }}
              />

              <TextInput
                className="w-full rounded-2xl border border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.065)] py-3 pl-[42px] pr-[48px] text-[16px] text-[#e8eef0]"
                placeholder="••••••••"
                placeholderTextColor="#68758a"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                activeOpacity={0.7}
                className="absolute right-[14px] items-center justify-center"
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={19}
                  color="#8290a5"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* OPTIONS */}
          <View className="mt-1 mb-[14px] flex-row items-center justify-between">
            {/* Remember Me */}
            <TouchableOpacity
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <View className="h-4 w-4 items-center justify-center rounded-[4px] border border-[rgba(0,212,170,0.38)] bg-[rgba(0,212,170,0.15)]">
                <Ionicons name="checkmark" size={11} color="#00d4aa" />
              </View>

              <Text className="ml-2 text-[14px] text-[#8290a5]">
                Remember me
              </Text>
            </TouchableOpacity>
          </View>

          {/* SIGN IN BUTTON */}
          <TouchableOpacity
            className={`mt-2 w-full items-center justify-center rounded-2xl bg-[#00d4aa] py-4 ${
              loading ? "opacity-60" : "opacity-100"
            }`}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
            style={{
              shadowColor: "#00d4aa",
              shadowOffset: {
                width: 0,
                height: 6,
              },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#061411" />

                <Text className="ml-2 text-[16px] font-bold text-[#061411]">
                  Signing in…
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Text className="text-[16px] font-bold text-[#061411]">
                  Sign In
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#061411"
                  style={{
                    marginLeft: 8,
                  }}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <Text className="mt-4 text-center text-[12px] text-[rgba(255,255,255,0.32)]">
          SwiftServe POS v2.4 · © 2026 SwiftServe Inc.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
