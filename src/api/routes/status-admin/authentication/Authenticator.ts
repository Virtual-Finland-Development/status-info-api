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
      const idToken = jsonwebtoken.sign({ username }, await Settings.getSecret("STATUS_ADMIN_JWT_SECRET"), {
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
async function verifyLocalAppToken(token: string | undefined, loginContext: string) {
  try {
    if (!token) throw new Error("No token");
    const bearerToken = token.split(" ")[1];
    const decoded = jsonwebtoken.verify(bearerToken, await Settings.getSecret("STATUS_ADMIN_JWT_SECRET"));
    if (typeof decoded === "string") throw new Error("Invalid token");

    const user = await UserService.findUser(decoded.username);
    if (!user) throw new Error("Could not retrieve credentials");

    if (!(await UserService.hasPermission(user, loginContext))) {
      throw new Error("Permission denied");
    }
  } catch (error) {
    throw new AccessDeniedError(error);
  }
}

export default { login, verifyLocalAppToken };
