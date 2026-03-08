import jwt from "jsonwebtoken";
import tokenBlackListModel from "../models/blacklist.model.js";


/**
 * @name authUser
 * @desc Middleware to authenticate the user by verifying the JWT token provided in the request cookies. 
 * It checks if the token is present, verifies its validity, and ensures it is not blacklisted. If the token is valid, 
 * it attaches the decoded user information to the request object and allows the request to proceed to the next middleware or route handler. 
 * If the token is missing, invalid, or blacklisted, it responds with an appropriate error message and status code.
 * @access Private
 */

const authUser = async (req, res, next) => {
    // const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized, token not Provided",
            });
        }

        const isTokenBlacklisted = await tokenBlackListModel.findOne({token});

        if(isTokenBlacklisted){
            return res.status(401).json({
                success: false,
                message: "Unauthorized, token is invalided",
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // req.user = decoded;
            req.user = {
                ...decoded,
                _id: decoded.id // हा बदल करा
            };
            next();
        }
        catch (error) {
            console.error("Error in authMiddleware:", error);
            return res.status(401).json({
                success: false,
                message: "Unauthorized, invalid token",
            });
        }
    }


export default {authUser};