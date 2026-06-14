import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/TryCatch.js";
import Address from "../models/Address.js";

export const addAddress = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req?.user;
    if (!user) {
        return res.status(401).json({
            message: "unauthorized"
        })
    }
    const { mobile, formattedAddress, latitude, longitude } = req.body;

    if (!mobile || !formattedAddress || latitude === undefined || longitude === undefined) {
        return res.status(401).json({
            message: "inputted data is not enough"
        })
    }
    const newAddress = await Address.create({
        userId: user._id.toString(),
        mobile, formattedAddress, location: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)]
        }
    })
    res.json({
        message: "Address addedd successfully",
        address: newAddress
    })
})


export const deleteAddress = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "unathorized"
        })
    }
    const { id } = req.params
    if (!id) {
        return res.status(400).json({
            message: "id is required"
        })
    }
    const address = await Address.findOne({
        _id: id,
        userId: user._id.toString()
    })
    if (!address) {
        return res.status(404).json({
            message: "address not found"
        })
    }
    await address.deleteOne();
    res.json({
        message: "Address Deleted Successfully"
    })
})


export const getMyAddress = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "unathorized"
        })
    }
    const addresses = await Address.find({
        userId: user._id.toString()
    }).sort({ createdAt: -1 })
    res.json(addresses);
})





