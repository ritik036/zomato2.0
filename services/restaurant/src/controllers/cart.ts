import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/TryCatch.js";
import Cart from "../models/Cart.js";

export const addToCart = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "please login"
        })
    }
    const userId = req.user._id;
    const { restaurantId, itemId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
            message: "invalid restaurant or item ID"
        })
    }
    const cartFromDifferentRestaurant = await Cart.findOne({ userId, restaurantId: { $ne: restaurantId } })

    if (cartFromDifferentRestaurant) {
        return res.status(400).json({
            message: "you can order only from one restaurant at a time, please clear your cart first"
        })
    }

    const cartItem = await Cart.findOneAndUpdate({ userId, restaurantId, itemId }, {
        $inc: { quantity: 1 },
        $setOnInsert: { userId, restaurantId, itemId }
    }, { upsert: true, new: true })

    return res.json({
        message: "item added to cart",
        cart: cartItem
    })
})


export const fetchMyCart = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "please login"
        })
    }
    const userId = req.user._id;
    const cartItems = await Cart.find({ userId }).populate("itemId").populate("restaurantId");
    let subTotal = 0;
    let cartLength = 0;

    for (const cartItem of cartItems) {
        const item: any = cartItem.itemId;
        subTotal += item.price * cartItem.quantity;
        cartLength += cartItem.quantity
    }

    return res.json({
        success: true,
        cartLength,
        subTotal,
        cart: cartItems
    })
})


export const incrementCartItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;

    if (!userId || !itemId) {
        return res.status(400).json({
            message: "invalid request"
        })
    }
    const cartItem = await Cart.findOneAndUpdate({ userId, itemId }, {
        $inc: { quantity: 1 }
    }, { new: true })

    if (!cartItem) {
        return res.status(404).json({
            message: "item not found"
        })
    }
    res.json({
        message: "quantity increased",
        cartItem
    })
})

export const decrementCartItem = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { itemId } = req.body;

    if (!userId || !itemId) {
        return res.status(400).json({
            message: "invalid request"
        })
    }
    const cartItem = await Cart.findOne({ userId, itemId })
    if (!cartItem) {
        return res.status(404).json({
            message: "item not found"
        })
    }
    if (cartItem.quantity === 1) {
        await Cart.deleteOne({ userId, itemId })
        return res.json({
            message: "item removed"
        })
    }
    cartItem.quantity -= 1;
    await cartItem.save();

    res.json({
        message: "quantity decreased",
        cartItem
    })
})

export const clearCart = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({
            message: "unauthorized user"
        })
    }
    await Cart.deleteMany({ userId })
    res.json({
        message: "cart cleared successfully"
    })
})