/**
 * @see: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-table-read-write.html
 * @see:
 */
import {
  CreateTableCommand,
  DeleteItemCommand,
  DescribeTableCommand,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { ddbDocClient } from "./DynamoDBClient";
import { DynamoDBRecord } from "./DynamoDBORMTypes";
import { resolveTableNameActual } from "./DynamoDBORMUtils";

/**
 * @see: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-query-scan.html
 *
 * @param tableName
 * @param keyConditionExpression "Season = :s and Episode > :e",
 * @param filterExpression "contains (Subtitle, :topic)",
 * @param expressionAttributeValues { ":s": { N: "1" }, ":e": { N: "2" }, ":topic": { S: "SubTitle" } }
 * @returns
 */
export async function query(tableName: string, keyConditionExpression: string, filterExpression: string, expressionAttributeValues: any) {
  const params = {
    KeyConditionExpression: keyConditionExpression,
    //FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    //ProjectionExpression: "Episode, Title, Subtitle",
    TableName: resolveTableNameActual(tableName),
  };

  const { Items } = await ddbDocClient.send(new QueryCommand(params));
  return Items;
}

/**
 * @see: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/dynamodb-example-query-scan.html
 *
 * @param tableName
 * @param filterExpression "Subtitle = :topic AND Season = :s AND Episode = :e"
 * @param expressionAttributeValues { ":topic": { S: "SubTitle2" }, ":s": { N: "1" }, ":e": { N: "2" }
 * @param limit
 * @returns
 */
export async function scan(tableName: string, filterExpression: string, expressionAttributeValues: any, limit?: number) {
  const params: any = {
    TableName: resolveTableNameActual(tableName),
    FilterExpression: filterExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    // ProjectionExpression: "Season, Episode, Title, Subtitle",
  };

  if (!params.FilterExpression) {
    delete params.FilterExpression;
    delete params.ExpressionAttributeValues;
  }

  if (limit) {
    params["Limit"] = limit;
  }

  const { Items } = await ddbDocClient.send(new ScanCommand(params));
  return Items;
}

/**
 *
 * @param tableName
 * @param key { id: { S: "bazz" } }
 * @returns
 */
export async function getItem(tableName: string, key: DynamoDBRecord) {
  const params = {
    TableName: resolveTableNameActual(tableName),
    Key: key,
  };
  const { Item } = await ddbDocClient.send(new GetItemCommand(params));
  return Item;
}

/**
 *
 * @param tableName
 * @param key { id: { S: "bazz" } }
 * @param updateExpression set Title = :t, Subtitle = :s
 * @param expressionAttributeValues { ":t": { S: "New Title" }, ":s": { S: "New Subtitle" } }
 */
export async function updateItem(tableName: string, key: DynamoDBRecord, updateExpression: any, expressionAttributeValues: any) {
  const params = {
    TableName: resolveTableNameActual(tableName),
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };
  await ddbDocClient.send(new UpdateItemCommand(params));
}

/**
 *
 * @param tableName
 * @param item  { id: { S: "bazz" } }
 */
export async function putItem(tableName: string, item: DynamoDBRecord) {
  const params = {
    TableName: resolveTableNameActual(tableName),
    Item: item,
    ConditionExpression: "attribute_not_exists(pk)",
  };
  await ddbDocClient.send(new PutItemCommand(params));
}

/**
 *
 * @param tableName
 * @param key  { id: { S: "bazz" } }
 */
export async function deleteItem(tableName: string, key: DynamoDBRecord) {
  const params = {
    TableName: resolveTableNameActual(tableName),
    Key: key,
  };
  await ddbDocClient.send(new DeleteItemCommand(params));
}

/**
 *
 * @param tableName
 * @returns
 */
export async function checkIfTableExists(tableName: string) {
  try {
    await ddbDocClient.send(new DescribeTableCommand({ TableName: resolveTableNameActual(tableName) }));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 *
 * @param tableName
 * @param schema
 */
export async function createTable(tableName: string, schema: { KeySchema: Array<any>; AttributeDefinitions: Array<any>; ProvisionedThroughput: any }) {
  const params = {
    TableName: resolveTableNameActual(tableName),
    ...schema,
  };
  await ddbDocClient.send(new CreateTableCommand(params));
}
