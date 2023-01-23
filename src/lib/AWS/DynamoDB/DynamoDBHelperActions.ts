import { v4 as uuidv4 } from "uuid";
import * as Actions from "./DynamoDBActions";
import { DDBSearchClause, LooseDynamoDBRecord } from "./types";
import { resolveDynamoDBKey, resolveDynamoDBSearchClause, resolveDynamoDBUpdateItem, transformDynamoDBRecordToSimpleRecord } from "./utils";

/**
 *
 * @param tableName
 * @param query
 * @param limit
 * @returns
 */
export async function scan(tableName: string, query: DDBSearchClause = [], limit?: number) {
  const { filterExpression, expressionAttributeValues } = await resolveDynamoDBSearchClause(tableName, query);
  const items = await Actions.scan(tableName, filterExpression, expressionAttributeValues, limit);
  if (items instanceof Array) {
    return items.map((item) => transformDynamoDBRecordToSimpleRecord(item));
  }
  return [];
}

/**
 *
 * @param tableName
 * @param key - { id: "bazz" } or { id: { S: "bazz" } }
 * @returns
 */
export async function getItem(tableName: string, key: LooseDynamoDBRecord) {
  const item = await Actions.getItem(tableName, await resolveDynamoDBKey(tableName, key));
  if (!item) {
    return null;
  }
  return transformDynamoDBRecordToSimpleRecord(item);
}

/**
 *
 * @param tableName
 * @param item - { Id: "bazz", StatusName: "buzz", StatusValue: "bazz" }
 * @returns
 */
export async function updateItem(tableName: string, item: LooseDynamoDBRecord) {
  item.UpdatedAt = new Date().toISOString();
  const { key, updateExpression, expressionAttributeValues } = await resolveDynamoDBUpdateItem(tableName, item);
  await Actions.updateItem(tableName, key, updateExpression, expressionAttributeValues);
  return item;
}

/**
 *
 * @param tableName
 * @param item - { id: "bazz" } or { id: { S: "bazz" } }
 */
export async function putItem(tableName: string, item: LooseDynamoDBRecord) {
  item.Id = uuidv4();
  item.UpdatedAt = new Date().toISOString();
  await Actions.putItem(tableName, await resolveDynamoDBKey(tableName, item, false));
  return item;
}

/**
 *
 * @param tableName
 * @param key - { id: "bazz" } or { id: { S: "bazz" } }
 */
export async function deleteItem(tableName: string, key: LooseDynamoDBRecord) {
  return Actions.deleteItem(tableName, await resolveDynamoDBKey(tableName, key));
}
