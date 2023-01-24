/**
 * @see: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/index.html
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import Settings from "../../../utils/Settings";

const dynamoDBClientOptions: any = {};

if (Settings.getStage() === "local") {
  const dynamoDBEndpoint = Settings.getEnvironmentVariable("DYNAMODB_ENDPOINT", "");
  if (dynamoDBEndpoint) {
    dynamoDBClientOptions.endpoint = dynamoDBEndpoint;
    dynamoDBClientOptions.region = Settings.getEnvironmentVariable("AWS_REGION", "eu-north-1");
    dynamoDBClientOptions.credentials = {
      accessKeyId: "dummy.aws.accessKeyId",
      secretAccessKey: "dummy.aws.secretAccessKey",
    };
  }
}

export const ddbClient = new DynamoDBClient(dynamoDBClientOptions);
export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
