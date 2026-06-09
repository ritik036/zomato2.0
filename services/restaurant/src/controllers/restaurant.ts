import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/TryCatch.js";
import { IRestaurant, Restaurant } from "../models/Restaurant.js";
import jwt from "jsonwebtoken"


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
            coordinates: [Number(longitude), Number(latitude)],
            formattedAddress,
        },
        isVerified: false
    })
    return res.status(201).json({
        message: "Restaurant created successfully."
    })
})


export const fetchMyRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {

    if (!req.user) {
        return res.status(401).json({
            message: "please login"
        })
    }
    const restaurant = await Restaurant.findOne({ ownerId: req.user._id });
    if (!restaurant) {
        return res.status(400).json({
            message: "No restaurant found"
        })
    }
    if (!req.user.restaurantId) {
        const token = jwt.sign({
            user: {
                ...req.user, restaurantId: restaurant._id
            }
        }, process.env.JWT_SECRET as string, { expiresIn: "15d" })
        return res.json({
            restaurant, token
        })
    }
    res.json({ restaurant })
})


export const updateRestaurantStatus = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "please login "
        })
    }
    const { status } = req.body;
    if (typeof status !== "boolean") {
        return res.status(400).json({
            message: "status must be boolean"
        })
    }

    const restaurant = await Restaurant.findOneAndUpdate({
        ownerId: req.user._id
    }, {
        isOpen: status
    }, {
        new: true
    })

    if (!restaurant) {
        return res.status(404).json({
            message: "restaurant not found"
        })
    }

    res.json({
        message: "Restaurant Status Updated",
        restaurant
    })
})


export const updateRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(403).json({
            message: "please login"
        })
    }

    const { name, description } = req.body
    const restaurant = await Restaurant.findOneAndUpdate({ ownerId: req.user._id }, {
        name, description
    }, { new: true })
    res.json({
        message: "Restaurant Status Updated",
        restaurant
    })
})


export const getNearbyRestaurant = TryCatch(async (req, res) => {
    console.log("it requested this")
    const { latitude, longitude, radius, search = "" } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({
            message: "latitude and longitude are required"
        })
    }
    const radiusValue =
        radius !== undefined && radius !== ""
            ? Number(radius)
            : 100000;
    if (radius !== undefined && radius !== "" && Number.isNaN(radiusValue)) {
        return res.status(400).json({
            message: "radius must be a number"
        })
    }
    const query: any = {}
    if (search && typeof search === "string") {
        query.name = { $regex: search, $options: "i" }
    }
    const restaurants = await Restaurant.aggregate([{
        $geoNear: {
            near: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)]
            },
            distanceField: "distance",
            maxDistance: radiusValue,
            spherical: true,
            query
        }
    },
    {
        $sort: {
            isOpen: -1,
            distance: 1
        }
    }, {
        $addFields: {
            distanceKm: {
                $round: [{ $divide: ["$distance", 1000] }, 2]
            }
        }
    }])
    res.json({
        success: true,
        count: restaurants.length,
        restaurants
    })
})

export const fetchSingleRestaurant = TryCatch(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
    res.json(restaurant);
})

