import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { DynamoDBModel, SimpleDynamoDBKey } from "./types";

/**
 * Resolves the dynamodb attribute type for a given key in a given table
 *
 * @param tableName
 * @param key
 * @returns
 */
export async function attributeTypeResolver(tableName: string, key: string) {
  const {
    default: { schema },
  } = await import(`../../../data/models/${tableName}`);
  if (!schema) {
    throw new Error(`Could not find schema for table ${tableName}`);
  }

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
export async function resolveDynamoDBKey(tableName: string, key: SimpleDynamoDBKey): Promise<Record<string, AttributeValue>> {
  if (Object.keys(key).length < 1) {
    throw new Error(`Key must have at least one key-value pair. Key: ${JSON.stringify(key)}`);
  }

  const record: Record<string, AttributeValue> = {};

  for (const keyPair of Object.entries(key)) {
    const [keySignature, keyValue] = keyPair;
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
