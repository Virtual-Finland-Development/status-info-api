import express from "express";
import DynamoDB from "../../lib/AWS/DynamoDB";
const router = express.Router();

router.put("/statusinfos", async (req, res) => {
  //const response = await DynamoDB.putItem("StatusInfo", { userId: "bizz", userEmail: "bizz@bazz" });
  //res.send({ bazz: response });
  throw new Error("Not implemented");
});

router.get("/statusinfos", async (req, res) => {
  const response = await DynamoDB.scan("StatusInfo");
  res.send({ items: response });
});

router.post("/statusinfos/:id", async (req, res) => {
  const { id } = req.params;
  const { statusName, statusValue } = req.body;
  const response = await DynamoDB.updateItem("StatusInfo", { id: id, statusName: "ExampleStatus", statusValue: "BAZZ" });
  res.send({ item: response });
});

router.delete("/statusinfos/:id", async (req, res) => {
  const { id } = req.params;
  const response = await DynamoDB.deleteItem("StatusInfo", { id: id });
  res.send({ item: response });
});

export default router;
