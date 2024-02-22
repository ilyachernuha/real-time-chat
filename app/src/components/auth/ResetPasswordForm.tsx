import React, { useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { View } from "../Themed";
import { Button } from "../Buttons";
import InputField from "../InputFields";

export interface ResetPasswordFormValues {
  password: string;
  passwordConfirm: string;
}

const validationSchema = Yup.object({
  password: Yup.string()
    .matches(/^[!-~]+$/, "Spaces and non-English letters are not allowed")
    .min(8, "Password must be 8 to 32 characters long")
    .max(32, "Password must be 8 to 32 characters long")
    .required("Password is required"),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

interface ResetPasswordFormProps {
  onReset: (values: ResetPasswordFormValues, formikHelpers: FormikHelpers<ResetPasswordFormValues>) => void;
}

const ResetPasswordForm = ({ onReset }: ResetPasswordFormProps) => {
  const [hidePassword, setHidePassword] = useState(true);
  return (
    <Formik<ResetPasswordFormValues>
      initialValues={{ password: "", passwordConfirm: "" }}
      onSubmit={onReset}
      validationSchema={validationSchema}
    >
      {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isSubmitting }) => (
        <View style={{ gap: 24 }}>
          <View>
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
            <InputField
              onChangeText={(text) => handleChange("passwordConfirm")(text.replace(/[^!-~]/g, ""))}
              onBlur={handleBlur("passwordConfirm")}
              placeholder="Confirm your password"
              value={values.passwordConfirm}
              error={touched.passwordConfirm && errors.passwordConfirm}
              isPassword
              toggleHidePassword={() => setHidePassword(!hidePassword)}
              secureTextEntry={hidePassword}
              autoCapitalize="none"
              textContentType="password"
            />
          </View>
          <Button onPress={() => handleSubmit()} title="Change password" disabled={isSubmitting} />
        </View>
      )}
    </Formik>
  );
};

export default ResetPasswordForm;
