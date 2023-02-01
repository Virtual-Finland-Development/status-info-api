import { putItem } from "../../../services/AWS/DynamoDB/DynamoDBORM";
import { transformModelToDynamoDBSchema } from "../../../services/AWS/DynamoDB/DynamoDBORMUtils";
import { checkIfTableExists, createTable } from "../../../services/AWS/DynamoDB/lib/DynamoDBActions";
import Settings from "../../../utils/Settings";
import { getDynamoDBModel, ModelName } from "../../DataManager";

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

  const dynamoDBModel = getDynamoDBModel("StatusInfo");
  const schema = transformModelToDynamoDBSchema(dynamoDBModel);

  if (!(await checkIfTableExists(dynamoDBModel.tableName))) {
    console.log(`Table ${dynamoDBModel.tableName} does not exist, creating it...`);
    await createTable(dynamoDBModel.tableName, { ...defaultsForLocal, ...schema });
    console.log("Populating table with example data...");
    await putItem(dynamoDBModel.tableName as ModelName, { userId: "sdad123fsdfe", statusName: "ExampleStatus", userEmail: "test@mail.localhost" });
  }
}

ensureLocalDynamoDBSchema();
