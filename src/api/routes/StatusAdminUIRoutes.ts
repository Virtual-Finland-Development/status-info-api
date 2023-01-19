import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("OK Status Admin UI");
});

export default router;
