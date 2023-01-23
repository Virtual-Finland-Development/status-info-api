import express from "express";
import { OpenAPIV3 } from "openapi-types";
import { trimSlashes } from "../../utils/Transformations";
import { HttpMethod, HttpMethods } from "../types/HttpMethods";
import Documentation from "../utils/Documentation";

export default class OpenAPIExpressRoutes {
  #router: any; // express.Router;
  #rootRoutePath: string;

  constructor(rootRoutePath: string = "/") {
    this.#router = express.Router();
    this.#rootRoutePath = `/${trimSlashes(rootRoutePath)}`;
  }

  getRouter() {
    return this.#router;
  }

  addRoute(routeDescription: { method: HttpMethod; path: string; handler: express.RequestHandler; openapi?: OpenAPIV3.OperationObject }) {
    const { method, path, handler, openapi } = routeDescription;
    const pathie = trimSlashes(path);
    const routerMethod = HttpMethods[method].toLowerCase();
    // Register route handler
    this.#router[routerMethod](`/${pathie}`, handler);
    // Register route documentation
    if (openapi) {
      const opsPath = `${this.#rootRoutePath}${pathie}`;
      Documentation.addOperationDoc(routerMethod, opsPath, openapi);
    }
  }
}
