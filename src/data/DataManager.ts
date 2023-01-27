import Documentation from "../api/utils/Documentation";
import { DynamoDBModel } from "../services/AWS/DynamoDB/DynamoDBORMTypes";

import { default as StatusInfo } from "./models/StatusInfo";

export const Models = {
  StatusInfo: StatusInfo,
};
export type ModelName = keyof typeof Models;

export function getModel(modelName: ModelName): DynamoDBModel {
  if (typeof Models[modelName] === "undefined") {
    throw new Error(`Model ${modelName} not found`);
  }
  return Models[modelName] as DynamoDBModel;
}

export function initialize() {
  // Initialize schemas
  for (const model of Object.values(Models)) {
    if (model.openapi?.schema) {
      // @ts-ignore
      Documentation.addSchema(model.tableName, model.openapi.schema);
    }
  }
}

export default {
  getModel,
  initialize,
};
