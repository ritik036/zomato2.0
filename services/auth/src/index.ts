import express from "express"
import dotenv from "dotenv"
import connectDB from "./db/db.js";
import cors from "cors"
dotenv.config();

const app = express();
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log("auth service is running on port", port)
    connectDB()
})

// import routes 
import authRoute from "./routes/auth.js";

app.use("/api/auth", authRoute)