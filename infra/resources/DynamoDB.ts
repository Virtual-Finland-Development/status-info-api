import * as aws from '@pulumi/aws';
import * as awsnative from '@pulumi/aws-native';

export function createDynamoDBTable(
  configuration: StackConfig,
  lambdaFunctionExecRole: awsnative.iam.Role
) {
  const tableName = configuration.generateResourceName('StatusTable');
  const statusTable = new aws.dynamodb.Table(tableName, {
    name: tableName,
    attributes: [{ name: 'statusKey', type: 'S' }],
    hashKey: 'statusKey',
    billingMode: 'PAY_PER_REQUEST',
    tags: configuration.getTags(),
  });

  const dynamoDBPolicy = new aws.iam.Policy(
    configuration.generateResourceName('dynamoDBPolicy'),
    {
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
    }
  );

  // Attach to role
  new aws.iam.RolePolicyAttachment(
    configuration.generateResourceName('dynamoDBPolicyAttachment'),
    {
      role: lambdaFunctionExecRole.arn,
      policyArn: dynamoDBPolicy.arn,
    }
  );

  return statusTable;
}
