import OpenAPIExpressRoutes from "../utils/OpenAPIExpressRoutes";

export default function (rootRoutePath: string) {
  const routes = new OpenAPIExpressRoutes(rootRoutePath);
  routes.addRoute({
    path: "/",
    method: "GET",
    handler(req, res) {
      res.send("OK Productizers");
    },
    openapi: {
      summary: "Dummy response to productizers base route path",
      description: "No implementations yet",
      responses: {
        "200": {
          description: "Success",
        },
      },
    },
  });

  return [rootRoutePath, routes.getRouter()];
}
