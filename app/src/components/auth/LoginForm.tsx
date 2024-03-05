import React, { useRef, useState } from "react";
import { Formik, FormikErrors, FormikHelpers, FormikTouched } from "formik";
import * as Yup from "yup";
import { View } from "../Themed";
import { Button, SecondaryButton } from "../Buttons";
import { DividerWithText } from "../Dividers";
import { Link } from "expo-router";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import InputField from "../InputFields";
import { TextInput } from "react-native";

export interface LoginFormValues {
  username: string;
  password: string;
}

const usernameValidator = Yup.string()
  .matches(/^[a-zA-Z0-9]+$/, "Only English letters and numbers are allowed")
  .min(2, "Username must be at least 2 characters long")
  .max(24, "Username must be no more than 24 characters long");

const emailValidator = Yup.string().email("Email must be a valid email");

const validationSchema = Yup.object({
  username: Yup.string()
    .required("Username or email is required")
    .test("is-username-or-email", "Must be a valid username or email", async (value) => {
      const results = await Promise.all([usernameValidator.isValid(value), emailValidator.isValid(value)]);
      return results.some((result) => result === true);
    }),
  password: Yup.string()
    .matches(/^[!-~]+$/, "Spaces and non-English letters are not allowed")
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be no more than 32 characters long")
    .required("Password is required"),
});

interface LoginFormProps {
  onLogin: (values: LoginFormValues, formikHelpers: FormikHelpers<LoginFormValues>) => void;
  onGuestLogin: (
    values: LoginFormValues,
    formikHelpers: FormikHelpers<LoginFormValues>,
    errors: FormikErrors<LoginFormValues>,
    touched: FormikTouched<LoginFormValues>
  ) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [hidePassword, setHidePassword] = useState(true);
  const passwordRef = useRef<TextInput>(null);
  return (
    <Formik<LoginFormValues>
      initialValues={{ username: "", password: "" }}
      onSubmit={onLogin}
      validationSchema={validationSchema}
    >
      {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isSubmitting, setSubmitting }) => (
        <View>
          <View>
            <InputField
              onChangeText={handleChange("username")}
              onBlur={handleBlur("username")}
              placeholder="Enter you username or email"
              value={values.username}
              error={touched.username && errors.username}
              autoCapitalize="none"
              textContentType="emailAddress"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
              autoComplete="email"
            />
            <InputField
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              placeholder="Enter your password"
              value={values.password}
              error={touched.password && errors.password}
              isPassword
              toggleHidePassword={() => setHidePassword(!hidePassword)}
              secureTextEntry={hidePassword}
              autoCapitalize="none"
              textContentType="password"
              ref={passwordRef}
              returnKeyType="done"
              blurOnSubmit={false}
              onSubmitEditing={() => handleSubmit()}
              autoComplete="password"
            />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Link
              href="/forgot"
              style={[
                {
                  color: Colors.dark.mainPurple,
                  paddingHorizontal: 4,
                  paddingVertical: 15,
                  top: -24,
                },
                Fonts.regular12,
              ]}
            >
              Forgot password?
            </Link>
          </View>
          <Button onPress={() => handleSubmit()} title="Sign In" disabled={isSubmitting} />
        </View>
      )}
    </Formik>
  );
};

export default LoginForm;
