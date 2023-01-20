import { checkIfTableExists, createTable } from "../../../lib/AWS/DynamoDB/DynamoDBActions";
import Settings from "../../../utils/Settings";

export default async function ensureLocalDynamoDBSchema() {
  if (Settings.getStage() !== "local") {
    console.log("Not running in local environment, skipping ensureLocalDynamoDBSchema");
    return;
  }

  const tableName = "StatusAdminUI";
  if (!(await checkIfTableExists(tableName))) {
    console.log(`Table ${tableName} does not exist, creating it...`);

    const schema = {
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10,
      },
    };

    await createTable(tableName, schema);
  }
}

ensureLocalDynamoDBSchema();
