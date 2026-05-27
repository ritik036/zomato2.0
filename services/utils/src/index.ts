import express from "express"
import dotenv from "dotenv"
import cloundinary from "cloudinary"
import cors from "cors"
import uploadRoute from "./routes/cloudinary.js";

dotenv.config();

const PORT = process.env.PORT || 5002;

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }))

app.use("/api", uploadRoute)

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_API_SECRET) {
    throw new Error("Missing Cloudinary Environment Variables");
}

cloundinary.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET
})

app.listen(PORT, () => {
    console.log(`utils service is running on port ${PORT}`)
})