import React from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { View } from "../Themed";
import { Button } from "../Buttons";

import InputField from "../InputFields";

export interface GuestLoginFormValues {
  name: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .matches(/^[^\x00-\x1F\x7F]*$/, "Name cannot contain control or non-displayable characters")
    .min(1, "Name must be at least 1 character long")
    .max(16, "Name must be no more than 16 characters long")
    .test("not-only-whitespace", "Name cannot be empty or whitespace only", (value) => {
      return value?.trim().length > 0; // Ensures the trimmed value is not an empty string
    }),
});

interface GuestLoginFormProps {
  onGuestLogin: (values: GuestLoginFormValues, formikHelpers: FormikHelpers<GuestLoginFormValues>) => void;
}

const GuestLoginForm = ({ onGuestLogin }: GuestLoginFormProps) => {
  return (
    <Formik<GuestLoginFormValues>
      initialValues={{ name: "" }}
      onSubmit={onGuestLogin}
      validationSchema={validationSchema}
    >
      {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isSubmitting }) => (
        <View style={{ gap: 24 }}>
          <InputField
            onChangeText={handleChange("name")}
            onBlur={handleBlur("name")}
            placeholder="Enter your name"
            value={values.name}
            error={touched.name && errors.name}
            autoCapitalize="none"
            textContentType="name"
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={() => handleSubmit()}
            autoComplete="name"
          />
          <Button onPress={() => handleSubmit()} title="Log In as a Guest" disabled={isSubmitting} />
        </View>
      )}
    </Formik>
  );
};

export default GuestLoginForm;
