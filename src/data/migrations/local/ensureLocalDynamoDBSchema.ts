import { checkIfTableExists, createTable } from "../../../services/AWS/DynamoDB/DynamoDBActions";
import { putItem } from "../../../services/AWS/DynamoDB/DynamoDBORM";
import { transformModelToDynamoDBSchema } from "../../../services/AWS/DynamoDB/DynamoDBORMUtils";
import Settings from "../../../utils/Settings";

import StatusInfoModel from "../../models/StatusInfo";

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

  const { tableName } = StatusInfoModel;
  const schema = transformModelToDynamoDBSchema(StatusInfoModel);

  if (!(await checkIfTableExists(tableName))) {
    console.log(`Table ${tableName} does not exist, creating it...`);
    await createTable(tableName, { ...defaultsForLocal, ...schema });
    console.log("Populating table with example data...");
    await putItem(tableName, { userId: "sdad123fsdfe", statusName: "ExampleStatus", userEmail: "test@mail.localhost" });
  }
}

ensureLocalDynamoDBSchema();
