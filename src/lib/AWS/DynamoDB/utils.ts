import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { SimpleDynamoDBKey } from "./types";

export async function attributeTypeResolver(tableName: string, key: string) {
  const {
    default: { schema },
  } = await import(`../../../data/models/${tableName}`);
  const attributeTypeForKey = schema.AttributeDefinitions.find((attributeDefinition: { AttributeName: string }) => attributeDefinition.AttributeName === key).AttributeType;
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
  if (Object.keys(key).length !== 1) {
    throw new Error(`Key must have exactly one key, but got ${JSON.stringify(key)}`);
  }
  const keySignature = Object.keys(key)[0];
  const keyValue = Object.values(key)[0];
  if (typeof keyValue === "string" || typeof keyValue === "number" || typeof keyValue === "boolean") {
    const attributeTypeForKey = await attributeTypeResolver(tableName, keySignature);

    const attributeValue: any = {};
    attributeValue[attributeTypeForKey] = keyValue;
    const record: Record<string, AttributeValue> = {};
    record[keySignature] = attributeValue;
    return record;
  }
  return key as Record<string, AttributeValue>; // above type guard should ensure this is safe
}
