import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const dbConnect = async()=>{
    try {
        const connection = await mongoose.connect(uri);
        console.log("Database Conected Successfully.")
    } catch (error) {
        console.log("Database Connection Failed : ", error)
    }
    
}

export default dbConnect;