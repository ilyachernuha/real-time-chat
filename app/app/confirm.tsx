import { useState } from "react";
import { useDispatch } from "react-redux";
import authService from "../src/services/authService";
import { setCurrentUser } from "../src/store/chatSlice";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Logo from "../src/components/Logo";
import Heading from "../src/components/UI/Heading";
import InputField from "../src/components/UI/InputField";
import Button from "../src/components/UI/Button";
import { colors, fonts } from "../src/config/theme";
import { Link, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Confirm = () => {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const dispatch = useDispatch();

  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    router.navigate("/confirm");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { paddingTop: 151 + insets.top }]}>
          <Logo />
          <View style={{ marginTop: 24, marginBottom: 32 }}>
            <Heading>Confirm your email</Heading>
            <Text
              style={[
                {
                  color: colors.secondary.light_grey,
                  textAlign: "center",
                  paddingVertical: 15,
                },
                fonts.regular_12,
              ]}
            >
              We have sent you an email! Confirm your email address to continue
              with your registration!
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: colors.main.black,
  },
});

export default Confirm;
