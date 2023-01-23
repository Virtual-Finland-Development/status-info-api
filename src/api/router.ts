import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import "express-async-errors";
import * as OpenApiValidator from "express-openapi-validator";
import BaseRoutes from "./routes/BaseRoutes";
import ProductizerRoutes from "./routes/ProductizerRoutes";
import StatusAdminUIRoutes from "./routes/StatusAdminRoutes";
import Documentation from "./utils/Documentation";

//
// Setup
//
const routerApp = express();
const router = express.Router();

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//
// Routes
//
router.use(...BaseRoutes("/"));
router.use("/status-admin", StatusAdminUIRoutes);
router.use(...ProductizerRoutes("/productizers"));
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
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

//
// Packaging
//
export default routerApp;
