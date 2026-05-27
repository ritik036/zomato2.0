import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/TryCatch.js";
import { IRestaurant, Restaurant } from "../models/Restaurant.js";

export const addRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "unauthorized access",
        })
    }
    const existingRestaurant = await Restaurant.findOne({ ownerId: user._id });

    if (existingRestaurant) {
        return res.status(401).json({
            message: "you already have a restaurant"
        })
    }

    const { name, description, latitude, longitude, formattedAddress, phone } = req.body;
    if (!name || !description || !latitude || !longitude || !formattedAddress) {
        return res.status(401).json({
            message: "give all the input fields "
        })
    }
    const file = req.file;
    if (!file) {
        return res.status(401).json({
            message: "please give restaurant image"
        })
    }
    const fileBuffer = getBuffer(file)
    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "failed to create file buffer"
        })
    }
    const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`, {
        buffer: fileBuffer.content
    });
    const restaurant = await Restaurant.create({
        name, description, phone, image: uploadResult.url, ownerId: user._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(latitude), Number(longitude)],
            formattedAddress,
        }
    })
    return res.status(201).json({
        message : "Restaurant created successfully."
    })
})