import React, { useRef, useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { View } from "../Themed";
import { Button } from "../Buttons";
import InputField from "../InputFields";
import { TextInput } from "react-native";

export interface RegistrationFormValues {
  email: string;
  username: string;
  password: string;
  passwordConfirm: string;
}

const validationSchema = Yup.object({
  email: Yup.string().email("Email must be a valid email").required("Email is required"),
  username: Yup.string()
    .matches(/^[a-zA-Z0-9]+$/, "Only English letters and numbers are allowed")
    .min(2, "Username must be at least 2 characters long")
    .max(24, "Username must be no more than 24 characters long")
    .required("Username is required"),
  password: Yup.string()
    .matches(/^[!-~]+$/, "Spaces and non-English letters are not allowed")
    .min(8, "Password must be at least 8 characters long")
    .max(32, "Password must be no more than 32 characters long")
    .required("Password is required"),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

interface RegistrationFormProps {
  onRegister: (values: RegistrationFormValues, formikHelpers: FormikHelpers<RegistrationFormValues>) => void;
}

const RegistrationForm = ({ onRegister }: RegistrationFormProps) => {
  const [hidePassword, setHidePassword] = useState(true);

  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const passwordConfirmRef = useRef<TextInput>(null);

  return (
    <Formik<RegistrationFormValues>
      initialValues={{ email: "", username: "", password: "", passwordConfirm: "" }}
      onSubmit={onRegister}
      validationSchema={validationSchema}
    >
      {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isSubmitting }) => (
        <View style={{ gap: 24 }}>
          <View>
            <InputField
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              placeholder="Enter you email"
              value={values.email}
              error={touched.email && errors.email}
              autoCapitalize="none"
              textContentType="emailAddress"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => usernameRef.current?.focus()}
              autoComplete="email"
            />
            <InputField
              onChangeText={handleChange("username")}
              onBlur={handleBlur("username")}
              placeholder="Enter you username"
              value={values.username}
              error={touched.username && errors.username}
              autoCapitalize="none"
              textContentType="username"
              ref={usernameRef}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
              autoComplete="username"
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
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordConfirmRef.current?.focus()}
              autoComplete="password"
            />
            <InputField
              onChangeText={handleChange("passwordConfirm")}
              onBlur={handleBlur("passwordConfirm")}
              placeholder="Confirm your password"
              value={values.passwordConfirm}
              error={touched.passwordConfirm && errors.passwordConfirm}
              isPassword
              toggleHidePassword={() => setHidePassword(!hidePassword)}
              secureTextEntry={hidePassword}
              autoCapitalize="none"
              textContentType="password"
              ref={passwordConfirmRef}
              returnKeyType="done"
              blurOnSubmit={false}
              onSubmitEditing={() => handleSubmit()}
              autoComplete="password"
            />
          </View>
          <Button onPress={() => handleSubmit()} title="Create an account" disabled={isSubmitting} />
        </View>
      )}
    </Formik>
  );
};

export default RegistrationForm;
