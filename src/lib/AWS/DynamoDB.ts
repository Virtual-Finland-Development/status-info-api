import Settings from "../../utils/Settings";

const AWS = require("aws-sdk");

//
// --> public <--
//

export async function scanForDynamoDBItems(tableName: string, filterExpression: string, expressionAttributeValues: any, limit?: number) {
  const dynamoDB = await getDynamoDBTable(tableName);
  const params: any = {
    TableName: tableName,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  if (limit) {
    params["Limit"] = limit;
  }

  const { Items } = await dynamoDB.scan(params).promise();
  return Items;
}

export async function getDynamoDBItem(tableName: string, key: string): Promise<string | number | boolean | null> {
  const dynamoDB = await getDynamoDBTable(tableName);
  const params = {
    TableName: tableName,
    Key: {
      key: key,
    },
  };
  const { Item } = await dynamoDB.get(params).promise();
  return Item;
}

export async function putDynamoDBItem(tableName: string, item: Record<string, string | number | boolean | null>) {
  const dynamoDB = await getDynamoDBTable(tableName);
  const params = {
    TableName: tableName,
    Item: item,
  };
  await dynamoDB.put(params).promise();
}

export async function deleteDynamoDBItem(tableName: string, key: string) {
  const dynamoDB = await getDynamoDBTable(tableName);
  const params = {
    TableName: tableName,
    Key: {
      key: key,
    },
  };
  await dynamoDB.delete(params).promise();
}

//
// --> private <--
//
let dynamoDBClient: any;
function getDynamoDBClient() {
  if (!dynamoDBClient) {
    const options: any = {};

    if (Settings.getStage() === "local") {
      const dynamoDBEndpoint = Settings.getEnvironmentVariable("DYNAMODB_ENDPOINT", "");
      if (dynamoDBEndpoint) {
        options.endpoint = dynamoDBEndpoint;
      }
    }
    dynamoDBClient = new AWS.DynamoDB(options);
  }
  return dynamoDBClient;
}

async function getDynamoDBTable(tableName: string) {
  const dynamoDB = getDynamoDBClient();
  //await waitForTableToBeReady(dynamoDB, tableName, 5);
  return new AWS.DynamoDB.DocumentClient({ service: dynamoDB });
}

/* async function waitForTableToBeReady(dynamoDBClient: any, tableName: string, retries: number, delayMs: number = 1000) {
  const params = {
    TableName: tableName,
  };
  try {
    await dynamoDBClient.waitFor("tableExists", params).promise();
  } catch (error) {
    if (retries > 0) {
      await Runtime.sleep(delayMs);
      await waitForTableToBeReady(dynamoDBClient, tableName, retries - 1, delayMs);
    } else {
      throw error;
    }
  }
} */
