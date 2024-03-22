import express from "express"
import { jwtVerify } from "../middlewares/auth.middleware.js"
import { subscribe, getSubscribers, getSubscribedChannel, unSubscribe } from "../controllers/subscription.controller.js"

const router = express.Router()

// subscribe to a channel, userName is the channel being subscribed to
// and current logged in user id subscriber. 
router.route('/subscribe/c/:userName').post(
    jwtVerify,
    subscribe
)

// get all subscribers
router.route('/get-subscribers').get(
    jwtVerify,
    getSubscribers
)

// get all subscribed channels
router.route('/get-subscribed-channels').get(
    jwtVerify,
    getSubscribedChannel
)

// unSubscribe channels
router.route('/unSubscribe/:userName').delete(
    jwtVerify,
    unSubscribe
)

export default router;