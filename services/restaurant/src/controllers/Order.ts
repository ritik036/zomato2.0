import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/TryCatch.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import type { IMenuItem } from "../models/MenuItems.js";
import Order from "../models/Order.js";
import { Restaurant, type IRestaurant } from "../models/Restaurant.js";

export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
    const { paymentMethod, addressId } = req.body;


    if (!addressId) {
        return res.status(400).json({
            message: "Address not available"
        })
    }
    const address = await Address.findOne({
        _id: addressId,
        userId: user._id,
    })
    if (!address) {
        return res.status(404).json({
            message: "address not found"
        })
    }
    const getDistanceInKm = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return +(R * c).toFixed(2);
    };

    const cartItems = await Cart.find({
        userId: user._id
    }).populate<{ itemId: IMenuItem }>("itemId").populate<{ restaurantId: IRestaurant }>("restaurantId")

    if (cartItems.length === 0) {
        return res.status(400).json({
            message: "Cart is empty"
        })
    }
    const firstCartItem = cartItems[0];
    if (!firstCartItem || !firstCartItem.restaurantId) {
        return res.status(400).json({
            message: "invalid cart data"
        })
    }

    const restaurantId = firstCartItem.restaurantId._id;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        return res.status(404).json({
            message: "no restaurants with this id"
        })
    }
    if (!restaurant.isOpen) {
        return res.status(404).json({
            message: "Sorry, this restaurant is closed for now."
        })
    }

    const distance = getDistanceInKm(
        address.location.coordinates[1],
        address.location.coordinates[0],
        restaurant.autoLocation.coordinates[1],
        restaurant.autoLocation.coordinates[0]
    );


    let subTotal = 0;
    const orderItems = cartItems.map((cart) => {
        const item = cart.itemId;
        if (!item) {
            throw new Error("invalid cart item")
        }
        const itemTotal = item.price * cart.quantity;
        subTotal += itemTotal;
        return {
            itemId: item._id.toString(),
            name: item.name,
            price: item.price.toString(),
            quantity: cart.quantity
        }
    })
    const deliveryFee = subTotal < 249 ? 49 : 0;
    const plateFormFee = 7;
    const totalAmount = deliveryFee + plateFormFee + subTotal;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const [longitude, latitude] = address.location.coordinates;
    const riderAmount = Math.ceil(distance) * 17;


    const order = await Order.create({
        userId: user._id.toString(),
        restaurantId: restaurantId.toString(),
        restaurantName: restaurant.name,
        riderId: null,
        riderName: null,
        riderPhone: null,
        items: orderItems,
        subTotal: subTotal,
        deliveryFee: deliveryFee,
        plateFormFee: plateFormFee,
        totalAmount: totalAmount,
        addressId: addressId,
        deliveryAddress: {
            formattedAddress: address.formattedAddress,
            mobile: address.mobile,
            latitude: latitude,
            longitude: longitude
        },
        status: "placed",
        paymentMethod: paymentMethod,
        paymentStatus: "pending",
        expiresAt: expiresAt,
        riderAmount: riderAmount,
        distance: distance
    });

    await Cart.deleteMany({ userId: user._id });

    return res.status(201).json({
        message: "Order created successfully",
        orderId: order._id.toString(),
        amount: totalAmount
    })
})


export const fetchOrderForPayment = TryCatch(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(403).json({
            message: "forbidden"
        })
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({
            message: "Order Not Found"
        })
    }
    if (order.paymentStatus !== "pending") {
        return res.status(400).json({
            message: "order already paid"
        })
    }
    res.json({
        orderId: order._id,
        amount: order.totalAmount,
        currency: "INR"
    })
})