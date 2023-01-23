import { checkIfTableExists, createTable } from "../../../lib/AWS/DynamoDB/DynamoDBActions";
import { putItem } from "../../../lib/AWS/DynamoDB/DynamoDBHelperActions";
import { transformModelToDynamoDBSchema } from "../../../lib/AWS/DynamoDB/utils";
import Settings from "../../../utils/Settings";

import StatusAdminUIModel from "../../models/StatusInfo";

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

  const { tableName } = StatusAdminUIModel;
  const schema = transformModelToDynamoDBSchema(StatusAdminUIModel);

  if (!(await checkIfTableExists(tableName))) {
    console.log(`Table ${tableName} does not exist, creating it...`);
    await createTable(tableName, { ...defaultsForLocal, ...schema });
    console.log("Populating table with exmaple data...");
    await putItem(tableName, { id: "12345-qwerty-67890-asdfgh", statusName: "ExampleStatus", statusValue: "COMPLETED" });
  }
}

ensureLocalDynamoDBSchema();
