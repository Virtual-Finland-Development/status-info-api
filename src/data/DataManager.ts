import Documentation from "../api/utils/Documentation";
import { DynamoDBModel } from "../services/AWS/DynamoDB/DynamoDBORMTypes";
import Models from "./models/";

export type ModelName = keyof typeof Models;
export type ModelItem<T extends ModelName> = (typeof Models)[T];

export function getDynamoDBModel<T extends ModelName>(modelName: T): DynamoDBModel {
  if (typeof Models[modelName] === "undefined") {
    throw new Error(`Model ${modelName} not found`);
  }
  return Models[modelName].getDynamoDBModel();
}

export default {
  initialize() {
    for (const key in Models) {
      const model = getDynamoDBModel(key as ModelName);
      Documentation.addSchema(key, model.openapi);
    }
  },
};
