
import "dotenv/config";


import app from "./src/app.js";
import connectToDB from "./src/config/database.js";

let port = process.env.PORT;

connectToDB()
    .then(()=>{
        app.listen(port, ()=>{
            console.log(`server is running on port ${port}`);
        })
    })
    .catch((err) =>{
        console.log("MongoDB Connection Failed :",err);
        process.exit(1); // Exit if the server can't reach the DB
    });