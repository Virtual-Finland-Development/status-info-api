// @see: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html
export default {
  tableName: "StatusInfo",
  schema: {
    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH",
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: "id", // auto-generated uuid
        AttributeType: "S",
      },
      {
        AttributeName: "userId",
        AttributeType: "S",
      },
      {
        AttributeName: "userEmail",
        AttributeType: "S",
      },
      {
        AttributeName: "statusName",
        AttributeType: "S",
      },
      {
        AttributeName: "statusValue",
        AttributeType: "S",
      },
      {
        AttributeName: "updatedAt", // auto-generated timestamp
        AttributeType: "S",
      },
    ],
  },
};
