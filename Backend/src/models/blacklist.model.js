import mongoose from "mongoose";

/**
 * Blacklist Token Schema
 * This schema is used to store tokens that have been blacklisted, such as those that have been revoked or expired.
 * It contains a single field 'token' which is a string and is required. The schema also includes timestamps to track when each token was added to the blacklist.
 */

const blacklistTokenSchema = new mongoose.Schema({
    token:{
        type: String,
        required: [true, "Token is required to the blacklist"],
        
    },
}, {timestamps: true});

const tokenBlackListModel = mongoose.model("blacklistToken", blacklistTokenSchema);

export default tokenBlackListModel;