import { ModelName, Models } from "../../../data/DataManager";
import { DatabaseError } from "../../../utils/exceptions";
import * as Actions from "./DynamoDBActions";
import { DDBSearchClause, LooseDynamoDBRecord } from "./DynamoDBORMTypes";
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
export async function scan<T extends ModelName>(tableName: T, query: DDBSearchClause = [], limit?: number): Promise<Array<(typeof Models)[T]["simpleSchema"]>> {
  const { filterExpression, expressionAttributeValues } = await resolveDynamoDBSearchClause(tableName, query);
  const items = await Actions.scan(tableName, filterExpression, expressionAttributeValues, limit);
  if (items instanceof Array) {
    return items.map((item) => ensurePrimitiveDynamoDBRecord(item) as unknown as (typeof Models)[T]["simpleSchema"]);
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
export async function query<T extends ModelName>(tableName: T, searchClause: DDBSearchClause, limit?: number): Promise<Array<(typeof Models)[T]["simpleSchema"]>> {
  const { filterExpression, expressionAttributeValues } = await resolveDynamoDBSearchClause(tableName, searchClause);
  const items = await Actions.query(tableName, filterExpression, "", expressionAttributeValues);
  if (items instanceof Array) {
    return items.map((item) => ensurePrimitiveDynamoDBRecord(item) as unknown as (typeof Models)[T]["simpleSchema"]);
  }
  return [];
}

/**
 *
 * @param tableName
 * @param query
 * @returns
 */
export async function scanOne<T extends ModelName>(tableName: T, searchClause: DDBSearchClause): Promise<(typeof Models)[T]["simpleSchema"] | null> {
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
export async function queryOne<T extends ModelName>(tableName: T, searchClause: DDBSearchClause): Promise<(typeof Models)[T]["simpleSchema"] | null> {
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
export async function searchOne<T extends ModelName>(tableName: T, searchClause: DDBSearchClause): Promise<(typeof Models)[T]["simpleSchema"] | null> {
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
export async function getItem<T extends ModelName>(tableName: T, key: LooseDynamoDBRecord): Promise<(typeof Models)[T]["simpleSchema"] | null> {
  let item;
  try {
    item = await Actions.getItem(tableName, await resolveDynamoDBKey(tableName, key));
  } catch (error) {
    /* ignore */
  }
  if (!item) {
    return null;
  }
  return ensurePrimitiveDynamoDBRecord(item) as unknown as (typeof Models)[T]["simpleSchema"];
}

/**
 *
 * @param tableName
 * @param item - { id: "bazz", statusName: "buzz", statusValue: "bazz" }
 * @returns
 */
export async function updateItem<T extends ModelName>(tableName: ModelName, item: LooseDynamoDBRecord): Promise<(typeof Models)[T]["simpleSchema"] | null> {
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
 * @param items
 * @returns
 */
export async function updateItems<T extends ModelName>(tableName: T, items: LooseDynamoDBRecord[]): Promise<void> {
  try {
    const updateableItems = await Promise.all(
      items.map(async (item) => {
        const updateableItem = await parseDynamoDBInputItem(tableName, item, "update");
        const { key, updateExpression, expressionAttributeValues } = await resolveDynamoDBUpdateItem(tableName, updateableItem);
        return { key, updateExpression, expressionAttributeValues };
      })
    );

    return Actions.transactWrite(tableName, updateableItems);
  } catch (error) {
    throw new DatabaseError(error);
  }
}

/**
 *
 * @param tableName
 * @param item - { id: "bazz" } or { id: { S: "bazz" } }
 */
export async function putItem<T extends ModelName>(tableName: T, item: LooseDynamoDBRecord): Promise<(typeof Models)[T]["simpleSchema"] | null> {
  try {
    // Preps
    const insertableItem = await parseDynamoDBInputItem(tableName, item, "create");

    // Inserts
    await Actions.putItem(tableName, await resolveDynamoDBKey(tableName, insertableItem, false));
    return insertableItem as (typeof Models)[T]["simpleSchema"];
  } catch (error) {
    throw new DatabaseError(error);
  }
}

/**
 *
 * @param tableName
 * @param key - { id: "bazz" } or { id: { S: "bazz" } }
 */
export async function deleteItem<T extends ModelName>(tableName: T, key: LooseDynamoDBRecord): Promise<void> {
  try {
    return Actions.deleteItem(tableName, await resolveDynamoDBKey(tableName, key));
  } catch (error) {
    throw new DatabaseError(error);
  }
}

/**
 *
 * @param tableName
 * @param keys
 * @returns
 */
export async function deleteItems<T extends ModelName>(tableName: T, keys: LooseDynamoDBRecord[]): Promise<void> {
  try {
    const deletableKeys = await Promise.all(keys.map(async (key) => await resolveDynamoDBKey(tableName, key)));
    return Actions.batchDelete(tableName, deletableKeys);
  } catch (error) {
    throw new DatabaseError(error);
  }
}
