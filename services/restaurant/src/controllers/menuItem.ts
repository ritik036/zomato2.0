import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Restaurant } from "../models/Restaurant.js";
import MenuItem from "../models/MenuItems.js";


export const addMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "please login"
        })
    }
    const restaurant = await Restaurant.findOne({
        ownerId: req.user._id
    })
    if (!restaurant) {
        return res.status(404).json({
            message: "restaurant not found"
        })
    }
    const { name, description, price } = req.body;
    if (!name || !price) {
        return res.status(401).json({
            message: "name & price are required"
        })
    }
    const file = req.file;

    if (!file) {
        return res.status(401).json({
            message: "please give image"
        })
    }

    const fileBuffer = getBuffer(file);
    if (!fileBuffer.content) {
        return res.status(500).json({
            message: "failed to create file buffer"
        })
    }

    const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`, {
        buffer: fileBuffer.content
    })

    const item = await MenuItem.create({
        name, description, price, restaurantId: restaurant._id,
        image: uploadResult.url,
    })

    res.json({
        message: "item added successfully",
        item
    })
})

export const getAllItems = TryCatch(async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            message: "id is required."
        })
    }
    const items = await MenuItem.find({
        restaurantId: id
    })
    res.json(items)
})


export const deleteMenuItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "please login"
        })
    }

    const { itemId } = req.params;
    if (!itemId) {
        return res.status(401).json({
            message: "id is required"
        })
    }

    const item = await MenuItem.findById(itemId);
    if (!item) {
        return res.status(404).json({
            message: "item not found"
        })
    }
    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id,
    })

    if (!restaurant) {
        return res.status(404).json({
            message: "restaurant not found"
        })
    }

    await item.deleteOne();

    res.json({
        message: "item deleted successfully"
    })
})


export const toggleMenuItemAvailability = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "please login"
        })
    }

    const { itemId } = req.params;
    if (!itemId) {
        return res.status(401).json({
            message: "id is required"
        })
    }

    const item = await MenuItem.findById(itemId);
    if (!item) {
        return res.status(404).json({
            message: "item not found"
        })
    }
    const restaurant = await Restaurant.findOne({
        _id: item.restaurantId,
        ownerId: req.user._id,
    })

    if (!restaurant) {
        return res.status(404).json({
            message: "restaurant not found"
        })
    }

    item.isAvailable = !item.isAvailable;

    res.json({
        message: `item marked as ${item.isAvailable ? "available" : "unavailable"}`, item
    })
})
