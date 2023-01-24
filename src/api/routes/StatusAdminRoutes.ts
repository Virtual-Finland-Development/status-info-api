import DynamoDB from "../../services/AWS/DynamoDB";
import Documentation from "../utils/Documentation";
import OpenAPIExpressRoutes from "../utils/OpenAPIExpressRoutes";

export default function (rootRoutePath: string) {
  const routes = new OpenAPIExpressRoutes(rootRoutePath);

  routes.addRoute({
    path: "/statusinfos",
    method: "GET",
    async handler(req, res) {
      const response = await DynamoDB.scan("StatusInfo");
      res.send({ items: response });
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
                items: {
                  type: "object",
                  properties: {
                    schema: Documentation.getSchema("StatusInfo"),
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
    path: "/statusinfos/:id",
    method: "POST",
    async handler(req, res) {
      const { id } = req.params;
      const { statusValue } = req.body;
      const response = await DynamoDB.updateItem("StatusInfo", { id: id, statusValue: statusValue });
      res.send({ item: response });
    },
    openapi: {
      summary: "Update status info",
      description: "Update status info status value",
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
    path: "/statusinfos/:id",
    method: "DELETE",
    async handler(req, res) {
      const { id } = req.params;
      const response = await DynamoDB.deleteItem("StatusInfo", { id: id });
      res.send({ item: response });
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

  return [rootRoutePath, routes.getRouter()];
}
