import "@/polyfills";
import axios from "axios";
import API from "@/constants/API";

type LoginResponse = {
  user_id: string;
  token: string;
};

type RegisterResponse = {
  status: string;
  application_id: string;
};

type ConfirmResponse = {
  user_id: string;
  token: string;
};

type GuestLoginResponse = {
  user_id: string;
  token: string;
};

export default {
  login: async (username: string, password: string) => {
    const {
      data: { user_id, token },
    } = await axios.post<LoginResponse>(
      `${API.apiURL}/login`,
      {},
      {
        auth: {
          username,
          password,
        },
      }
    );
    return { id: user_id, token: token, name: username };
  },

  register: async (username: string, email: string, password: string) => {
    const {
      data: { status, application_id },
    } = await axios.post<RegisterResponse>(`${API.apiURL}/create_account`, {
      username,
      email,
      password,
    });
    return { status, applicationId: application_id };
  },

  confirm: async (applicationId: string, confirmationCode: string) => {
    const {
      data: { user_id, token },
    } = await axios.post<ConfirmResponse>(`${API.apiURL}/finish_registration`, {
      application_id: applicationId,
      confirmation_code: confirmationCode,
    });
    return { id: user_id, token, name: "Name" };
  },

  guestLogin: async (name: string) => {
    const {
      data: { user_id, token },
    } = await axios.post<GuestLoginResponse>(`${API.apiURL}/guest_login`, {
      name,
    });
    return { id: user_id, token: token, name };
  },
};
