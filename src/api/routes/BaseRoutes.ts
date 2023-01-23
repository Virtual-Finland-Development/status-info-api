import Documentation from "../utils/Documentation";
import OpenAPIExpressRoutes from "../utils/OpenAPIExpressRoutes";

const routes = new OpenAPIExpressRoutes();

routes.addRoute(
  "get",
  "/",
  (req, res) => {
    res.redirect("/docs");
  },
  {
    summary: "Redirect to the documentation",
    description: "Redirect to the documentation",
    responses: {
      "302": {
        description: "Redirect to the documentation",
      },
    },
  }
);

routes.addRoute(
  "get",
  "/health",
  (req, res) => {
    res.send({ message: "OK" });
  },
  {
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
  }
);

routes.addRoute("get", "/docs", (req, res) => {
  const docs = Documentation.getSwaggerHtml("/docs/openapi.json");
  res.send(docs);
});

routes.addRoute("get", "/docs/openapi.json", (req, res) => {
  const docs = Documentation.asObject();
  res.send(docs);
});

export default routes.getRouter();
