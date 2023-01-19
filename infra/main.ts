import * as pulumi from "@pulumi/pulumi";
import { createDynamoDBTable } from "./resources/DynamoDB";
import { createLambdaExecRole, createLambdaFunction } from "./resources/LambdaFunctionUrl";
import { createStackConfig } from "./utils";

const stackConfig = createStackConfig({
  name: "status-info-api",
  stage: pulumi.getStack(),
  project: "Virtual Finland",
  pulumiOrganization: pulumi.getOrganization(),
});

const execRole = createLambdaExecRole(stackConfig);
const dynamoDBtable = createDynamoDBTable(stackConfig, execRole);
const lambdaFunctionUrl = createLambdaFunction(stackConfig, execRole, dynamoDBtable.name);

//
// Outputs
//
export const dynamoDBtableName = dynamoDBtable.name;
export const url = lambdaFunctionUrl.functionUrl;
