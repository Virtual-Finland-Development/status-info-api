import { DatabaseError } from "../../../utils/exceptions";
import * as Actions from "./DynamoDBActions";
import { DDBSearchClause, LooseDynamoDBRecord, PrimitiveDynamoDBRecord } from "./DynamoDBORMTypes";
import {
  ensurePrimitiveDynamoDBRecord,
  parseDynamoDBInputItem,
  resolveDynamoDBKey,
  resolveDynamoDBSearchClause,
  resolveDynamoDBUpdateItem,
  resolveQueryableSearch,
} from "./DynamoDBORMUtils";

/**
 *
 * @param tableName
 * @param query
 * @param limit
 * @returns
 */
export async function scan(tableName: string, query: DDBSearchClause = [], limit?: number): Promise<Array<PrimitiveDynamoDBRecord>> {
  const { filterExpression, expressionAttributeValues } = await resolveDynamoDBSearchClause(tableName, query);
  const items = await Actions.scan(tableName, filterExpression, expressionAttributeValues, limit);
  if (items instanceof Array) {
    return items.map((item) => ensurePrimitiveDynamoDBRecord(item));
  }
  return [];
}

/**
 *
 * @param tableName
 * @param query
 * @param limit
 * @returns
 */
export async function query(tableName: string, searchClause: DDBSearchClause, limit?: number): Promise<Array<PrimitiveDynamoDBRecord>> {
  const { filterExpression, expressionAttributeValues } = await resolveDynamoDBSearchClause(tableName, searchClause);
  const items = await Actions.query(tableName, filterExpression, "", expressionAttributeValues);
  if (items instanceof Array) {
    return items.map((item) => ensurePrimitiveDynamoDBRecord(item));
  }
  return [];
}

/**
 *
 * @param tableName
 * @param query
 * @returns
 */
export async function scanOne(tableName: string, searchClause: DDBSearchClause) {
  const items = await scan(tableName, searchClause, 1);
  if (items.length === 0) {
    return null;
  }
  return items[0];
}

/**
 *
 * @param tableName
 * @param query
 * @returns
 */
export async function queryOne(tableName: string, searchClause: DDBSearchClause) {
  const items = await query(tableName, searchClause, 1);
  if (items.length === 0) {
    return null;
  }
  return items[0];
}

/**
 *
 * @param tableName
 * @param searchClause
 */
export async function searchOne(tableName: string, searchClause: DDBSearchClause) {
  const queryableSearch = await resolveQueryableSearch(tableName, searchClause);
  if (queryableSearch.length === 0) {
    return scanOne(tableName, searchClause);
  }
  return queryOne(tableName, queryableSearch);
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
  return ensurePrimitiveDynamoDBRecord(item);
}

/**
 *
 * @param tableName
 * @param item - { id: "bazz", statusName: "buzz", statusValue: "bazz" }
 * @returns
 */
export async function updateItem(tableName: string, item: LooseDynamoDBRecord) {
  try {
    // Preps
    const updateableItem = await parseDynamoDBInputItem(tableName, item, "update");
    const { key, updateExpression, expressionAttributeValues } = await resolveDynamoDBUpdateItem(tableName, updateableItem);
    // Checks
    const itemActual = await getItem(tableName, key);
    if (!itemActual) {
      throw new DatabaseError("Could not find item to update", 404);
    }

    // Updates
    await Actions.updateItem(tableName, key, updateExpression, expressionAttributeValues);
    return {
      ...itemActual,
      ...updateableItem,
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
  try {
    // Preps
    const insertableItem = await parseDynamoDBInputItem(tableName, item, "create");

    // Inserts
    await Actions.putItem(tableName, await resolveDynamoDBKey(tableName, insertableItem, false));
    return insertableItem;
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
