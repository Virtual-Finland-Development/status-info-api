// @see: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html
export default {
  tableName: "StatusInfo",
  schema: {
    KeySchema: [
      // Primary composite key userid-statusname
      {
        AttributeName: "UserId",
        KeyType: "HASH",
      },
      {
        AttributeName: "StatusName",
        KeyType: "RANGE",
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: "UserId",
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
        AttributeName: "UpdatedAt",
        AttributeType: "S",
      },
    ],
  },
};
