import { Button } from "@/components/buttons/Buttons";
import { Dropdown } from "@/components/dropdown/Dropdown";
import DropdownItem from "@/components/dropdown/DropdownItem";
import Icons from "@/components/Icons";
import InputField from "@/components/InputFields";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { themeOptions } from "@/features/rooms/constants/RoomThemes";
import { CreateRoomFormData } from "@/features/rooms/validators/createRoomSchema";
import { useDropdownStore } from "@/stores/dropdownStore";
import { useRef } from "react";
import { Control, Controller } from "react-hook-form";
import { TextInput, View, Text, Pressable } from "react-native";

type Props = {
  control: Control<CreateRoomFormData>;
  submit: () => Promise<void>;
  isSubmitting: boolean;
};

export const CreateRoomForm = ({ control, submit, isSubmitting }: Props) => {
  const titleRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  const closeDropdown = useDropdownStore.getState().closeDropdown;

  return (
    <View style={{ gap: 24 }}>
      <View>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <InputField
              onChangeText={onChange}
              onFocus={closeDropdown}
              onBlur={onBlur}
              placeholder="Add room title"
              value={value}
              error={error?.message}
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
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <InputField
              onFocus={closeDropdown}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Add room description"
              value={value}
              error={error?.message}
              ref={descriptionRef}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => descriptionRef.current?.blur()}
              multiline
              numberOfLines={7}
            />
          )}
        />

        <Controller
          control={control}
          name="theme"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Dropdown
              id="theme"
              value={value && value[0].toLocaleUpperCase() + value.slice(1)}
              error={error?.message}
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
      <Button title="Create Room" onPress={submit} disabled={isSubmitting} />
    </View>
  );
};
