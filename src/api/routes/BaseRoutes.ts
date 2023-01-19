import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("OK");
});

router.get("/health", (req, res) => {
  res.send({ message: "OK" });
});

export default router;
