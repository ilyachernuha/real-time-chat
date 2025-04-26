import Icons from "@/components/Icons";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import { Pressable, PressableProps, StyleSheet, TextInput, TextInputProps, View } from "react-native";

type Props = {
  value: string;
  handleChangeText: (value: string) => void;
  sendMessage: () => void;
};

export const MessageInput = ({ value, handleChangeText, sendMessage }: Props) => {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button}>
        <Icons name="attach" color={Colors.dark.secondaryLightGrey} size={24} />
      </Pressable>

      <TextInput
        style={styles.input}
        cursorColor={Colors.dark.text}
        multiline
        numberOfLines={7}
        textAlignVertical="top"
        value={value}
        onChangeText={handleChangeText}
      />
      <Pressable style={styles.button} onPress={sendMessage}>
        <Icons name="send" color={Colors.dark.secondaryLightGrey} size={24} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.dark.mainDarkGrey,
    borderRadius: 12,
    position: "absolute",
    bottom: 0,
    margin: 8,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
    padding: 0,
    margin: 0,
    alignSelf: "center",
    width: "100%",
    paddingVertical: 8,
    ...Fonts[14],
  },
  button: {
    padding: 10,
  },
});
