import jsonwebtoken from "jsonwebtoken";
import { AccessDeniedError } from "../../../../utils/exceptions";
import Settings from "../../../../utils/Settings";
import UserService from "./services/UserService";

/**
 * Login for 1 hour
 *
 * @param username
 * @param password
 * @param loginContext
 * @returns
 */
async function login(username: string, password: string, loginContext: string): Promise<{ idToken: string }> {
  const user = await UserService.authenticate(username, password);
  if (user) {
    if (await UserService.hasPermission(user, loginContext)) {
      const idToken = jsonwebtoken.sign({ username, password, loginContext }, await Settings.getSecret("STATUS_ADMIN_JWT_SECRET"), {
        expiresIn: "1h",
      });
      return { idToken };
    }
    throw new AccessDeniedError("Permission denied", 403);
  } else {
    throw new AccessDeniedError("Access denied", 401);
  }
}

/**
 *
 * @param token
 */
async function verifyLocalAppToken(token: string | undefined) {
  try {
    if (!token) throw new Error("No token");
    const bearerToken = token.split(" ")[1];
    jsonwebtoken.verify(bearerToken, await Settings.getSecret("STATUS_ADMIN_JWT_SECRET"));
  } catch (error) {
    throw new AccessDeniedError("Invalid token");
  }
}

export default { login, verifyLocalAppToken };
