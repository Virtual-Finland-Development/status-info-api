import express from "express";
import Documentation from "../Documentation";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("OK");
});

router.get("/health", (req, res) => {
  res.send({ message: "OK" });
});

router.get("/docs", (req, res) => {
  const docs = Documentation.getSwaggerHtml("/docs/openapi.json");
  res.send(docs);
});

router.get("/docs/openapi.json", (req, res) => {
  const docs = Documentation.asObject();
  res.send(docs);
});

export default router;
