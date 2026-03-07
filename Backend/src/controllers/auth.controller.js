import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import blacklistModel from "../models/blacklist.model.js";


/**
 * @name registerUserController
 * @route POST /api/auth/register, expecting the request body to have username, email and password.
 * @desc Register a new user
 * @access Public   
 */

    const registerUserController = async(req,res) =>{

        const { username, email, password } = req.body;
        try {
            if(!username || !email || !password){
                return res.status(400).json({
                    success: false,
                    message: "All fields are required",
                });
            }

            const newUser = await userModel.findOne({
                $or: [{ username }, { email }],
            });

            if(newUser){
                if(newUser.username === username){
                    return res.status(400).json({
                        success: false,
                        message: "Username already taken",
                    });
                }

                if(newUser.email === email){
                    return res.status(400).json({
                        success: false,
                        message: "Account already exit with this Email address",
                    });
                }   
            }

            const hashedPassword = await bcrypt.hash(password, 10); 

            const user = await userModel.create({
                username,
                email,
                password: hashedPassword,
            });

            const token = jwt.sign({ id: user._id, username: user.username}, process.env.JWT_SECRET, {expiresIn: "1d"});

            res.cookie("token", token, {
            httpOnly: true, // JavaScript द्वारे कुकी वाचता येणार नाही (Security)
            secure: process.env.NODE_ENV === "production", // HTTPS असेल तरच पाठवा (Production मध्ये true)
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Cross-site साठी 'none' आवश्यक आहे
            maxAge: 24 * 60 * 60 * 1000, // 1 दिवस
        });

            res.status(201).json({
                success: true,
                message: "User Registered Successfully",
                user:{
                    id: user._id,
                    username: user.username,
                    email: user.email,
                },
            });
            
        } catch (error) {
            console.log("Error in Registerning User", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    };


/**
 * @name loginUserController
 * @route POST /api/auth/login, expecting the request body to have email and password.
 * @desc Login a user
 * @access Public
 */

    const loginUserController = async(req,res) =>{

        const { email, password } = req.body;

        try{

            if(!email || !password){
                return res.status(400).json({
                    success: false,
                    message: "All fields are required",
                });
            }

            const user = await userModel.findOne({ email });

            if(!user){
                return res.status(400).json({
                    success: false,
                    message: "Invalid Credentials",
                });
            } 

            const ispasswordMatch = await bcrypt.compare(password, user.password);

            if(!ispasswordMatch){
                return res.status(400).json({
                    success: false,
                    message: "Invalid Credentials",
                });
            }

            const token = jwt.sign({ id: user._id, username: user.username}, process.env.JWT_SECRET, {expiresIn: "1d"});

            res.cookie("token", token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production", 
                        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
                        maxAge: 24 * 60 * 60 * 1000, 
                    });

            res.status(200).json({
                success: true,
                message: "User Logged In Successfully",
                user:{
                    id: user._id,
                    username: user.username,
                    email: user.email,
                },
            });

        }catch(error){
            console.log("Error in Login User", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        };
    };


/** * @name logoutUserController
 * @route POST /api/auth/logout
 * @desc Logout a user by blacklisting the token and clearing the cookie
 * @access Public
 */
    const logoutUserController = async(req,res) =>{
        try {
            const token = req.cookies.token;

            if(token){
                await blacklistModel.create({ token });
            }

            res.clearCookie("token");
            res.status(200).json({
                success: true,
                message: "User Logged Out Successfully",
            });

        } catch (error) {
            console.log("Error in Logout User", error);
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    };

/**
 * @name getMeController
 * @route GET /api/auth/get-me
 * @desc Get the details of the logged in user
 * @access Private
 */

    const getMeController = async(req,res) =>{
        try {
            const user = await userModel.findById(req.user.id);
            
            res.status(200).json({
                message: "User Details Fetched Successfully",
                success: true,
                user:{
                    id: user._id,
                    username: user.username,
                    email: user.email,
                },
            });
        } catch (error) {
            console.log("Error in Get Me Controller", error);
            res.status(500).json({message: "Internal Server Error"});
        } 
    };


export default { registerUserController, loginUserController, logoutUserController, getMeController };