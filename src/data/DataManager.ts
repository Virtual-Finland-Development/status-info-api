import Documentation from "../api/utils/Documentation";
import { DynamoDBModel } from "../lib/AWS/DynamoDB/DynamoDBORMTypes";

import { default as StatusInfo } from "./models/StatusInfo";

const preparedModels: any = {
  StatusInfo: StatusInfo,
};

export async function getModel(modelName: string): Promise<DynamoDBModel> {
  if (typeof preparedModels[modelName] !== "undefined") {
    return preparedModels[modelName];
  }
  const model = await import(`./models/${modelName}`);
  preparedModels[modelName] = model.default;
  return preparedModels[modelName];
}

/**
 *
 * @param modelNames
 */
export function initialize(modelNames: Array<string> = ["StatusInfo"]) {
  for (const modelName of modelNames) {
    if (typeof preparedModels[modelName] !== "undefined" && preparedModels[modelName].openapi) {
      Documentation.addSchema(modelName, preparedModels[modelName].openapi.schema);
    }
  }
}

export default {
  getModel,
  initialize,
};
