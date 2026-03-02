import express from "express"
import authRouter from "./routes/Auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

// middleware to listing data from the body and params. 
app.use(express.json());
app.use(cookieParser());

// "/api/auth" it is prefix. before accessing the auth related API you want to use prefix for auth related API - "/api/auth"

    app.use("/api/auth", authRouter); 
    



export default app;


