import React, { useState } from "react";
import { Formik, FormikErrors, FormikHelpers, FormikTouched } from "formik";
import * as Yup from "yup";
import { View } from "../Themed";
import { Button, SecondaryButton } from "../Buttons";
import { DividerWithText } from "../Dividers";
import { Link } from "expo-router";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import InputField from "../InputFields";

export interface LoginFormValues {
  username: string;
  password: string;
}

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
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

const LoginForm = ({ onLogin, onGuestLogin }: LoginFormProps) => {
  const [hidePassword, setHidePassword] = useState(true);
  return (
    <Formik<LoginFormValues>
      initialValues={{ username: "", password: "" }}
      onSubmit={onLogin}
      validationSchema={validationSchema}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        touched,
        errors,
        isSubmitting,
        setSubmitting,
        ...formikHelpers
      }) => (
        <View>
          <View>
            <InputField
              onChangeText={(text) => handleChange("username")(text.replace(/[^a-zA-Z0-9]/g, ""))}
              onBlur={handleBlur("username")}
              placeholder="Enter you username"
              value={values.username}
              error={touched.username && errors.username}
              autoCapitalize="none"
              textContentType="username"
            />
            <InputField
              onChangeText={(text) => handleChange("password")(text.replace(/[^!-~]/g, ""))}
              onBlur={handleBlur("password")}
              placeholder="Enter your password"
              value={values.password}
              error={touched.password && errors.password}
              isPassword
              toggleHidePassword={() => setHidePassword(!hidePassword)}
              secureTextEntry={hidePassword}
              autoCapitalize="none"
              textContentType="password"
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
