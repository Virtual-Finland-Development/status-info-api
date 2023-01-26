import express from "express";
import { OpenAPIV3 } from "openapi-types";
import { transformExpressUrlParamsToOpenAPI, trimSlashes } from "../../utils/Transformations";
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

  addRoute(routeDescription: { method: HttpMethod; path: string; pathPrefix?: string; handler: express.RequestHandler; openapi?: OpenAPIV3.OperationObject }) {
    const { method, path, handler, openapi } = routeDescription;
    let rootRoutePath = this.#rootRoutePath;
    const pathPrefix = routeDescription.pathPrefix || "";
    if (pathPrefix) {
      rootRoutePath = `/${trimSlashes(rootRoutePath)}/${trimSlashes(pathPrefix)}`;
    }

    const operationPath = rootRoutePath === "/" ? `/${trimSlashes(path)}` : `/${trimSlashes(rootRoutePath)}/${trimSlashes(path)}`;
    const routerMethod = HttpMethods[method].toLowerCase();
    // Register route handler
    this.#router[routerMethod](operationPath, handler);
    // Register route documentation
    if (openapi) {
      const openApiPath = transformExpressUrlParamsToOpenAPI(operationPath);
      Documentation.addOperationDoc(routerMethod, openApiPath, openapi);
    }
  }
}
