import { Alert, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { Button } from "@/components/Buttons";
import { useAuth } from "@/hooks/useAuth";
import * as Yup from "yup";
import { Formik, FormikHelpers } from "formik";
import InputField from "@/components/InputFields";
import { isAxiosError } from "axios";

export interface ChangeNameFormValues {
  name: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Provide a new name"),
});

const Profile = () => {
  const { signOut, sessionId, userId, name, username, changeName } = useAuth();

  const handleChangeName = async (
    values: ChangeNameFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ChangeNameFormValues>
  ) => {
    try {
      await changeName(values.name);
      resetForm();
    } catch (error) {
      if (isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        Alert.alert("Validation Error", error.response.data.detail);
      } else {
        Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {username && <Text>Username: {username}</Text>}
      <Text>Name: {name}</Text>
      <Text>Session Id: {sessionId}</Text>
      <Text>User Id: {userId}</Text>
      <Formik<ChangeNameFormValues>
        initialValues={{ name: "" }}
        onSubmit={handleChangeName}
        validationSchema={validationSchema}
      >
        {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isSubmitting }) => (
          <View>
            <View>
              <InputField
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                placeholder="Enter new name"
                value={values.name}
                error={touched.name && errors.name}
                autoCapitalize="none"
                textContentType="name"
              />
            </View>
            <Button onPress={() => handleSubmit()} title="Change Name" disabled={isSubmitting} />
          </View>
        )}
      </Formik>
      <Button onPress={signOut} title="Sign Out" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
});

export default Profile;
