import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { ValidationError } from "../../../utils/exceptions";
import { cloneItem } from "../../../utils/Transformations";
import { DDBPrimitive, DDBSearchClause, DynamoDBModel, LooseDynamoDBRecord, PrimitiveDynamoDBRecord } from "./DynamoDBORMTypes";

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

    if (isDynamoDBPrimitiveValue(keyValue)) {
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
 * @returns immutable primitive record
 */
export function ensurePrimitiveDynamoDBRecord(record: LooseDynamoDBRecord): PrimitiveDynamoDBRecord {
  const primitiveRecord: PrimitiveDynamoDBRecord = {};
  for (const [key, value] of Object.entries(record)) {
    if (isDynamoDBPrimitiveValue(value)) {
      primitiveRecord[key] = cloneItem(value);
    } else {
      const attributeValue = Object.values(value)[0];
      primitiveRecord[key] = cloneItem(attributeValue);
    }
  }
  return primitiveRecord;
}

/**
 *
 * @param tableName
 * @param item
 * @param event
 * @returns immutable item
 */
export async function parseDynamoDBInputItem(tableName: string, item: PrimitiveDynamoDBRecord | LooseDynamoDBRecord, event: "create" | "update"): Promise<PrimitiveDynamoDBRecord> {
  const primitiveItem = ensurePrimitiveDynamoDBRecord(item);
  const schema = await getSchema(tableName);
  mutateDynamoDBAutoFills(schema, primitiveItem, event);
  validateDynamoDBValueUpdate(schema, primitiveItem);
  return primitiveItem;
}

/**
 *
 * @param tableName
 * @param item
 * @param event
 * @returns void
 */
function mutateDynamoDBAutoFills(schema: DynamoDBModel["schema"], item: PrimitiveDynamoDBRecord, event: "create" | "update"): void {
  const currentEventAutoFillAttributes = schema.AttributeDefinitions.filter(
    (attributeDefinition) =>
      typeof attributeDefinition._AutoGenerated === "object" &&
      attributeDefinition._AutoGenerated !== null &&
      attributeDefinition._AutoGenerated.onEvents instanceof Array &&
      attributeDefinition._AutoGenerated.onEvents.includes(event)
  );

  for (const autoGenAttr of currentEventAutoFillAttributes) {
    const { AttributeName, _AutoGenerated } = autoGenAttr;

    switch (_AutoGenerated?.autoGenType) {
      case "uuid":
        item[AttributeName] = uuidv4();
        break;
      case "timestamp":
        item[AttributeName] = new Date().toISOString();
        break;
      default:
        throw new Error(`Unknown auto-generated attribute type: ${_AutoGenerated?.autoGenType}`);
    }
  }
}

/**
 *
 * @param schema
 * @param item
 */
function validateDynamoDBValueUpdate(schema: DynamoDBModel["schema"], item: PrimitiveDynamoDBRecord) {
  const needyAttributes = schema.AttributeDefinitions.filter((attributeDefinition) => attributeDefinition._AllowedValues instanceof Array);

  for (const needyAttribute of needyAttributes) {
    const { AttributeName, _AllowedValues } = needyAttribute;
    const itemValue = item[AttributeName];

    // @ts-ignore: Object is possibly 'undefined' check is done above
    if (!_AllowedValues.includes(itemValue)) {
      throw new ValidationError(`Invalid value for attribute ${AttributeName}. Value: ${itemValue}. Allowed values: ${_AllowedValues}`);
    }
  }
}

/**
 *
 * @param value
 * @returns
 */
export function isDynamoDBPrimitiveValue(value: any): value is DDBPrimitive {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
