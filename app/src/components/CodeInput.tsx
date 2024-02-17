import React, { useState } from "react";
import { TextInput, StyleSheet } from "react-native";
import { View } from "./Themed";
import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";

type Props = {
  codeLength?: number;
  onComplete: (code: string) => void;
  error: boolean;
  setError: React.Dispatch<React.SetStateAction<boolean>>;
};

const CodeInput: React.FC<Props> = ({ codeLength = 4, onComplete, error, setError }) => {
  const [code, setCode] = useState(new Array(codeLength).fill(""));

  const handleChangeText = (text: string, index: number) => {
    setError(false);
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (index < codeLength - 1 && text) {
      inputRefs[index + 1].focus();
    }
    if (newCode.every((digit) => digit !== "")) {
      onComplete(newCode.join(""));
    }
  };

  const inputRefs: TextInput[] = [];

  return (
    <View style={styles.container}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          style={[styles.input, digit ? styles.inputFilled : null, error ? styles.inputError : null]}
          onChangeText={(text) => handleChangeText(text, index)}
          value={digit}
          maxLength={1}
          keyboardType="numeric"
          ref={(ref) => {
            inputRefs[index] = ref as TextInput;
          }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace" && !digit && index > 0) {
              inputRefs[index - 1].focus();
            }
          }}
          textContentType="oneTimeCode"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 29,
    gap: 24,
  },
  input: {
    padding: 10,
    width: 44,
    height: 44,
    textAlign: "center",
    backgroundColor: Colors.dark.mainDarkGrey,
    color: Colors.dark.text,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.secondaryLightGrey,
    ...Fonts.regular14,
  },
  inputFilled: {
    borderColor: Colors.dark.mainPurple,
  },
  inputError: {
    color: Colors.dark.mainErrorRed,
    borderColor: Colors.dark.mainErrorRed,
  },
});

export default CodeInput;
