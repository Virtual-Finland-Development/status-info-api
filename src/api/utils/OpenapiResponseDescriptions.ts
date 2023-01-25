import { OpenAPIV3 } from "openapi-types";

export function getUnauthorizedOpenAPIDescription(): OpenAPIV3.ResponsesObject {
  return {
    "403": {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Unauthorized",
              },
            },
          },
        },
      },
    },
  };
}

export function getAccessDeniedOpenAPIDescription(): OpenAPIV3.ResponsesObject {
  return {
    "401": {
      description: "Access denied",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Access denied",
              },
            },
          },
        },
      },
    },
  };
}

export function getValidationErrorOpenAPIDescription(): OpenAPIV3.ResponsesObject {
  return {
    "422": {
      description: "Validation error",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Validation error",
              },
            },
          },
        },
      },
    },
  };
}
