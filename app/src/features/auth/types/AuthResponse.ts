export type LoginResponse = {
  user_id: string;
  session_id: string;
  refresh_token: string;
  access_token: string;
};

export type RegisterResponse = {
  status: string;
  application_id: string;
};

export type PasswordResponse = {
  status: string;
};
