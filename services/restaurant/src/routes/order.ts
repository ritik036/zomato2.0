import express from "express"
import { isAuth } from "../middlewares/isAuth.js";
import { createOrder, fetchOrderForPayment } from "../controllers/Order.js";

const router = express.Router();

router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);



export default router;