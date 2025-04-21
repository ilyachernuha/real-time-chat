import Logo from "@/components/Logo";
import StyledText from "@/components/StyledText";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { TextInput } from "react-native";
import { useResetPasswordForm } from "@/features/auth/hooks/useResetPasswordForm";
import { Controller } from "react-hook-form";
import InputField from "@/components/InputFields";
import { useRef, useState } from "react";
import { Button } from "@/components/buttons/Buttons";

export const ResetPasswordScreen = () => {
  const { control, isSubmitting, submit } = useResetPasswordForm();
  const [hidePassword, setHidePassword] = useState(true);
  const passwordConfirmRef = useRef<TextInput>(null);

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48 }}>
      <View style={{ alignItems: "center" }}>
        <Logo />
      </View>
      <View style={{ marginTop: 24, marginBottom: 32 }}>
        <StyledText font="bold" style={{ textAlign: "center" }}>
          Reset password!
        </StyledText>
        <StyledText
          font="12"
          style={{ textAlign: "center", paddingTop: 15 }}
          darkColor={Colors.dark.secondaryLightGrey}
          lightColor={Colors.dark.secondaryLightGrey}
        >
          Enter a new password to restore access
        </StyledText>
      </View>

      <View style={{ gap: 24 }}>
        <View>
          <Controller
            control={control}
            name="password"
            render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
              <InputField
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={error?.message}
                placeholder="Enter your password"
                isPassword
                toggleHidePassword={() => setHidePassword(!hidePassword)}
                secureTextEntry={hidePassword}
                autoCapitalize="none"
                textContentType="password"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordConfirmRef.current?.focus()}
                autoComplete="new-password"
              />
            )}
          />

          <Controller
            control={control}
            name="passwordConfirm"
            render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
              <InputField
                onBlur={onBlur}
                onChangeText={onChange}
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
                autoComplete="new-password"
              />
            )}
          />
        </View>
        <Button onPress={submit} title="Change password" disabled={isSubmitting} />
      </View>
    </SafeAreaView>
  );
};
