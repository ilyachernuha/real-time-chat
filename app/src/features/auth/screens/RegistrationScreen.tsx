import Colors from "@/constants/Colors";
import { View } from "@/components/Themed";
import Logo from "@/components/Logo";
import { TextInput } from "react-native";
import StyledText from "@/components/StyledText";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InputField from "@/components/InputFields";
import { Button } from "@/components/buttons/Buttons";
import { useRegistrationForm } from "@/features/auth/hooks/useRegistrationForm";
import { Controller } from "react-hook-form";
import TextButton from "@/components/buttons/TextButton";
import { useRouter } from "expo-router";

export const RegistrationScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [hidePassword, setHidePassword] = useState(true);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const passwordConfirmRef = useRef<TextInput>(null);

  const { control, isSubmitting, submit } = useRegistrationForm();

  return (
    <KeyboardAwareScrollView
      bottomOffset={50}
      contentContainerStyle={{ padding: 48 + insets.top, paddingHorizontal: 24 }}
      style={{ backgroundColor: Colors.dark.background }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: 24, alignItems: "center", marginBottom: 32 }}>
        <Logo />
        <View style={{ gap: 2, alignItems: "center" }}>
          <StyledText font="bold">Create an account</StyledText>
          <View style={{ flexDirection: "row", gap: 4, alignItems: "center", justifyContent: "center" }}>
            <StyledText
              font="12"
              darkColor={Colors.dark.secondaryLightGrey}
              lightColor={Colors.dark.secondaryLightGrey}
            >
              I have an account!
            </StyledText>
            {/* <Link href="/login">
              Sign In!
            </Link> */}
            <TextButton style={{ paddingVertical: 15 }} onPress={() => router.back()}>
              Sign In!
            </TextButton>
          </View>
        </View>
      </View>

      <View style={{ gap: 24 }}>
        <View>
          <Controller
            control={control}
            name="email"
            render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
              <InputField
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={error?.message}
                placeholder="Enter you email"
                autoCapitalize="none"
                textContentType="emailAddress"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => usernameRef.current?.focus()}
                autoComplete="email"
              />
            )}
          />

          <Controller
            control={control}
            name="username"
            render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
              <InputField
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={error?.message}
                placeholder="Enter you username"
                autoCapitalize="none"
                textContentType="username"
                ref={usernameRef}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
                autoComplete="username"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
              <InputField
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={error?.message}
                placeholder="Enter your password"
                isPassword
                toggleHidePassword={() => setHidePassword(!hidePassword)}
                secureTextEntry={hidePassword}
                autoCapitalize="none"
                textContentType="password"
                ref={passwordRef}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordConfirmRef.current?.focus()}
                autoComplete="password"
              />
            )}
          />

          <Controller
            control={control}
            name="passwordConfirm"
            render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
              <InputField
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={error?.message}
                placeholder="Confirm your password"
                isPassword
                toggleHidePassword={() => setHidePassword(!hidePassword)}
                secureTextEntry={hidePassword}
                autoCapitalize="none"
                textContentType="password"
                ref={passwordConfirmRef}
                returnKeyType="done"
                submitBehavior="submit"
                onSubmitEditing={submit}
                autoComplete="password"
              />
            )}
          />
        </View>
        <Button onPress={submit} title="Create an account" disabled={isSubmitting} />
      </View>
    </KeyboardAwareScrollView>
  );
};
