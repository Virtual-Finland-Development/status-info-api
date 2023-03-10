import { KnownStatusValues } from "../../../data/models/StatusInfo";
import DynamoDB from "../../../services/AWS/DynamoDB";
import Documentation from "../../utils/Documentation";
import OpenAPIExpressRoutes from "../../utils/OpenAPIExpressRoutes";
import Authenticator from "./authentication/Authenticator";

export default function (routes: OpenAPIExpressRoutes, pathPrefix?: string) {
  routes.addRoute({
    path: "/status-infos",
    pathPrefix: pathPrefix,
    method: "GET",
    async handler(req, res) {
      const { authorization } = req.headers;
      await Authenticator.verifyLocalAppToken(authorization, "STATUS_ADMIN_ACCESS:READ");
      const items = await DynamoDB.scan("StatusInfo");
      res.send(items);
    },
    openapi: {
      summary: "Retrieve status infos",
      description: "Get all status infos",
      security: [{ BearerAuth: ["status-admin"] }],
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
      const { authorization } = req.headers;
      await Authenticator.verifyLocalAppToken(authorization, "STATUS_ADMIN_ACCESS:WRITE");

      const item = await DynamoDB.updateItem("StatusInfo", { id: id, statusValue: statusValue });
      res.send(item);
    },
    openapi: {
      summary: "Update status info",
      description: "Update status info value",
      security: [{ BearerAuth: ["status-admin"] }],
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
    path: "/status-infos",
    method: "POST",
    async handler(req, res) {
      const inputStatuses = req.body;
      const { authorization } = req.headers;
      await Authenticator.verifyLocalAppToken(authorization, "STATUS_ADMIN_ACCESS:WRITE");

      await DynamoDB.updateItems("StatusInfo", inputStatuses);
      res.send();
    },
    openapi: {
      summary: "Update many status infos",
      description: "Update status infos in a batch request",
      security: [{ BearerAuth: ["status-admin"] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: Documentation.getSchema("StatusInfo", "id"),
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
            "application/json": {},
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
      const { authorization } = req.headers;
      await Authenticator.verifyLocalAppToken(authorization, "STATUS_ADMIN_ACCESS:WRITE");

      await DynamoDB.deleteItem("StatusInfo", { id: id });
      res.send();
    },
    openapi: {
      summary: "Delete status info",
      description: "Delete status info",
      security: [{ BearerAuth: ["status-admin"] }],
      responses: {
        "200": {
          description: "Success",
        },
      },
    },
  });

  routes.addRoute({
    path: "/status-infos",
    method: "DELETE",
    async handler(req, res) {
      const inputStatuses = req.body;
      const { authorization } = req.headers;
      await Authenticator.verifyLocalAppToken(authorization, "STATUS_ADMIN_ACCESS:WRITE");
      await DynamoDB.deleteItems("StatusInfo", inputStatuses);
      res.send();
    },
    openapi: {
      summary: "Delete many status infos",
      description: "Delete status infos in a batch request",
      security: [{ BearerAuth: ["status-admin"] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: Documentation.getSchema("StatusInfo", "id"),
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Success",
          content: {
            "application/json": {},
          },
        },
      },
    },
  });

  routes.addRoute({
    path: "/get-known-statuses",
    method: "GET",
    async handler(req, res) {
      const { authorization } = req.headers;
      await Authenticator.verifyLocalAppToken(authorization, "STATUS_ADMIN_ACCESS:READ");
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
      security: [{ BearerAuth: ["status-admin"] }],
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
}
