import mongoose, { Document } from "mongoose"

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId,
    restaurantId: mongoose.Types.ObjectId,
    itemId: mongoose.Types.ObjectId,
    quantity: number,
    createdAt: Date,
    updatedAt: Date
}


const cartSchema = new mongoose.Schema<ICart>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
        index: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
        index: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },
}, { timestamps: true });

cartSchema.index({
    userId: 1,
    itemId: 1,
    restaurantId: 1
}, { unique: true })

export default mongoose.model<ICart>("Cart", cartSchema)