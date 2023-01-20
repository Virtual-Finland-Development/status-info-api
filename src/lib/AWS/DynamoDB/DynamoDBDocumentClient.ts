import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import Settings from "../../../utils/Settings";

const dynamoDBClientOptions: any = {};

if (Settings.getStage() === "local") {
  const dynamoDBEndpoint = Settings.getEnvironmentVariable("DYNAMODB_ENDPOINT", "");
  if (dynamoDBEndpoint) {
    dynamoDBClientOptions.endpoint = dynamoDBEndpoint;
  }
}

export const ddbClient = new DynamoDBClient(dynamoDBClientOptions);
export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
