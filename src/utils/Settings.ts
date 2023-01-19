function getEnvironmentVariable(key: string, defaultValue: string = "") {
  return typeof process.env[key] === "undefined" ? defaultValue : String(process.env[key]);
}

function getStage() {
  return getEnvironmentVariable("STAGE", "local");
}

export default { getEnvironmentVariable, getStage };
