"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDynamoDBTable = void 0;
const aws = __importStar(require("@pulumi/aws"));
function createDynamoDBTable(configuration, lambdaFunctionExecRole) {
    const tableName = configuration.generateResourceName('StatusTable');
    const statusTable = new aws.dynamodb.Table(tableName, {
        name: tableName,
        attributes: [{ name: 'statusKey', type: 'S' }],
        hashKey: 'statusKey',
        billingMode: 'PAY_PER_REQUEST',
        tags: configuration.getTags(),
    });
    const dynamoDBPolicy = new aws.iam.Policy(configuration.generateResourceName('dynamoDBPolicy'), {
        description: 'DynamoDB policy for authentication-gw',
        policy: statusTable.arn.apply(arn => {
            return JSON.stringify({
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Action: [
                            'dynamodb:UpdateItem',
                            'dynamodb:GetItem',
                            'dynamodb:PutItem',
                            'dynamodb:DeleteItem',
                            'dynamodb:DescribeTable',
                            'dynamodb:Scan',
                        ],
                        Resource: [arn],
                    },
                ],
            });
        }),
    });
    // Attach to role
    new aws.iam.RolePolicyAttachment(configuration.generateResourceName('dynamoDBPolicyAttachment'), {
        role: lambdaFunctionExecRole.arn,
        policyArn: dynamoDBPolicy.arn,
    });
    return statusTable;
}
exports.createDynamoDBTable = createDynamoDBTable;
