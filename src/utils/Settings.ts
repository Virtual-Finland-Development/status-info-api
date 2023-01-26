function getEnvironmentVariable(key: string, defaultValue: string = "") {
  return typeof process.env[key] === "undefined" ? defaultValue : String(process.env[key]);
}

function getStage() {
  return getEnvironmentVariable("STAGE", "local");
}

async function getSecret(secretName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const secret = getEnvironmentVariable(secretName);
    if (secret === "") {
      reject(`Secret ${secretName} not found`);
    }
    resolve(secret);
  });
}

export default { getEnvironmentVariable, getStage, getSecret };
