function createPasswordHash(password: string) {
  // @TODO: Use a better hash function
  return password.replace(/[A-Za-z]/g, function (c) {
    return String.fromCharCode(c.charCodeAt(0) + (c.toUpperCase() <= "M" ? 13 : -13));
  });
}

interface User {
  username: string;
  passwordHash: string;
}

const userStore: Array<User> = [
  { username: "admin", passwordHash: createPasswordHash("admin") },
  { username: "user", passwordHash: createPasswordHash("user") },
];

const permissionGroupUsers = [
  { groupIdent: "root", username: "admin" },
  { groupIdent: "users", username: "user" },
];

const permissionGroupPermissions: Record<string, Array<string>> = {
  root: ["ALL_ACCESS"],
  users: ["STATUS_ADMIN_ACCESS:READ"],
};

async function findUser(username: string) {
  return userStore.find((user) => user.username === username);
}

async function validateCredentials(user: User, password: string) {
  return user.passwordHash === createPasswordHash(password);
}

/**
 *
 * @param username
 * @param password
 * @returns
 */
async function authenticate(username: string, password: string): Promise<User | null> {
  const user = await findUser(username);
  if (user && (await validateCredentials(user, password))) {
    return user;
  }
  return null;
}

/**
 *
 * @param user
 * @param loginContext
 * @returns
 */
async function hasPermission(user: User, permissionName: string): Promise<boolean> {
  const permissionGroupUser = permissionGroupUsers.find((groupUser) => groupUser.username === user.username);
  if (permissionGroupUser) {
    const permissionGroup = permissionGroupPermissions[permissionGroupUser.groupIdent];
    if (permissionGroup) {
      return permissionGroup.includes("ALL_ACCESS") || permissionGroup.includes(permissionName);
    }
  }
  return false;
}

export default {
  authenticate,
  hasPermission,
  findUser,
};
