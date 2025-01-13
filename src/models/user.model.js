import mongoose from "mongoose" ;

const userSchema = new mongoose.Schema({
    googleId : {
        type : String ,
    },
    userName : {
        type : String ,
    },
    email : {
        type : String
    }
    ,
    profilePhoto : {
        type : String
    }
},{timestamps: true})

export const User = mongoose.model("User",userSchema)