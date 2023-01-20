/**
 * @see: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/index.html
 */
import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ensureObject } from "../../../utils/Transformations";
import { ddbDocClient } from "./DynamoDBDocumentClient";

export async function queryItems(tableName: string, query?: { keyConditionExpression?: string; filterExpression?: string; expressionAttributeValues?: any; limit?: number }) {
  const params: any = {
    TableName: tableName,
    ...ensureObject(query),
  };
  const { Items } = await ddbDocClient.send(new QueryCommand(params));
  return Items;
}

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

export async function getItem(tableName: string, key: Record<string, string | number | boolean | null>) {
  const params = {
    TableName: tableName,
    Key: key,
  };
  const { Item } = await ddbDocClient.send(new GetCommand(params));
  return Item;
}

export async function updateItem(
  tableName: string,
  key: Record<string, string | number | boolean | null>,
  updateExpression: string,
  expressionAttributeValues: Record<string, string | number | boolean | null>
) {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };
  await ddbDocClient.send(new UpdateCommand(params));
}

export async function putItem(tableName: string, item: Record<string, string | number | boolean | null>) {
  const params = {
    TableName: tableName,
    Item: item,
  };
  await ddbDocClient.send(new PutCommand(params));
}

export async function deleteItem(tableName: string, key: Record<string, string | number | boolean | null>) {
  const params = {
    TableName: tableName,
    Key: key,
  };
  await ddbDocClient.send(new DeleteCommand(params));
}
