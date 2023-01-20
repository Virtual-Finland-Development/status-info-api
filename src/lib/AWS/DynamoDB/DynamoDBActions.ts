/**
 * @see: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-table-read-write.html
 */
import {
  AttributeValue,
  CreateTableCommand,
  DeleteItemCommand,
  DescribeTableCommand,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { ddbDocClient } from "./DynamoDBDocumentClient";

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

export async function getItem(tableName: string, key: Record<string, AttributeValue>) {
  const params = {
    TableName: tableName,
    Key: key,
  };
  const { Item } = await ddbDocClient.send(new GetItemCommand(params));
  return Item;
}

export async function updateItem(tableName: string, key: Record<string, AttributeValue>, updateExpression: any, expressionAttributeValues: any) {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };
  await ddbDocClient.send(new UpdateItemCommand(params));
}

export async function putItem(tableName: string, item: Record<string, AttributeValue>) {
  const params = {
    TableName: tableName,
    Item: item,
  };
  await ddbDocClient.send(new PutItemCommand(params));
}

export async function deleteItem(tableName: string, key: Record<string, AttributeValue>) {
  const params = {
    TableName: tableName,
    Key: key,
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
