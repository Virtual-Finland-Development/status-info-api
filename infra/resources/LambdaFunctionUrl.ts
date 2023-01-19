import * as aws from '@pulumi/aws';
import * as awsnative from '@pulumi/aws-native';
import { local } from '@pulumi/command';
import * as pulumi from '@pulumi/pulumi';

export function createLambdaExecRole(stackConfig: StackConfig) {
  const lambdaExecRole = new awsnative.iam.Role(
    stackConfig.generateResourceName('lambdaExecRole'),
    {
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
    }
  );
  return lambdaExecRole;
}

export function createLambdaFunction(
  stackConfig: StackConfig,
  lambdaFunctionExecRole: awsnative.iam.Role,
  dynamoDBtableName: pulumi.Output<string>
) {
  new aws.iam.RolePolicyAttachment(
    stackConfig.generateResourceName('lambdaRoleAttachment'),
    {
      role: pulumi.interpolate`${lambdaFunctionExecRole.roleName}`,
      policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
    }
  );

  /**
   * Dependencies layer for lambda functions
   */
  const nodeModulesLayer = new aws.lambda.LayerVersion(
    'authentication-gw-dependenices-layer',
    {
      code: new pulumi.asset.AssetArchive({
        './nodejs/node_modules': new pulumi.asset.FileArchive(
          '../node_modules'
        ),
      }),
      compatibleRuntimes: [aws.lambda.Runtime.NodeJS18dX],
      layerName: 'authentication-gw-dependenices-layer',
    }
  );

  const lambdaFunction = new aws.lambda.Function(
    stackConfig.generateResourceName('lambdaFunction'),
    {
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
    }
  );

  const lambdaFunctionUrl = new awsnative.lambda.Url(
    stackConfig.generateResourceName('lambdaFunctionUrl'),
    {
      targetFunctionArn: lambdaFunction.arn,
      authType: awsnative.lambda.UrlAuthType.None,
    }
  );

  new local.Command(
    'aws-command',
    {
      create: pulumi.interpolate`aws lambda add-permission --function-name ${lambdaFunction.name} --action lambda:InvokeFunctionUrl --principal '*' --function-url-auth-type NONE --statement-id FunctionURLAllowPublicAccess`,
    },
    { deleteBeforeReplace: true, dependsOn: [lambdaFunction] }
  );

  return lambdaFunctionUrl;
}
