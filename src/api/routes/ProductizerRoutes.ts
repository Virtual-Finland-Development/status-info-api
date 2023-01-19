import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("OK Productizers");
});

export default router;
