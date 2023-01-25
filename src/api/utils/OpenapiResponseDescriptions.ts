export function getAccessDeniedOpenAPIDescription() {
  return {
    "403": {
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
