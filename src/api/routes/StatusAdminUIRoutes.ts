import express from "express";
import DynamoDB from "../../lib/AWS/DynamoDB/";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("OK Status Admin UI");
});

router.get("/bazz", async (req, res) => {
  const response = await DynamoDB.getItem("StatusInfo", { UserId: "bazz", StatusName: "bizz" });
  res.send({ bazz: response });
});

export default router;
