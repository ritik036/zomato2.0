import express from "express"
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addRestaurant, fetchMyRestaurant, fetchSingleRestaurant, getNearbyRestaurant, updateRestaurant, updateRestaurantStatus } from "../controllers/restaurant.js";
import uploadFile from "../middlewares/mutler.js";


const router = express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addRestaurant);
router.get("/my", isAuth, isSeller, fetchMyRestaurant)
router.put("/status", isAuth, isSeller, updateRestaurantStatus);
router.put("/edit", isAuth, isSeller, updateRestaurant);
router.get("/all", isAuth, getNearbyRestaurant);
router.get("/:id", isAuth, fetchSingleRestaurant)



export default router;