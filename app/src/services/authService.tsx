import { CurrentUser, User } from "../types";

class AuthService {
  async login(username: string): Promise<CurrentUser> {
    return { id: "Id", token: "Token", name: "Name" };
  }

  // Add more methods as needed for real authentication
}

const authService = new AuthService();
export default authService;
