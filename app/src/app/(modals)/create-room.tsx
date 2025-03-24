import CreateRoomHeader from "@/components/headers/CreateRoomHeader";
import Icons from "@/components/Icons";
import Colors from "@/constants/Colors";
import { Stack, useRouter } from "expo-router";
import { View, TextInput, Pressable, Text, Alert } from "react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { RoomTheme, RoomThemes } from "@/constants/RoomThemes";
import { RoomLanguageCode, RoomLanguages } from "@/constants/RoomLanguages";
import InputField from "@/components/InputFields";
import { Button } from "@/components/Buttons";
import DropDownPicker from "react-native-dropdown-picker";
import Fonts from "@/constants/Fonts";
import { isAxiosError } from "axios";
import RoomsService from "@/services/RoomsService";

export interface CreateRoomFormValues {
  title: string;
  description?: string;
  theme: RoomTheme;
  languages: RoomLanguageCode[];
  tags: string[];
  make_public: boolean;
}

const validationSchema = Yup.object({
  title: Yup.string().required("Room title is required"),
  description: Yup.string(),
  theme: Yup.string(),
  languages: Yup.array(),
  tags: Yup.array(Yup.string()),
  makePublic: Yup.boolean(),
});

interface CreateRoomFormProps {
  onSubmit: (values: CreateRoomFormValues, formikHelpers: FormikHelpers<CreateRoomFormValues>) => void;
}

const CreateRoomForm = ({ onSubmit }: CreateRoomFormProps) => {
  // const [hidePassword, setHidePassword] = useState(true);

  const titleRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  // const themeRef = useRef<TextInput>(null);
  // const languagesRef = useRef<TextInput>(null);
  // const tagsRef = useRef<TextInput>(null);
  // const makePublicRef = useRef<TextInput>(false);

  const [themeOpen, setThemeOpen] = useState(false);
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const [languagesValue, setLanguagesValue] = useState(null);

  const onThemeOpen = useCallback(() => {
    setLanguagesOpen(false);
  }, []);

  const onLanguageOpen = useCallback(() => {
    setThemeOpen(false);
  }, []);

  const languageItems = useMemo(() => {
    return Object.entries(RoomLanguages).map(([key, value]) => ({
      label: value,
      value: key,
    }));
  }, []);

  return (
    <Formik<CreateRoomFormValues>
      initialValues={{ title: "", description: "", theme: "art", languages: [], tags: [], make_public: false }}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      validateOnBlur={false}
    >
      {({ handleChange, handleBlur, handleSubmit, values, touched, errors, isSubmitting, setFieldValue }) => (
        <View style={{ gap: 24 }}>
          <View>
            <InputField
              onChangeText={handleChange("title")}
              onBlur={handleBlur("title")}
              placeholder="Add room title"
              value={values.title}
              error={touched.title && errors.title}
              ref={titleRef}
              returnKeyType="next"
              onSubmitEditing={() => titleRef.current?.focus()}
            />
            <InputField
              onChangeText={handleChange("description")}
              onBlur={handleBlur("description")}
              placeholder="Add room description"
              value={values.description}
              error={touched.description && errors.description}
              ref={descriptionRef}
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />
            <DropDownPicker
              open={themeOpen}
              onOpen={onThemeOpen}
              value={values.theme}
              items={RoomThemes.map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value }))}
              setOpen={setThemeOpen}
              setValue={(callback) => setFieldValue("theme", callback(values.theme))}
              placeholder="Choose room theme"
              style={{
                marginBottom: 24,
                borderWidth: 1,
                minHeight: 44,
                paddingHorizontal: 16,
                paddingRight: 8,
                backgroundColor: Colors.dark.mainDarkGrey,
                borderColor: Colors.dark.secondaryLightGrey,
                borderRadius: 12,
              }}
              textStyle={{ color: Colors.dark.text, ...Fonts[14] }}
              placeholderStyle={{ color: Colors.dark.secondaryLightGrey }}
              dropDownContainerStyle={{
                backgroundColor: Colors.dark.mainDarkGrey,
                borderColor: Colors.dark.secondaryLightGrey,
              }}
              ArrowDownIconComponent={() => <Icons name="drop-down" color={Colors.dark.secondaryLightGrey} />}
              ArrowUpIconComponent={() => <Icons name="drop-up" color={Colors.dark.secondaryLightGrey} />}
              TickIconComponent={() => <Icons name="done" color={Colors.dark.mainPurple} />}
              zIndex={3000}
              zIndexInverse={1000}
            />
            <DropDownPicker
              open={languagesOpen}
              onOpen={onLanguageOpen}
              value={languagesValue}
              items={languageItems}
              setOpen={setLanguagesOpen}
              setValue={setLanguagesValue}
              onChangeValue={(value) => setFieldValue("languages", value)}
              placeholder="Choose room languages"
              style={{
                borderWidth: 1,
                minHeight: 44,
                paddingHorizontal: 16,
                paddingRight: 8,
                backgroundColor: Colors.dark.mainDarkGrey,
                borderColor: Colors.dark.secondaryLightGrey,
                borderRadius: 12,
              }}
              textStyle={{ color: Colors.dark.text, ...Fonts[14] }}
              placeholderStyle={{ color: Colors.dark.secondaryLightGrey }}
              dropDownContainerStyle={{
                backgroundColor: Colors.dark.mainDarkGrey,
                borderColor: Colors.dark.secondaryLightGrey,
              }}
              ArrowDownIconComponent={() => <Icons name="drop-down" color={Colors.dark.secondaryLightGrey} />}
              ArrowUpIconComponent={() => <Icons name="drop-up" color={Colors.dark.secondaryLightGrey} />}
              TickIconComponent={() => <Icons name="done" color={Colors.dark.mainPurple} />}
              multiple
              min={0}
              max={5}
              zIndex={2000}
              zIndexInverse={2000}
              searchable
              mode="BADGE"
              showBadgeDot={false}
              // badgeTextStyle={{color: Colors.dark.text}}
              // badgeColors={[Colors.dark.background]}
              badgeColors={[Colors.dark.mainPurple]}
              searchPlaceholderTextColor={Colors.dark.secondaryLightGrey}
              searchPlaceholder="Search"
              searchContainerStyle={{ borderColor: Colors.dark.mainDarkGrey }}
              searchTextInputStyle={{ borderColor: Colors.dark.secondaryLightGrey, color: Colors.dark.text }}
            />
            {/* <InputField
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
            /> */}
          </View>
          <Button onPress={() => handleSubmit()} title="Create Room" disabled={isSubmitting} />
        </View>
      )}
    </Formik>
  );
};

export default function CreateRoomModal() {
  const router = useRouter();

  const handleSubmit = async (values: CreateRoomFormValues, { setSubmitting }: FormikHelpers<CreateRoomFormValues>) => {
    console.log(values);
    try {
      const res = await RoomsService.createRoom(values);
      router.back();
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
    <>
      <Stack.Screen options={{ presentation: "modal", headerShown: true, header: () => <CreateRoomHeader /> }} />
      <View style={{ padding: 24, gap: 24, flex: 1 }}>
        <View
          style={{
            width: 100,
            height: 100,
            backgroundColor: Colors.dark.mainDarkGrey,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <Icons name="image" size={30} color={Colors.dark.text} />
        </View>

        <CreateRoomForm onSubmit={handleSubmit} />

        {/* <Text>Create a new room</Text> */}
        {/* <Button title="Close" onPress={() => router.back()} /> */}
      </View>
    </>
  );
}
