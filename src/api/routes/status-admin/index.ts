import OpenAPIExpressRoutes from "../../utils/OpenAPIExpressRoutes";

import StatusAdminActions from "./StatusAdminActions";
import StatusAdminAuthentication from "./StatusAdminAuthentication";

export default function (rootRoutePath: string) {
  const routes = new OpenAPIExpressRoutes(rootRoutePath);

  StatusAdminActions(routes);
  StatusAdminAuthentication(routes, "/auth");

  return routes.getRouter();
}
