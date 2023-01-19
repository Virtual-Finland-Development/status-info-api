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
exports.createLambdaFunction = exports.createLambdaExecRole = void 0;
const aws = __importStar(require("@pulumi/aws"));
const awsnative = __importStar(require("@pulumi/aws-native"));
const command_1 = require("@pulumi/command");
const pulumi = __importStar(require("@pulumi/pulumi"));
function createLambdaExecRole(stackConfig) {
    const lambdaExecRole = new awsnative.iam.Role(stackConfig.generateResourceName('lambdaExecRole'), {
        assumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'sts:AssumeRole',
                    Principal: {
                        Service: 'lambda.amazonaws.com',
                    },
                    Effect: 'Allow',
                    Sid: '',
                },
            ],
        },
    });
    return lambdaExecRole;
}
exports.createLambdaExecRole = createLambdaExecRole;
function createLambdaFunction(stackConfig, lambdaFunctionExecRole, dynamoDBtableName) {
    new aws.iam.RolePolicyAttachment(stackConfig.generateResourceName('lambdaRoleAttachment'), {
        role: pulumi.interpolate `${lambdaFunctionExecRole.roleName}`,
        policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
    });
    /**
     * Dependencies layer for lambda functions
     */
    const nodeModulesLayer = new aws.lambda.LayerVersion('authentication-gw-dependenices-layer', {
        code: new pulumi.asset.AssetArchive({
            './nodejs/node_modules': new pulumi.asset.FileArchive('../node_modules'),
        }),
        compatibleRuntimes: [aws.lambda.Runtime.NodeJS18dX],
        layerName: 'authentication-gw-dependenices-layer',
    });
    const lambdaFunction = new aws.lambda.Function(stackConfig.generateResourceName('lambdaFunction'), {
        role: lambdaFunctionExecRole.arn,
        runtime: 'nodejs18.x',
        handler: 'app.handler',
        timeout: 10,
        memorySize: 512,
        code: new pulumi.asset.AssetArchive({
            '.': new pulumi.asset.FileArchive('../dist'),
        }),
        layers: [nodeModulesLayer.arn],
        environment: {
            variables: {
                DYNAMODB_TABLE_NAME: dynamoDBtableName,
            },
        },
    });
    const lambdaFunctionUrl = new awsnative.lambda.Url(stackConfig.generateResourceName('lambdaFunctionUrl'), {
        targetFunctionArn: lambdaFunction.arn,
        authType: awsnative.lambda.UrlAuthType.None,
    });
    new command_1.local.Command('aws-command', {
        create: pulumi.interpolate `aws lambda add-permission --function-name ${lambdaFunction.name} --action lambda:InvokeFunctionUrl --principal '*' --function-url-auth-type NONE --statement-id FunctionURLAllowPublicAccess`,
    }, { deleteBeforeReplace: true, dependsOn: [lambdaFunction] });
    return lambdaFunctionUrl;
}
exports.createLambdaFunction = createLambdaFunction;
