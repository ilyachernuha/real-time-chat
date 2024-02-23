export interface LoginRequest {
  username: string;
  password: string;
}

export type LoginResponse = {
  user_id: string;
  token: string;
};

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export type RegisterResponse = {
  status: string;
  application_id: string;
};

export interface ConfirmRequest {
  application_id: string;
  confirmation_code: string;
}

export type ConfirmResponse = {
  user_id: string;
  token: string;
};

export interface GuestLoginRequest {
  name: string;
}

export type GuestLoginResponse = {
  user_id: string;
  token: string;
};

export interface ForgotPasswordRequest {
  email: string;
}

export type ForgotPasswordResponse = {
  status: string;
};

export interface ResetPasswordRequest {
  application_id: string;
  new_password: string;
}

export type ResetPasswordResponse = {
  status: "success";
};
