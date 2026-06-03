import express from "express"
import { deleteAccount, loginUser } from "../controllers/auth.js";
import { addUserRole, isAuth, myProfile } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", isAuth, myProfile);
router.delete("/delete", deleteAccount);


export default router;