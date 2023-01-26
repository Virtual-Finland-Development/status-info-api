import { KnownStatusValues } from "../../data/models/StatusInfo";
import Authorizer from "../../services/AuthentigationGW/Authorizer";
import DynamoDB from "../../services/AWS/DynamoDB";
import Documentation from "../utils/Documentation";
import OpenAPIExpressRoutes from "../utils/OpenAPIExpressRoutes";

/**
 * Transform statusInfo model to data product form (productizer)
 *
 * @param item
 * @returns
 */
function transformStatusInfo(item: any): { statusName: string; statusValue: string; statusLabel: string; updatedAt: string; createdAt: string } {
  const statusKeys = Object.keys(KnownStatusValues);
  const statusValues = Object.values(KnownStatusValues);
  const statusKeyIndex = statusKeys.indexOf(item.statusValue);
  const statusValue = statusValues[statusKeyIndex];
  const statusLabel = statusValue || "Unknown status";
  return { statusName: item.statusName, statusValue: item.statusValue, statusLabel: statusLabel, updatedAt: item.updatedAt, createdAt: item.createdAt };
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
      summary: "Retrieve user owned status info",
      description: "Productizer for user owned status info event",
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
                  statusLabel: {
                    type: "string",
                    example: "Sent",
                  },
                  statusValue: Documentation.getSchema("StatusInfo", "statusValue"),
                  updatedAt: Documentation.getSchema("StatusInfo", "updatedAt"),
                  createdAt: Documentation.getSchema("StatusInfo", "createdAt"),
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
      description: "Productizer for user owned status info event",
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
                  statusLabel: {
                    type: "string",
                    example: "Sent",
                  },
                  statusValue: Documentation.getSchema("StatusInfo", "statusValue"),
                  updatedAt: Documentation.getSchema("StatusInfo", "updatedAt"),
                  createdAt: Documentation.getSchema("StatusInfo", "createdAt"),
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
