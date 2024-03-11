import Colors from "@/constants/Colors";
import Fonts from "@/constants/Fonts";
import React, { useState } from "react";
import { Text, StyleSheet, View } from "react-native";
import {
  CodeField as DefaultCodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

interface Props {
  onComplete: (confirmationCode: string) => void;
  error: boolean;
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  cellCount?: number;
  isSubmitting: boolean;
}

const CodeField = ({ onComplete, error, setError, isSubmitting, cellCount = 4 }: Props) => {
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount });
  const [codeFieldProps, getCellOnLayout] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <View style={{ gap: 48 }}>
      <DefaultCodeField
        ref={ref}
        {...codeFieldProps}
        onPressOut={(e) => {
          setError(false);
          return codeFieldProps.onPressOut(e);
        }}
        caretHidden={true}
        contextMenuHidden={true}
        value={value}
        onChangeText={(text) => {
          setValue(text);
          if (text.length === 4) onComplete(text);
        }}
        cellCount={cellCount}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <Text
            key={index}
            style={[
              styles.cell,
              Fonts[14],
              (symbol !== "" || isFocused) && styles.activeCell,
              value.length === 4 && !isSubmitting && styles.trueCell,
              error && styles.errorCell,
            ]}
            onLayout={getCellOnLayout(index)}
          >
            {symbol || (isFocused ? <Cursor /> : "-")}
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  codeFieldRoot: { justifyContent: "center", gap: 24, borderColor: "red" },
  cell: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.dark.secondaryLightGrey,
    backgroundColor: Colors.dark.mainDarkGrey,
    textAlign: "center",
    borderRadius: 12,
    color: Colors.dark.secondaryLightGrey,
    textAlignVertical: "center",
  },
  activeCell: {
    color: Colors.dark.text,
  },
  trueCell: {
    borderColor: Colors.dark.mainPurple,
  },
  errorCell: {
    color: Colors.dark.mainErrorRed,
    borderColor: Colors.dark.mainErrorRed,
  },
});

export default CodeField;
