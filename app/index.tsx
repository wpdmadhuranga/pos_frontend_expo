import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { loggedIn } = useAuth();
  return <Redirect href={loggedIn ? "/(dashboard)/dashboard" : "/(auth)/login"} />;
}