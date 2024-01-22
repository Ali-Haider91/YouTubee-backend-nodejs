import dotenv  from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB()










// (async ()=>{
//     try {
//         const db=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//     } catch (error) {
//         console.log("ERROR",error)
//         throw err
//     }
// })()