import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import "express-async-errors";
import * as OpenApiValidator from "express-openapi-validator";
import DataManager from "../data/DataManager";
import BaseRoutes from "./routes/BaseRoutes";
import ProductizerRoutes from "./routes/ProductizerRoutes";
import StatusAdminUIRoutes from "./routes/status-admin/";
import Documentation from "./utils/Documentation";

//
// Setup
//
const routerApp = express();
const router = express.Router();
router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
DataManager.initialize();

//
// Routes
//
router.use(BaseRoutes("/"));
router.use(StatusAdminUIRoutes("/status-admin"));
router.use(ProductizerRoutes("/productizers"));
routerApp.use("/", router);

//
// Runtime
//
const openApiSpec = Documentation.initialize(routerApp);

// Request validation
routerApp.use(
  OpenApiValidator.middleware({
    apiSpec: openApiSpec,
    validateRequests: true,
    validateResponses: true,
  })
);

// Handle non-panicing errors
routerApp.use((err: any, req: any, res: any, next: any) => {
  console.error("Received exception", err);
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

//
// Packaging
//
export default routerApp;
