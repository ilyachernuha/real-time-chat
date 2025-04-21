import React, { useCallback, useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { Controller } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Logo from "@/components/Logo";
import StyledText from "@/components/StyledText";
import Colors from "@/constants/Colors";
import Link from "@/components/Link";
import { DividerWithText } from "@/components/Dividers";
import { Button, SecondaryButton } from "@/components/buttons/Buttons";
import InputField from "@/components/InputFields";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

export const LoginScreen = () => {
  const { control, submit, isSubmitting } = useLoginForm();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [hidePassword, setHidePassword] = useState(true);
  const toggleHidePassword = () => {
    setHidePassword((prev) => !prev);
  };
  const passwordRef = useRef<TextInput | null>(null);

  return (
    <KeyboardAwareScrollView
      bottomOffset={50}
      contentContainerStyle={{ padding: 48 + insets.top, paddingHorizontal: 24 }}
      style={{ backgroundColor: Colors.dark.background }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <Logo />
        <StyledText style={{ marginBottom: 2, marginTop: 24 }} font="bold">
          Welcome back!
        </StyledText>
        <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
          <StyledText font="12" darkColor={Colors.dark.secondaryLightGrey} lightColor={Colors.dark.secondaryLightGrey}>
            Do not have an account?
          </StyledText>
          <Link style={{ paddingVertical: 15 }} href="/register">
            Sign Up!
          </Link>
        </View>
      </View>
      <View>
        <Controller
          control={control}
          name="username"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <InputField
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Enter you username or email"
              error={error?.message}
              autoCapitalize="none"
              textContentType="emailAddress"
              returnKeyType="next"
              submitBehavior="submit"
              autoComplete="email"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <InputField
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={error?.message}
              placeholder="Enter your password"
              isPassword
              toggleHidePassword={toggleHidePassword}
              secureTextEntry={hidePassword}
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="done"
              submitBehavior="submit"
              onSubmitEditing={submit}
              autoComplete="password"
              ref={passwordRef}
            />
          )}
        />
        <Link style={{ alignSelf: "flex-end", paddingRight: 4, marginBottom: 32 }} href="/forgot-password">
          Forgot password?
        </Link>
      </View>
      <Button onPress={submit} title="Sign In" disabled={isSubmitting} />
      <DividerWithText text="or" />
      <SecondaryButton title="Log In as a Guest" onPress={() => router.navigate("/guest-login")} />
    </KeyboardAwareScrollView>
  );
};
