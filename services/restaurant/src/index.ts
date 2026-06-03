import express from "express"
import connectDB from "./db/db.js";
import dotenv from "dotenv"
import restaurantRoute from "./routes/restaurant.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json())

const port = process.env.PORT || 5001

app.use("/api/restaurant", restaurantRoute)


app.listen(port, () => {
    console.log("Restaurant service is running on port", port)
    connectDB();
})

