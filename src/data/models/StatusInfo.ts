// @see: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html
export default {
  tableName: "StatusInfo",
  schema: {
    KeySchema: [
      {
        AttributeName: "Id",
        KeyType: "HASH",
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: "Id", // auto-generated uuid
        AttributeType: "S",
      },
      {
        AttributeName: "UserId",
        AttributeType: "S",
      },
      {
        AttributeName: "UserEmail",
        AttributeType: "S",
      },
      {
        AttributeName: "StatusName",
        AttributeType: "S",
      },
      {
        AttributeName: "StatusValue",
        AttributeType: "S",
      },
      {
        AttributeName: "UpdatedAt", // auto-generated timestamp
        AttributeType: "S",
      },
    ],
  },
};
