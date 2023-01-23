import express from "express";
import { OpenAPIV3 } from "openapi-types";
import Documentation from "../utils/Documentation";

export default class OpenAPIExpressRoutes {
  #router: any; // express.Router;

  constructor() {
    this.#router = express.Router();
  }

  getRouter() {
    return this.#router;
  }

  addRoute(routeDescription: { method: string; path: string; handler: express.RequestHandler; openapi?: OpenAPIV3.OperationObject }) {
    const { method, path, handler, openapi } = routeDescription;
    this.#router[method](path, handler);
    if (openapi) {
      Documentation.addOperationDoc(method, path, openapi);
    }
  }
}
