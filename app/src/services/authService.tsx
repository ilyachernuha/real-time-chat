import axios from "axios";
import { CurrentUser, User } from "../types";
import { apiUrl } from "../utils/constants";

class AuthService {
  async login(username: string): Promise<CurrentUser> {
    const { data } = await axios.post(`${apiUrl}/guest_login`, {
      name: username,
    });
    return { id: data.user_id, token: data.token, name: username };
  }

  // Add more methods as needed for real authentication
}

const authService = new AuthService();
export default authService;
