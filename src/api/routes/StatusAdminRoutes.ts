import { KnownStatusValues } from "../../data/models/StatusInfo";
import DynamoDB from "../../services/AWS/DynamoDB";
import Documentation from "../utils/Documentation";
import OpenAPIExpressRoutes from "../utils/OpenAPIExpressRoutes";

export default function (rootRoutePath: string) {
  const routes = new OpenAPIExpressRoutes(rootRoutePath);

  routes.addRoute({
    path: "/status-infos",
    method: "GET",
    async handler(req, res) {
      const items = await DynamoDB.scan("StatusInfo");
      res.send(items);
    },
    openapi: {
      summary: "Status infos",
      description: "Get all status infos",
      responses: {
        "200": {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: Documentation.getSchema("StatusInfo"),
              },
            },
          },
        },
      },
    },
  });

  routes.addRoute({
    path: "/status-infos/:id",
    method: "POST",
    async handler(req, res) {
      const { id } = req.params;
      const { statusValue } = req.body;
      const item = await DynamoDB.updateItem("StatusInfo", { id: id, statusValue: statusValue });
      res.send(item);
    },
    openapi: {
      summary: "Update status info",
      description: "Update status info value",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
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
      },
    },
  });

  routes.addRoute({
    path: "/status-infos/:id",
    method: "DELETE",
    async handler(req, res) {
      const { id } = req.params;
      await DynamoDB.deleteItem("StatusInfo", { id: id });
      res.send();
    },
    openapi: {
      summary: "Delete status info",
      description: "Delete status info",
      responses: {
        "200": {
          description: "Success",
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
      description: "Get meta data about known statuses",

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

  return routes.getRouter();
}
