import express from "express";
import DynamoDB from "../../lib/AWS/DynamoDB/index";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("OK Status Admin UI");
});

router.get("/bazz", async (req, res) => {
  const response = await DynamoDB.getItem("StatusAdminUI", { id: "bazz" });
  res.send({ bazz: response });
});

export default router;
