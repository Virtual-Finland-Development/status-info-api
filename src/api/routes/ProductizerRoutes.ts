import { KnownStatusValues } from "../../data/models/StatusInfo";
import Authorizer from "../../services/AuthentigationGW/Authorizer";
import DynamoDB from "../../services/AWS/DynamoDB";
import Documentation from "../utils/Documentation";
import OpenAPIExpressRoutes from "../utils/OpenAPIExpressRoutes";

export default function (rootRoutePath: string) {
  const routes = new OpenAPIExpressRoutes(rootRoutePath);

  routes.addRoute({
    path: "/receive-status-info",
    method: "POST",
    async handler(req, res) {
      const { statusName, statusValue } = req.body;
      const { authorization } = req.headers;
      const { userId, userEmail } = await Authorizer.getAuthorization(authorization); // throws

      let existingStatusInfo = await DynamoDB.findOne("StatusInfo", [
        { key: "userId", value: userId },
        { key: "statusName", value: statusName },
      ]);
      if (existingStatusInfo) {
        await DynamoDB.updateItem("StatusInfo", { id: existingStatusInfo.id, statusValue: statusValue });
        return res.send({ item: existingStatusInfo });
      }

      const item = await DynamoDB.putItem("StatusInfo", { userId: userId, userEmail: userEmail, statusName: statusName, statusValue: statusValue });
      return res.send({ item: item });
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
              schema: Documentation.getSchema("StatusInfo"),
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
    path: "/get-known-statuses",
    method: "GET",
    async handler(req, res) {
      const statusValues = Object.keys(KnownStatusValues);
      const statusLabels = Object.values(KnownStatusValues);
      const transformedOutput = statusValues.map((statusValue, index) => {
        return { statusValue: statusValue, label: statusLabels[index] };
      });
      return res.send(transformedOutput);
    },
    openapi: {
      summary: "Get known statuses",
      description: "Productizer for resolving known statuses",

      responses: {
        "200": {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    statusValue: {
                      type: "string",
                      example: "SENT",
                      description: "Status code",
                    },
                    label: {
                      type: "string",
                      example: "Sent",
                      description: "Label for the status in english",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return [rootRoutePath, routes.getRouter()];
}
