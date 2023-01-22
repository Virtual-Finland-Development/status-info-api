import express from "express";
import DynamoDB from "../../lib/AWS/DynamoDB/";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("OK Status Admin UI");
});

router.get("/bizz", async (req, res) => {
  const response = await DynamoDB.putItem("StatusInfo", { UserId: "bizz", UserEmail: "bizz@bazz" });
  res.send({ bazz: response });
});

router.get("/bazz", async (req, res) => {
  const response = await DynamoDB.scan("StatusInfo", [
    { key: "UserId", value: "bazz" },
    { key: "StatusName", value: "bizz" },
  ]);
  res.send({ bazz: response });
});

router.get("/all", async (req, res) => {
  const response = await DynamoDB.scan("StatusInfo");
  res.send({ items: response });
});

export default router;
