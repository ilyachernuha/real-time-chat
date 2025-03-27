import { useDropdownStore } from "@/stores/dropdownStore";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";

export const DropdownBackdrop = () => {
  const { openDropdownId, closeDropdown } = useDropdownStore();

  if (!!!openDropdownId) return null;

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <View style={StyleSheet.absoluteFill} />
    </TouchableWithoutFeedback>
  );
};
