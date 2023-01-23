import { v4 as uuidv4 } from "uuid";
import { DatabaseError } from "../../../utils/exceptions";
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
  let item;
  try {
    item = await Actions.getItem(tableName, await resolveDynamoDBKey(tableName, key));
  } catch (error) {
    /* ignore */
  }
  if (!item) {
    return null;
  }
  return transformDynamoDBRecordToSimpleRecord(item);
}

/**
 *
 * @param tableName
 * @param item - { id: "bazz", statusName: "buzz", statusValue: "bazz" }
 * @returns
 */
export async function updateItem(tableName: string, item: LooseDynamoDBRecord) {
  try {
    const { key, updateExpression, expressionAttributeValues } = await resolveDynamoDBUpdateItem(tableName, item);
    const itemActual = await getItem(tableName, key);
    if (!itemActual) {
      throw new DatabaseError("Could not find item to update", 404);
    }

    // Autofills
    item.updatedAt = new Date().toISOString();

    await Actions.updateItem(tableName, key, updateExpression, expressionAttributeValues);
    return {
      ...itemActual,
      ...item,
    };
  } catch (error) {
    throw new DatabaseError(error);
  }
}

/**
 *
 * @param tableName
 * @param item - { id: "bazz" } or { id: { S: "bazz" } }
 */
export async function putItem(tableName: string, item: LooseDynamoDBRecord) {
  // Autofills
  item.id = uuidv4();
  item.updatedAt = new Date().toISOString();

  try {
    await Actions.putItem(tableName, await resolveDynamoDBKey(tableName, item, false));
    return item;
  } catch (error) {
    throw new DatabaseError(error);
  }
}

/**
 *
 * @param tableName
 * @param key - { id: "bazz" } or { id: { S: "bazz" } }
 */
export async function deleteItem(tableName: string, key: LooseDynamoDBRecord) {
  try {
    return Actions.deleteItem(tableName, await resolveDynamoDBKey(tableName, key));
  } catch (error) {
    throw new DatabaseError(error);
  }
}
