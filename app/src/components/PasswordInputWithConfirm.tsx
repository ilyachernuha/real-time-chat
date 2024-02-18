import React, { useState } from "react";
import InputField from "./InputField";

interface Props {
  password: string;
  onPasswordChange: (text: string) => void;
  passwordError: string;
  passwordConfirm: string;
  onPasswordConfirmChange: (text: string) => void;
  passwordConfirmError: string;
}

const PasswordInputWithConfirm = ({
  password,
  onPasswordChange,
  passwordError,
  passwordConfirm,
  onPasswordConfirmChange,
  passwordConfirmError,
}: Props) => {
  const [hidePassword, setHidePassword] = useState(true);
  const toggleHidePassword = () => setHidePassword(!hidePassword);
  return (
    <>
      <InputField
        placeholder="Enter your password"
        value={password}
        onChangeText={onPasswordChange}
        isPassword
        error={passwordError}
        hidePassword={hidePassword}
        toggleHidePassword={toggleHidePassword}
      />
      <InputField
        placeholder="Confirm your password"
        value={passwordConfirm}
        onChangeText={onPasswordConfirmChange}
        isPassword
        error={passwordConfirmError}
        hidePassword={hidePassword}
        toggleHidePassword={toggleHidePassword}
      />
    </>
  );
};

export default PasswordInputWithConfirm;
