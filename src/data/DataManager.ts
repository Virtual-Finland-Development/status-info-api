import Documentation from "../api/utils/Documentation";
import * as Models from "./models/";

export type ModelName = keyof typeof Models;

export function getModel(modelName: ModelName) {
  if (typeof Models[modelName] === "undefined") {
    throw new Error(`Model ${modelName} not found`);
  }
  return Models[modelName];
}

export function initialize() {
  // Initialize schemas
  for (const model of Object.values(Models)) {
    if (model.openapi) {
      // @ts-ignore
      Documentation.addSchema(model.tableName, model.openapi);
    }
  }
}

export default {
  getModel,
  initialize,
  Models,
};
