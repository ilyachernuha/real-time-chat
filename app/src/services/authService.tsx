import axios from "axios";
import { Base64 } from "js-base64";
import { CurrentUser } from "../types";
import API from "@/constants/API";

class AuthService {
  async login(username: string, password: string): Promise<CurrentUser> {
    const {
      data: { user_id, token },
    } = await axios.post(
      `${API.apiURL}/login`,
      {},
      {
        headers: {
          Authorization: "Basic " + Base64.encode(username + ":" + password),
        },
      }
    );
    return { id: user_id, token: token, name: username };
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ status: string; applicationId: string }> {
    const {
      data: { status, application_id },
    } = await axios.post(`${API.apiURL}/create_account`, {
      username,
      email,
      password,
    });
    return { status, applicationId: application_id };
  }

  async confirm(applicationId: string, confirmationCode: string): Promise<CurrentUser> {
    const {
      data: { user_id, token },
    } = await axios.post(`${API.apiURL}/finish_registration`, {
      application_id: applicationId,
      confirmation_code: confirmationCode,
    });
    return { id: user_id, token, name: "Name" };
  }

  async guestLogin(username: string): Promise<CurrentUser> {
    const {
      data: { user_id, token },
    } = await axios.post(`${API.apiURL}/guest_login`, {
      username,
    });
    return { id: user_id, token: token, name: username };
  }

  // Add more methods as needed for real authentication
}

export default new AuthService();
