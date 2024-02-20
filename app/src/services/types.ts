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
