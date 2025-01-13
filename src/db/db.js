import mongoose from "mongoose";

const connectDatabase = async() => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB is connected on ${connect.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection error", error)
        
    }
    
}

export default connectDatabase ;    