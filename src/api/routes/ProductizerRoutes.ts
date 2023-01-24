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

      let existingStatusInfo = await DynamoDB.searchOne("StatusInfo", [
        { key: "userId", value: userId },
        { key: "statusName", value: statusName },
      ]);

      if (existingStatusInfo) {
        existingStatusInfo = await DynamoDB.updateItem("StatusInfo", { id: existingStatusInfo.id, statusValue: statusValue });
        console.debug("Updated existing status info", existingStatusInfo);
        return res.send({ item: existingStatusInfo });
      }

      const item = await DynamoDB.putItem("StatusInfo", { userId: userId, userEmail: userEmail, statusName: statusName, statusValue: statusValue });
      console.debug("Created new status info", item);
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

  return [rootRoutePath, routes.getRouter()];
}
