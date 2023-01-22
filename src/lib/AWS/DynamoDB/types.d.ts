import { AttributeValue } from "@aws-sdk/client-dynamodb";

type LooseDynamoDBRecord = Record<string, DDBPrimitive | AttributeValue>;
type DynamoDBRecord = Record<string, AttributeValue>;

type DynamoDBModel = {
  tableName: string;
  schema: {
    AttributeDefinitions: Array<{ AttributeName: string; AttributeType: string }>;
    KeySchema: Array<{ AttributeName: string; KeyType: string }>;
    [key: string]: any;
  };
};

type DDBSearchClause = Array<{ key: string; value: DDBPrimitive; operator?: DDBOperator }>;

type DDBPrimitive = string | number | boolean;
type DDBOperator =
  | "="
  | "<>"
  | "<"
  | "<="
  | ">"
  | ">="
  | "BEGINS_WITH"
  | "BETWEEN"
  | "IN"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "ATTRIBUTE_EXISTS"
  | "ATTRIBUTE_NOT_EXISTS"
  | "ATTRIBUTE_TYPE"
  | "NULL"
  | "NOT_NULL";
