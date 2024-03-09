import React, { useCallback, useRef, useState } from "react";
import { Formik, FormikHelpers, useFormikContext } from "formik";
import * as Yup from "yup";
import { View } from "../Themed";
import { Button } from "../Buttons";
import InputField from "../InputFields";
import { TextInput } from "react-native";
import Link from "../Link";
import { useFocusEffect } from "expo-router";

export interface LoginFormValues {
  username: string;
  password: string;
}

const usernameValidator = Yup.string()
  .matches(/^[a-zA-Z0-9]+$/)
  .min(2)
  .max(24);

const emailValidator = Yup.string().email("Email must be a valid email");

const validationSchema = Yup.object({
  username: Yup.string()
    .required("Username or email is required")
    .test("is-username-or-email", "Must be a valid username or email", async (value) => {
      const results = await Promise.all([usernameValidator.isValid(value), emailValidator.isValid(value)]);
      return results.some((result) => result === true);
    }),
  password: Yup.string()
    .matches(/^[!-~]+$/, "Must be a valid password")
    .min(8, "Must be a valid password")
    .max(32, "Must be a valid password")
    .required("Password is required"),
});

interface LoginFormProps {
  onLogin: (values: LoginFormValues, formikHelpers: FormikHelpers<LoginFormValues>) => void;
}

const FormReset = () => {
  const { resetForm } = useFormikContext();

  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [resetForm])
  );

  return <></>;
};

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [hidePassword, setHidePassword] = useState(true);
  const passwordRef = useRef<TextInput>(null);

  return (
    <Formik<LoginFormValues>
      initialValues={{ username: "", password: "" }}
      onSubmit={onLogin}
      validationSchema={validationSchema}
      validateOnBlur={false}
    >
      {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isSubmitting }) => (
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
              style={{
                paddingHorizontal: 4,
                paddingVertical: 15,
                top: -24,
              }}
            >
              Forgot password?
            </Link>
          </View>
          <Button onPress={() => handleSubmit()} title="Sign In" disabled={isSubmitting} />
          <FormReset />
        </View>
      )}
    </Formik>
  );
};

export default LoginForm;
