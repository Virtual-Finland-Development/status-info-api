import { AttributeValue } from "@aws-sdk/client-dynamodb";

type SimpleDynamoDBKey = Record<string, string | number | boolean | AttributeValue>;

type DynamoDBModel = {
  tableName: string;
  schema: {
    AttributeDefinitions: Array<{ AttributeName: string; AttributeType: string }>;
    KeySchema: Array<{ AttributeName: string; KeyType: string }>;
    [key: string]: any;
  };
};
