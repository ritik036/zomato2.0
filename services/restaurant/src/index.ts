import express from "express"
import connectDB from "./db/db.js";
import dotenv from "dotenv"

dotenv.config();

const app = express();

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log("Restaurant service is running on port", port)
    connectDB();
})