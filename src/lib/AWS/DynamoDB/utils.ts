import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { DDBSearchClause, DynamoDBModel, DynamoDBRecord, LooseDynamoDBRecord } from "./types";

/**
 *
 * @param tableName
 * @returns
 */
export async function getSchema(tableName: string): Promise<DynamoDBModel["schema"]> {
  const {
    default: { schema },
  } = await import(`../../../data/models/${tableName}`);
  if (!schema) {
    throw new Error(`Could not find schema for table ${tableName}`);
  }
  return schema;
}

/**
 * Resolves the dynamodb attribute type for a given key in a given table
 *
 * @param tableName
 * @param key
 * @returns
 */
export async function attributeTypeResolver(tableName: string, key: string) {
  const schema = await getSchema(tableName);
  const attributeDefinition = schema.AttributeDefinitions.find((attributeDefinition: { AttributeName: string }) => attributeDefinition.AttributeName === key);
  if (!attributeDefinition) {
    throw new Error(`Could not find attribute definition for key ${key} in table ${tableName}`);
  }

  const attributeTypeForKey = attributeDefinition.AttributeType;
  if (!attributeTypeForKey) {
    throw new Error(`Could not find attribute type for key ${key} in table ${tableName}`);
  }
  return attributeTypeForKey;
}

/**
 * Transform a key into a DynamoDB key: { id: "123" } => { id: { S: "123" } }
 *
 * @param tableName
 * @param key
 * @returns
 */
export async function resolveDynamoDBKey(tableName: string, key: LooseDynamoDBRecord, onlySchemaKeyValues: boolean = true): Promise<Record<string, AttributeValue>> {
  if (Object.keys(key).length < 1) {
    throw new Error(`Key must have at least one key-value pair. Key: ${JSON.stringify(key)}`);
  }
  const schema = await getSchema(tableName);
  const keySchemaKeys = schema.KeySchema.map((keySchema: { AttributeName: string }) => keySchema.AttributeName);

  const record: Record<string, AttributeValue> = {};

  for (const keyPair of Object.entries(key)) {
    const [keySignature, keyValue] = keyPair;

    if (onlySchemaKeyValues) {
      if (!keySchemaKeys.includes(keySignature)) {
        continue;
      }
    }

    if (typeof keyValue === "string" || typeof keyValue === "number" || typeof keyValue === "boolean") {
      const attributeTypeForKey = await attributeTypeResolver(tableName, keySignature);
      const attributeValue: any = {};
      attributeValue[attributeTypeForKey] = keyValue;
      record[keySignature] = attributeValue;
    } else {
      record[keySignature] = keyValue;
    }
  }

  return record;
}

/**
 *
 * @param model
 * @returns
 */
export function transformModelToDynamoDBSchema(model: DynamoDBModel): DynamoDBModel["schema"] {
  const {
    schema: { AttributeDefinitions, KeySchema },
  } = model;
  return KeySchema.reduce(
    (acc: DynamoDBModel["schema"], keySchema: { AttributeName: string; KeyType: string }) => {
      const keyAttributes = AttributeDefinitions.filter((attributeDefinition: { AttributeName: string }) => attributeDefinition.AttributeName === keySchema.AttributeName);
      acc.KeySchema.push(keySchema);
      acc.AttributeDefinitions.push(...keyAttributes);
      return acc;
    },
    { KeySchema: [], AttributeDefinitions: [] }
  );
}

/**
 *
 * @param tableName
 * @param query
 * @returns
 */
export async function resolveDynamoDBSearchClause(tableName: string, query: DDBSearchClause) {
  const queryParts = [];
  for (const queryItem of query) {
    const { key, value, operator } = queryItem;
    queryParts.push({
      key,
      value,
      operator: operator ?? "=",
      attributeType: await attributeTypeResolver(tableName, key),
    });
  }

  const filterExpression = queryParts.map((queryPart) => `${queryPart.key} ${queryPart.operator} :${queryPart.key}`).join(" AND ");
  const expressionAttributeValues = queryParts.reduce((acc: Record<string, AttributeValue>, queryPart) => {
    const { key, value, attributeType } = queryPart;
    const attributeValue: any = {};
    attributeValue[attributeType] = value;
    acc[`:${key}`] = attributeValue;
    return acc;
  }, {});

  return { filterExpression, expressionAttributeValues };
}

/**
 *
 * @param tableName
 * @param updateItem
 * @returns
 */
export async function resolveDynamoDBUpdateItem(tableName: string, updateItem: LooseDynamoDBRecord) {
  const itemKey = await resolveDynamoDBKey(tableName, updateItem);
  const itemKeyNames = Object.keys(itemKey);
  const updateExpression = [];
  const expressionAttributeValues: any = {};

  for (const [key, value] of Object.entries(updateItem)) {
    if (itemKeyNames.includes(key)) {
      continue;
    }

    const attributeType = await attributeTypeResolver(tableName, key);
    const attributeValue: any = {};
    attributeValue[attributeType] = value;
    expressionAttributeValues[`:${key}`] = attributeValue;
    updateExpression.push(`${key} = :${key}`);
  }

  return { key: itemKey, updateExpression: `SET ${updateExpression.join(", ")}`, expressionAttributeValues };
}

/**
 *
 * @param record
 * @returns
 */
export function transformDynamoDBRecordToSimpleRecord(record: DynamoDBRecord): Record<string, any> {
  const simpleRecord: Record<string, any> = {};
  for (const [key, value] of Object.entries(record)) {
    const attributeValue = Object.values(value)[0];
    simpleRecord[key] = attributeValue;
  }
  return simpleRecord;
}
