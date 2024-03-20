// module to connect database
import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_CONNECTION_STRING}/${process.env.DATABASE_NAME}`)
        console.log('CONNECTION SUCCESSFULL');
        console.log(`HOST : ${connectionInstance.connection.host}`);
        console.log('---------------------------------------------------');
    } catch (error) {
        console.log('Test');
        console.log('CONNECTION FAILED');
        console.log('---------------------------------------------------');
    }
    
}

export { connectDB }



