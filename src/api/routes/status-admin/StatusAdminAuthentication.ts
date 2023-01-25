import OpenAPIExpressRoutes from "../../utils/OpenAPIExpressRoutes";
import Authenticator from "./authentication/Authenticator";

export default function (routes: OpenAPIExpressRoutes, pathPrefix?: string) {
  routes.addRoute({
    path: "/login",
    pathPrefix: pathPrefix,
    method: "POST",
    async handler(req, res) {
      const { username, password } = req.body;
      const { idToken } = await Authenticator.login(username, password, "ACCESS_STATUS_ADMIN_UI_APP");
      res.send({ idToken });
    },
    openapi: {
      summary: "Login request",
      description: "Validate login credentials and return a JWT",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                },
                password: {
                  type: "string",
                },
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
                  idToken: {
                    type: "string",
                    description: "JWT token, valid for 1 hour",
                  },
                },
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
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
}
