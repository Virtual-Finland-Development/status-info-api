import * as aws from "@pulumi/aws";
import * as awsnative from "@pulumi/aws-native";
import * as pulumi from "@pulumi/pulumi";

import StatusAdminUIModel from "../../src/data/models/StatusInfo";
import { transformModelToDynamoDBSchema } from "../../src/services/AWS/DynamoDB/DynamoDBORMUtils";
import { StackConfig } from "../types";

export function createDynamoDBTable(configuration: StackConfig, lambdaFunctionExecRole: awsnative.iam.Role) {
  const modelSchema = transformModelToDynamoDBSchema(StatusAdminUIModel);

  const tableInfo: any = {
    name: StatusAdminUIModel.tableName,
    attributes: modelSchema.AttributeDefinitions.map((ad) => {
      return {
        name: ad.AttributeName,
        type: ad.AttributeType,
      };
    }),
  };

  for (const keySchema of modelSchema.KeySchema) {
    if (keySchema.KeyType === "HASH") {
      tableInfo.hashKey = keySchema.AttributeName;
    } else if (keySchema.KeyType === "RANGE") {
      tableInfo.rangeKey = keySchema.AttributeName;
    }
  }

  const fulltableName = configuration.generateResourceName(tableInfo.name);
  const statusTable = new aws.dynamodb.Table(fulltableName, {
    ...tableInfo,
    name: fulltableName,
    billingMode: "PAY_PER_REQUEST",
    tags: configuration.getTags(),
  });

  const dynamoDBPolicy = new aws.iam.Policy(configuration.generateResourceName("dynamoDBPolicy"), {
    description: "DynamoDB policy for status-info api",
    policy: statusTable.arn.apply((arn) => {
      return JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["dynamodb:UpdateItem", "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem", "dynamodb:DescribeTable", "dynamodb:Scan", "dynamodb:Query"],
            Resource: [arn],
          },
        ],
      });
    }),
  });

  // Attach to role
  new aws.iam.RolePolicyAttachment(configuration.generateResourceName("dynamoDBPolicyAttachment"), {
    role: pulumi.interpolate`${lambdaFunctionExecRole.roleName}`,
    policyArn: dynamoDBPolicy.arn,
  });

  return statusTable;
}
