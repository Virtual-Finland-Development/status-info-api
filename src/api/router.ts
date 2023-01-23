import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
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

//
// Packaging
//
routerApp.use("/", router);
Documentation.initialize(routerApp);

export default routerApp;
