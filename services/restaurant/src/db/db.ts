import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI as string, {
            dbName: "Zomato_Clone"
        })
        console.log("connected to mongoDB")
    } catch (error) {
        console.log(error)
    }
}

export default connectDB