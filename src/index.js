// configuring the .env files
import dotenv from "dotenv"
import { app } from "./app.js";
import { connectDB } from "./db/connectDB.js";


dotenv.config(
    {path : './.env'}
) // .env configured...

connectDB()
.then(
    app.listen(process.env.PORT, () => {
        console.log(`SERVER LISTENING ON PORT ${process.env.PORT}`);
        console.log('---------------------------------------------------');
    })
).catch(
    () => {
        console.log('SERVER FAILED');
        console.log('---------------------------------------------------');
    }
)