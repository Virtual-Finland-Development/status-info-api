import express from "express";
import DynamoDB from "../../lib/AWS/DynamoDB/";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("OK Status Admin UI");
});

router.put("/statusinfos", async (req, res) => {
  //const response = await DynamoDB.putItem("StatusInfo", { UserId: "bizz", UserEmail: "bizz@bazz" });
  //res.send({ bazz: response });
  return res.status(400).json({ message: "Not implemented" });
});

router.get("/statusinfos", async (req, res) => {
  const response = await DynamoDB.scan("StatusInfo");
  res.send({ items: response });
});

router.post("/statusinfos/:id", async (req, res) => {
  const { id } = req.params;
  const { StatusName, StatusValue } = req.body;
  const response = await DynamoDB.updateItem("StatusInfo", { Id: id, StatusName: StatusName, StatusValue: StatusValue });
  res.send({ item: response });
});

router.delete("/statusinfos/:id", async (req, res) => {
  const { id } = req.params;
  const response = await DynamoDB.deleteItem("StatusInfo", { Id: id });
  res.send({ item: response });
});

export default router;
