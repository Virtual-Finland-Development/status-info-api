import jsonwebtoken from "jsonwebtoken";
import { AccessDeniedError } from "../../utils/exceptions";

async function getAuthorization(authorizationBearer: string | string[] | undefined) {
  if (authorizationBearer instanceof Array) {
    authorizationBearer = authorizationBearer[0];
  }
  if (typeof authorizationBearer !== "string") {
    throw new AccessDeniedError("Missing authorization header");
  }

  const [type, token] = authorizationBearer.split(" ");
  if (type !== "Bearer") {
    throw new AccessDeniedError("Invalid authorization type");
  }

  try {
    const payload = jsonwebtoken.decode(token) as any;
    if (!payload || typeof payload !== "object") {
      throw new AccessDeniedError("Invalid authorization token");
    }

    // @TODO: Verify token signature

    const { sub, email } = payload;
    return { userId: sub, userEmail: email };
  } catch (error) {
    throw new AccessDeniedError(error);
  }
}

export default { getAuthorization };
