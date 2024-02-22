import React, { useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { View } from "../Themed";
import { Button } from "../Buttons";
import { Link } from "expo-router";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import InputField from "../InputFields";

export interface GuestLoginFormValues {
  username: string;
}

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
});

interface GuestLoginFormProps {
  onGuestLogin: (values: GuestLoginFormValues, formikHelpers: FormikHelpers<GuestLoginFormValues>) => void;
}

const GuestLoginForm = ({ onGuestLogin }: GuestLoginFormProps) => {
  return (
    <Formik<GuestLoginFormValues>
      initialValues={{ username: "" }}
      onSubmit={onGuestLogin}
      validationSchema={validationSchema}
    >
      {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isSubmitting }) => (
        <View style={{ gap: 24 }}>
          <InputField
            onChangeText={(text) => handleChange("username")(text.replace(/[^a-zA-Z0-9]/g, ""))}
            onBlur={handleBlur("username")}
            placeholder="Enter you username"
            value={values.username}
            error={touched.username && errors.username}
            autoCapitalize="none"
            textContentType="username"
          />
          <Button onPress={() => handleSubmit()} title="Log In as a Guest" disabled={isSubmitting} />
        </View>
      )}
    </Formik>
  );
};

export default GuestLoginForm;
