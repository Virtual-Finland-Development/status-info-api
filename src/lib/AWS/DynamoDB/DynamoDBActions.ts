/**
 * @see: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-table-read-write.html
 */
import { CreateTableCommand, DeleteItemCommand, DescribeTableCommand, GetItemCommand, PutItemCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbDocClient } from "./DynamoDBClient";
import { SimpleDynamoDBKey } from "./types";
import { resolveDynamoDBKey } from "./utils";

export async function scanForItems(tableName: string, filterExpression: string, expressionAttributeValues: any, limit?: number) {
  const params: any = {
    TableName: tableName,
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  if (limit) {
    params["Limit"] = limit;
  }

  const { Items } = await ddbDocClient.send(new ScanCommand(params));
  return Items;
}

/**
 *
 * @param tableName
 * @param key { id: "bazz" } or { id: { S: "bazz" } }
 * @returns
 */
export async function getItem(tableName: string, key: SimpleDynamoDBKey) {
  const params = {
    TableName: tableName,
    Key: await resolveDynamoDBKey(tableName, key),
  };
  const { Item } = await ddbDocClient.send(new GetItemCommand(params));
  return Item;
}

export async function updateItem(tableName: string, key: SimpleDynamoDBKey, updateExpression: any, expressionAttributeValues: any) {
  const params = {
    TableName: tableName,
    Key: await resolveDynamoDBKey(tableName, key),
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };
  await ddbDocClient.send(new UpdateItemCommand(params));
}

export async function putItem(tableName: string, item: SimpleDynamoDBKey) {
  const params = {
    TableName: tableName,
    Item: await resolveDynamoDBKey(tableName, item),
  };
  await ddbDocClient.send(new PutItemCommand(params));
}

export async function deleteItem(tableName: string, key: SimpleDynamoDBKey) {
  const params = {
    TableName: tableName,
    Key: await resolveDynamoDBKey(tableName, key),
  };
  await ddbDocClient.send(new DeleteItemCommand(params));
}

export async function checkIfTableExists(tableName: string) {
  try {
    await ddbDocClient.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    return false;
  }
}

export async function createTable(tableName: string, schema: { KeySchema: Array<any>; AttributeDefinitions: Array<any>; ProvisionedThroughput: any }) {
  const params = {
    TableName: tableName,
    ...schema,
  };
  await ddbDocClient.send(new CreateTableCommand(params));
}
