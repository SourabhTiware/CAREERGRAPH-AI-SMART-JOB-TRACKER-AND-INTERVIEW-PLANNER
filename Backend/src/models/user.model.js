import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "username already taken"],
        required: true,
    },

    email: {
        type:String,
        unique: [true, "Account already exit with this Email address"],
        required: true,
    },

    password:{
        type: String, 
        required: true,
    },
});

const userModel = mongoose.model("user", userSchema);

export default userModel;