import { checkIfTableExists, createTable } from "../../../lib/AWS/DynamoDB/DynamoDBActions";
import Settings from "../../../utils/Settings";

import StatusAdminUIModel from "../../models/StatusAdminUI";

export default async function ensureLocalDynamoDBSchema() {
  if (Settings.getStage() !== "local") {
    console.log("Not running in local environment, skipping ensureLocalDynamoDBSchema");
    return;
  }

  const defaultsForLocal = {
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10,
    },
  };

  const { tableName, schema } = StatusAdminUIModel;

  if (!(await checkIfTableExists(tableName))) {
    console.log(`Table ${tableName} does not exist, creating it...`);
    await createTable(tableName, { ...defaultsForLocal, ...schema });
  }
}

ensureLocalDynamoDBSchema();
