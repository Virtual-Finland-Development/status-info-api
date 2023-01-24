import Documentation from "../utils/Documentation";
import OpenAPIExpressRoutes from "../utils/OpenAPIExpressRoutes";

export default function (rootRoutePath: string) {
  const routes = new OpenAPIExpressRoutes(rootRoutePath);

  routes.addRoute({
    path: "/",
    method: "GET",
    handler(req, res) {
      res.redirect("/docs");
    },
    openapi: {
      summary: "Redirect to the documentation",
      description: "Redirect to the documentation",
      responses: {
        "302": {
          description: "Redirect to the documentation",
        },
      },
    },
  });

  routes.addRoute({
    path: "/health",
    method: "GET",
    handler(req, res) {
      res.send({ message: "OK" });
    },
    openapi: {
      summary: "Get the status of the service",
      description: "Get the status of the service",
      responses: {
        "200": {
          description: "The status of the service",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    description: "The status of the service",
                    example: "OK",
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
    path: "/docs",
    method: "GET",
    handler(req, res) {
      const docs = Documentation.getSwaggerHtml("/docs/openapi.json");
      res.send(docs);
    },
    openapi: {
      summary: "Documentation",
      description: "API Documentation",
      responses: {
        "200": {
          description: "Swagger documentation page",
        },
      },
    },
  });

  routes.addRoute({
    path: "/docs/openapi.json",
    method: "GET",
    handler(req, res) {
      const docs = Documentation.asObject();
      res.send(docs); // as JSON
    },
    openapi: {
      summary: "OpenAPI JSON",
      description: "API documentation file",
      responses: {
        "200": {
          description: "OpenAPI JSON",
          content: {
            "application/json": {},
          },
        },
      },
    },
  });

  return [rootRoutePath, routes.getRouter()];
}
