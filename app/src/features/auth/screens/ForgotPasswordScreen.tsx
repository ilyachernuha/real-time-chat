import Logo from "@/components/Logo";
import { SafeAreaView, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import StyledText from "@/components/StyledText";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForgotPassworForm } from "@/features/auth/hooks/useForgotPasswordForm";
import InputField from "@/components/InputFields";
import { Controller } from "react-hook-form";
import { Button } from "@/components/buttons/Buttons";

export const ForgotPasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const { control, isSubmitting, submit } = useForgotPassworForm();

  return (
    <KeyboardAwareScrollView
      bottomOffset={50}
      contentContainerStyle={{ padding: 48 + insets.top, paddingHorizontal: 24 }}
      style={{ backgroundColor: Colors.dark.background }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: 24, alignItems: "center", marginBottom: 32 }}>
        <Logo />
        <View style={{ gap: 16, alignItems: "center" }}>
          <StyledText font="bold">Forgot password?</StyledText>
          <StyledText
            font="12"
            style={{ textAlign: "center" }}
            darkColor={Colors.dark.secondaryLightGrey}
            lightColor={Colors.dark.secondaryLightGrey}
          >
            Do not worry! Enter your email and{"\n"}we will reset the password!
          </StyledText>
        </View>
      </View>

      <View style={{ gap: 24 }}>
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
              returnKeyType="done"
              submitBehavior="submit"
              onSubmitEditing={submit}
              autoComplete="email"
            />
          )}
        />

        <Button onPress={submit} title="Reset" disabled={isSubmitting} />
      </View>
    </KeyboardAwareScrollView>
  );
};
