import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Logo from "../src/components/Logo";
import Heading from "../src/components/UI/Heading";
import InputField from "../src/components/UI/InputField";
import Button from "../src/components/UI/Button";
import { colors, fonts } from "../src/config/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");

  const insets = useSafeAreaInsets();

  const handleReset = async () => {
    router.navigate("/reset");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { paddingTop: 48 + insets.top }]}>
        <Logo />
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <Heading>Forgot password?</Heading>
          <Text
            style={[
              {
                color: colors.secondary.light_grey,
                textAlign: "center",
                paddingTop: 15,
              },
              fonts.regular_12,
            ]}
          >
            Do not excite! Enter your email and{"\n"}we will reset password!
          </Text>
        </View>
        <View style={{ gap: 48 }}>
          <View style={{ gap: 24 }}>
            <InputField
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <Button title="Reset" onPress={handleReset} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    backgroundColor: colors.main.black,
  },
});

export default ForgotPassword;
