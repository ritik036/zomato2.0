import User from "../model/User.js";
import jwt from "jsonwebtoken"
import TryCatch from "../middlewares/TryCatch.js";
import { oauth2client } from "../config/googleApis.js";
import axios from "axios";


export const loginUser = TryCatch(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(401).json({
            message: "Authorization Code Is Required"
        })
    }

    const googleResponse = await oauth2client.getToken(code)
    oauth2client.setCredentials(googleResponse.tokens);

    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleResponse.tokens.access_token}`)

    const { email, name, picture } = userRes.data;


    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            name, email, image: picture
        })
    }
    const token = jwt.sign({ user }, process.env.JWT_SECRET as string, { expiresIn: "15d" })

    return res.status(200).json({
        message: "Login Success",
        user,
        token
    })
})