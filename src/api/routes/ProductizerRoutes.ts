import Authorizer from "../../services/AuthentigationGW/Authorizer";
import DynamoDB from "../../services/AWS/DynamoDB";
import Documentation from "../utils/Documentation";
import OpenAPIExpressRoutes from "../utils/OpenAPIExpressRoutes";

function transformStatusInfo(item: any) {
  return { statusName: item.statusName, statusValue: item.statusValue };
}

export default function (rootRoutePath: string) {
  const routes = new OpenAPIExpressRoutes(rootRoutePath);

  routes.addRoute({
    path: "/test/lsipii/User/StatusInfo",
    method: "POST",
    async handler(req, res) {
      const { statusName } = req.body;
      const { authorization } = req.headers;
      const { userId } = await Authorizer.getAuthorization(authorization); // throws

      const item = await DynamoDB.searchOne("StatusInfo", [
        { key: "userId", value: userId },
        { key: "statusName", value: statusName },
      ]);

      if (item) {
        const statusInfo = transformStatusInfo(item);
        return res.send(transformStatusInfo(statusInfo));
      }
      return res.send();
    },
    openapi: {
      summary: "Retrieve users status info",
      description: "Productizer for users status info event",
      security: [{ BearerAuth: [] }],
      parameters: [{ in: "header", name: "Authorization", schema: { type: "string" } }], // Show in Swagger UI
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statusName: Documentation.getSchema("StatusInfo", "statusName"),
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusName: Documentation.getSchema("StatusInfo", "statusName"),
                  statusValue: Documentation.getSchema("StatusInfo", "statusValue"),
                },
              },
            },
          },
        },
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
      },
    },
  });

  routes.addRoute({
    path: "/test/lsipii/User/StatusInfo/Write",
    method: "POST",
    async handler(req, res) {
      const { statusName, statusValue } = req.body;
      const { authorization } = req.headers;
      const { userId, userEmail } = await Authorizer.getAuthorization(authorization); // throws

      let existingStatusInfo = await DynamoDB.searchOne("StatusInfo", [
        { key: "userId", value: userId },
        { key: "statusName", value: statusName },
      ]);

      if (existingStatusInfo) {
        existingStatusInfo = await DynamoDB.updateItem("StatusInfo", { id: existingStatusInfo.id, statusValue: statusValue });
        const statusInfo = transformStatusInfo(existingStatusInfo);
        console.debug("Updated existing status info", statusInfo);
        return res.send(statusInfo);
      }

      const item = await DynamoDB.putItem("StatusInfo", { userId: userId, userEmail: userEmail, statusName: statusName, statusValue: statusValue });
      const statusInfo = transformStatusInfo(item);
      console.debug("Created new status info", statusInfo);
      return res.send(transformStatusInfo(statusInfo));
    },
    openapi: {
      summary: "Add or update status info",
      description: "Productizer for users status info event",
      security: [{ BearerAuth: [] }],
      parameters: [{ in: "header", name: "Authorization", schema: { type: "string" } }], // Show in Swagger UI
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statusName: Documentation.getSchema("StatusInfo", "statusName"),
                statusValue: Documentation.getSchema("StatusInfo", "statusValue"),
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  statusName: Documentation.getSchema("StatusInfo", "statusName"),
                  statusValue: Documentation.getSchema("StatusInfo", "statusValue"),
                },
              },
            },
          },
        },
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
      },
    },
  });

  return routes.getRouter();
}
