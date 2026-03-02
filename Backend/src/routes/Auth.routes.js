// import express from "express";
// const authRouter = express.Router();

import { Router } from "express"; // alternative of above code - use here dis_structuring Router from express object. 
import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public   
 */

    authRouter.post("/register",authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @desc Login a user with email and password
 * @access Public   
 */

    authRouter.post("/login",authController.loginUserController);

/**
 * @route get /api/auth/logout
 * @desc clear token from user cookie and add the token to blacklist collection in DB
 * @access Public   
 */

    authRouter.get("/logout", authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @desc Get the details of the logged in user
 * @access Private
 */

    authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController);


export default authRouter;