import { AttributeValue } from "@aws-sdk/client-dynamodb";

type SimpleDynamoDBKey = Record<string, string | number | boolean | AttributeValue>;
