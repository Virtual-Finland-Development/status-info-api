import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import * as OpenApiValidator from "express-openapi-validator";
import Documentation from "./Documentation";
import BaseRoutes from "./routes/BaseRoutes";
import ProductizerRoutes from "./routes/ProductizerRoutes";
import StatusAdminUIRoutes from "./routes/StatusAdminUIRoutes";

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
router.use("/", BaseRoutes);
router.use("/status-admin", StatusAdminUIRoutes);
router.use("/productizers", ProductizerRoutes);
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

routerApp.use((err: any, req: any, res: any, next: any) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

//
// Packaging
//
export default routerApp;
