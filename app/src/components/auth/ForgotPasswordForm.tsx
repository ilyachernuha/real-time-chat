import React from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { View } from "../Themed";
import { Button } from "../Buttons";
import InputField from "../InputFields";

export interface ForgotPasswordFormValues {
  email: string;
}

const validationSchema = Yup.object({
  email: Yup.string().email("Email must be a valid email").required("Please provide your email"),
});

interface ForgotPasswordFormProps {
  onForgot: (values: ForgotPasswordFormValues, formikHelpers: FormikHelpers<ForgotPasswordFormValues>) => void;
}

const ForgotPasswordForm = ({ onForgot }: ForgotPasswordFormProps) => {
  return (
    <Formik<ForgotPasswordFormValues>
      initialValues={{ email: "" }}
      onSubmit={onForgot}
      validationSchema={validationSchema}
      validateOnBlur={false}
      validateOnChange={false}
    >
      {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isSubmitting }) => (
        <View style={{ gap: 24 }}>
          <InputField
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
            placeholder="Enter you email"
            value={values.email}
            error={touched.email && errors.email}
            autoCapitalize="none"
            textContentType="emailAddress"
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={() => handleSubmit()}
            autoComplete="email"
          />
          <Button onPress={() => handleSubmit()} title="Reset" disabled={isSubmitting} />
        </View>
      )}
    </Formik>
  );
};

export default ForgotPasswordForm;
