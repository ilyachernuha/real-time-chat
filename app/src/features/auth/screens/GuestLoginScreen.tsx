import Colors from "@/constants/Colors";
import Logo from "@/components/Logo";
import StyledText from "@/components/StyledText";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import InputField from "@/components/InputFields";
import { Button } from "@/components/buttons/Buttons";
import { useGuestLoginForm } from "@/features/auth/hooks/useGuestLoginForm";
import { Controller } from "react-hook-form";

export const GuestLoginScreen = () => {
  const { control, submit, isSubmitting } = useGuestLoginForm();
  const insets = useSafeAreaInsets();

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
          <StyledText font="bold">Login as a guest!</StyledText>
          <StyledText
            font="12"
            style={{ paddingVertical: 15 }}
            darkColor={Colors.dark.secondaryLightGrey}
            lightColor={Colors.dark.secondaryLightGrey}
          >
            Please provide your name
          </StyledText>
        </View>
      </View>
      <View style={{ gap: 24 }}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <InputField
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter your name"
              value={value}
              error={error?.message}
              autoCapitalize="none"
              textContentType="name"
              returnKeyType="done"
              submitBehavior="submit"
              onSubmitEditing={() => submit()}
              autoComplete="name"
            />
          )}
        />
        <Button onPress={submit} title="Log In as a Guest" disabled={isSubmitting} />
      </View>
    </KeyboardAwareScrollView>
  );
};
