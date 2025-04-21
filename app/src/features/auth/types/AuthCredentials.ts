import { AxiosBasicCredentials } from "axios";

export type LoginCredentials = AxiosBasicCredentials;

export type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
};

export type ResetPasswordCredentials = {
  application_id: string;
  new_password: string;
};

export type VerifyCodeCredentials = {
  application_id: string;
  confirmation_code: string;
};
