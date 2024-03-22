import express from 'express'; // importing express from express
import cors from 'cors' // used to handle cors - cross origin resources sharing
import cookieParser from 'cookie-parser'; // used to handle cookies

//-------------------------------------------------------------------------------------
// configuring express
// following middlware are used
// cors
// json
// urlencoded
// static


const app = express() // express() method transpers all the methods into app

// use method used to configue middlewares
app.use(cors(
    {
        origin : process.env.CORS_ORIGIN,
        credentials : true
    }
))

// used to pass req as json 
app.use(express.json())


// used to pass informatin through url
app.use(express.urlencoded(
    {
        extended : true,
        limit : '20ks'
    }
))

// express middleware to store static files
app.use(express.static('public'))

// to handle cookies
app.use(cookieParser())


// ----------------------------------------------------------------------------------
// routes

import userRouter from './routes/userRouter.route.js';
import videoRouter from './routes/videoRouter.route.js';
import subscriptionRouter from './routes/subscription.route.js';

app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter)
app.use('/api/v1/subscriptions', subscriptionRouter)


export { app }