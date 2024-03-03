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
  onReset: (values: ForgotPasswordFormValues, formikHelpers: FormikHelpers<ForgotPasswordFormValues>) => void;
}

const ForgotPasswordForm = ({ onReset }: ForgotPasswordFormProps) => {
  return (
    <Formik<ForgotPasswordFormValues>
      initialValues={{ email: "" }}
      onSubmit={onReset}
      validationSchema={validationSchema}
    >
      {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isSubmitting }) => (
        <View style={{ gap: 24 }}>
          <InputField
            onChangeText={(text) => handleChange("email")(text.replace(/[^a-zA-Z0-9.@\-_+]/g, ""))}
            onBlur={handleBlur("email")}
            placeholder="Enter you email"
            value={values.email}
            error={touched.email && errors.email}
            autoCapitalize="none"
            textContentType="emailAddress"
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={() => handleSubmit()}
          />
          <Button onPress={() => handleSubmit()} title="Reset" disabled={isSubmitting} />
        </View>
      )}
    </Formik>
  );
};

export default ForgotPasswordForm;
