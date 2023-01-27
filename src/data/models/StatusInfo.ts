// Luonnos, Lähetetty, Käsittelyssä, Odottaa täydentämistä, Valmis,
export enum KnownStatusValues {
  "SENT" = "Sent",
  "PROCESSING" = "Processing",
  "WAITING_FOR_COMPLETION" = "Waiting for completion",
  "READY" = "Ready",
}

// @see: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html
export default {
  tableName: "StatusInfo",
  simpleSchema: {
    id: "",
    userId: "",
    userEmail: "",
    statusName: "",
    statusValue: "",
    createdAt: "",
    updatedAt: "",
  },
  schema: {
    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH",
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: "id", // auto-generated hash
        AttributeType: "S",
        _AutoGenerated: {
          onEvents: ["create"],
          autoGenType: "uuidv5",
          autoGenFields: ["userId", "statusName"],
        },
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
        _AllowedValues: Object.keys(KnownStatusValues),
        _DefaultValue: "SENT",
      },
      {
        AttributeName: "createdAt", // auto-generated timestamp
        AttributeType: "S",
        _AutoGenerated: {
          onEvents: ["create"],
          autoGenType: "timestamp",
          format: "iso",
        },
      },
      {
        AttributeName: "updatedAt", // auto-generated timestamp
        AttributeType: "S",
        _AutoGenerated: {
          onEvents: ["create", "update"],
          autoGenType: "timestamp",
          format: "iso",
        },
      },
    ],
  },
  openapi: {
    schema: {
      type: "object",
      properties: {
        id: {
          description: "auto-generated uuidv5(userId, statusName) hash",
          type: "string",
          example: "qwerty-12345-zappa-fr4nk-123456789",
        },
        statusName: {
          description: "programmic name of the status",
          type: "string",
          example: "tax-return-status",
        },
        statusValue: {
          description: "value of the status",
          type: "string",
          enum: Object.keys(KnownStatusValues),
          default: "SENT",
        },
        userId: {
          description: "user identification code",
          type: "string",
          example: "djregl-12345-mnccn-se4ax-123456789",
        },
        userEmail: {
          description: "email of the user",
          type: "string",
          example: "test@mail.localhost",
        },
        createdAt: {
          description: "auto-generated timestamp: create time",
          type: "string",
          format: "date-time",
        },
        updatedAt: {
          description: "auto-generated timestamp: last update time",
          type: "string",
          format: "date-time",
        },
      },
    },
  },
};
