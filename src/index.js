 import dotenv  from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// setup Dotenv package in through import, module style 
dotenv.config({
    path: './.env'
})

connectDB()

// conect mongo DB to Express server listening
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is running at running: ${process.env.PORT}`);
    })
})
.catch((err) =>{
    console.log("MongoDB conncetion failed", err);
})












// (async ()=>{
//     try {
//         const db=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//     } catch (error) {
//         console.log("ERROR",error)
//         throw err
//     }
// })()