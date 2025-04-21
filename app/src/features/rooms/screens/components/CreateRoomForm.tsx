import { Button } from "@/components/buttons/Buttons";
import { Dropdown } from "@/components/dropdown/Dropdown";
import DropdownItem from "@/components/dropdown/DropdownItem";
import Icons from "@/components/Icons";
import InputField from "@/components/InputFields";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { RoomLanguages } from "@/features/rooms/constants/RoomLanguages";
import { RoomThemes } from "@/features/rooms/constants/RoomThemes";
import { useDropdownStore } from "@/stores/dropdownStore";
import { typedEntries } from "@/utils/typedEntries";
import { zEnumFromObject } from "@/utils/zEnumFromObject";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextInput, View, Text, Pressable } from "react-native";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Too short room title").max(16, "Too long room title"),
  description: z.string().max(16, "Too long room description").optional(),
  theme: z.enum(RoomThemes, {
    required_error: "Room theme is required",
    invalid_type_error: "Invalid theme",
    message: "Please choose room theme",
  }),
  languages: z.array(zEnumFromObject(RoomLanguages)),
  tags: z.array(z.string()),
  make_public: z.boolean(),
});

export type CreateRoomFormData = z.infer<typeof formSchema>;

export type CreateRoomFormProps = {
  onSubmit: (values: CreateRoomFormData) => void;
};

export const CreateRoomForm = ({ onSubmit }: CreateRoomFormProps) => {
  const titleRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoomFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      // @ts-ignore
      theme: "",
      languages: [],
      tags: [],
      make_public: false,
    },
  });

  const { closeDropdown } = useDropdownStore();

  const themeOptions = useMemo(() => {
    return RoomThemes.map((theme) => ({
      label: theme[0].toUpperCase() + theme.slice(1),
      optionValue: theme,
    }));
  }, []);

  const languageOptions = useMemo(() => {
    return typedEntries(RoomLanguages).map(([code, name]) => ({
      label: name,
      optionValue: code,
    }));
  }, []);

  return (
    <View style={{ gap: 24 }}>
      <View>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              onChangeText={onChange}
              onFocus={closeDropdown}
              onBlur={onBlur}
              placeholder="Add room title"
              value={value}
              error={errors.title?.message}
              ref={titleRef}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputField
              onFocus={closeDropdown}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Add room description"
              value={value}
              error={errors.description?.message}
              ref={descriptionRef}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => descriptionRef.current?.blur()}
            />
          )}
        />

        <Controller
          control={control}
          name="theme"
          render={({ field: { onChange, value } }) => (
            <Dropdown
              id="theme"
              value={value && value[0].toLocaleUpperCase() + value.slice(1)}
              error={errors.theme?.message}
              placeholder="Choose room theme"
              zIndex={1000}
            >
              {themeOptions.map(({ label, optionValue }) => (
                <DropdownItem
                  label={label}
                  key={optionValue}
                  onPress={() => {
                    onChange(optionValue);
                    closeDropdown();
                  }}
                  isChosen={optionValue === value}
                />
              ))}
            </Dropdown>
          )}
        />

        <Controller
          control={control}
          name="make_public"
          render={({ field: { onChange, value } }) => (
            <View style={{ gap: 16 }}>
              <Text style={{ color: Colors.dark.text, ...Fonts[12] }}>Choose room type</Text>
              <View style={{ backgroundColor: Colors.dark.mainDarkGrey, borderRadius: 12 }}>
                <Pressable
                  onPress={() => onChange(false)}
                  style={{
                    height: 44,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 13,
                    paddingLeft: 40,
                    paddingRight: 24,
                  }}
                >
                  <Text style={{ color: Colors.dark.text, ...Fonts[14] }}>Private room</Text>
                  {!value && <Icons name="done" color={Colors.dark.mainPurple} />}
                </Pressable>
                <Pressable
                  onPress={() => onChange(true)}
                  style={{
                    height: 44,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 13,
                    paddingLeft: 40,
                    paddingRight: 24,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: Colors.dark.text, ...Fonts[14] }}>Public room</Text>
                  {value && <Icons name="done" color={Colors.dark.mainPurple} />}
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>
      <Button title="Create Room" onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />
    </View>
  );
};
