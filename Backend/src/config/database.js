import mongoose from "mongoose"

const connectToDB = async () =>{
    try {
        console.log("Wating for the DATABASE Connection... 🫣🫣");

        await mongoose.connect(process.env.MONGO_URL);
        
        console.log("Connected With DATABASE Successfully... 😎😎");

    } catch (error) {
        console.log("Database Connection error ",error);
    }
}

export default connectToDB;