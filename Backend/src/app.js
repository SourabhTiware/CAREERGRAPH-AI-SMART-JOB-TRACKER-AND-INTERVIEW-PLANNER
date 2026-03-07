import express from "express"
import authRouter from "./routes/Auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import interviewRouter from "./routes/interview.routes.js";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// middleware to listing data from the body and params. 
app.use(express.json());
app.use(cookieParser());

// "/api/auth" it is prefix. before accessing the auth related API you want to use prefix for auth related API - "/api/auth"

    app.use("/api/auth", authRouter); 
    app.use("/api/interview", interviewRouter);

    



export default app;


