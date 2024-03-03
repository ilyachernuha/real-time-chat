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
  name: Yup.string().required("Name is required"),
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
            placeholder="Enter you username"
            value={values.name}
            error={touched.name && errors.name}
            autoCapitalize="none"
            textContentType="name"
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={() => handleSubmit()}
          />
          <Button onPress={() => handleSubmit()} title="Log In as a Guest" disabled={isSubmitting} />
        </View>
      )}
    </Formik>
  );
};

export default GuestLoginForm;
