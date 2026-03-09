import express from "express";
import { initializePayment } from "../controllers/paystackController.js";

const router = express.Router();

router.post("/initialize", initializePayment);

export default router;
