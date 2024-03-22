import { asyncHandler } from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";

const subscribe = asyncHandler(
    async (req, res) => {

        // we will create a new subscription documnent for every channel-subscrriber pair

        // right now a user is logged in 
        // this logged in user will be our subscriber

        // we will get channel by using userName 

        // so in this documnet req.user is subscriber and userName is channel

        // get yserName from url params
        const { userName } = req.params

        // user should not be allowed to subscribe to himself/herself
        if (userName === req.user?.userName) {
            throw new ApiError(400, 'Trying to subscribe to own channel.')
        }


        // get channel from the database
        const channel = await User.findOne(
            {
                userName : userName
            }
        )

        // if there is no channel of this userName throw error
        if (!channel) {
            throw new ApiError(400, 'No such channel exist.')
        }

        // a subscription document should not be repreated.
        const checkSubs = await Subscription.findOne({
            channel : channel,
            subscriber : req.user?._id
        })

        if (checkSubs) {
            throw new ApiError(400, 'Already Subscribed')
        }

        // insert subscription dociment in the collection.
        const subscription = await Subscription.create({
            channel : channel._id,
            subscriber : req.user?._id
        })        

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    subscription
                },
                "subscription added successfully."
            )
        )
    }
)

const getSubscribers = asyncHandler(
    async (req, res) => {

        const subscribers = await Subscription.aggregate(
            [
                {
                  '$match': {
                    'channel': req.user?._id
                  }
                }, {
                  '$lookup': {
                    'from': 'users', 
                    'localField': 'subscriber', 
                    'foreignField': '_id', 
                    'as': 'sub'
                  }
                }, {
                  '$unwind': '$sub'
                }, {
                  '$project': {
                    '_id' : 0,
                    'userName': '$sub.userName'
                  }
                }
            ]
        )

        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {
                    subscribers
                },
                'all subscribers fetched successfully.'
            )
        )
    }
)

const getSubscribedChannel = asyncHandler(
    async (req, res) => {

        const subscribedChannel = await Subscription.aggregate(
            [
                {
                  '$match': {
                    'subscriber': req.user?._id
                  }
                }, {
                  '$lookup': {
                    'from': 'users', 
                    'localField': 'channel', 
                    'foreignField': '_id', 
                    'as': 'channels'
                  }
                }, {
                  '$unwind': '$channels'
                }, {
                  '$project': {
                     '_id' : 0,
                    'userName': '$channels.userName'
                  }
                }
            ]
        )

        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {
                    subscribedChannel
                },
                "Channels fetched succesfully."
            )    
        )
    }
)

const unSubscribe = asyncHandler(
    async (req, res) => {

        const { userName } = req.params

        // user should not be able to unSubscribe himself/herself
        if (userName === req.user?.userName) {
            throw new ApiError(400, "Trying to unsubscribe with oneself")
        }

        // get channel
        const channel = await User.findOne(
            {
                userName : userName
            }
        )

        if (!channel) {
            throw new ApiError(400, "User doesn't exist or userName is incorrect.")
        }

        // subscribtion must already be presernt to be unsubscribed
        const sub = await Subscription.findOne(
            {
                subscriber : req.user?._id,
                channel : channel._id
            }
        )

        if (!sub) {
            throw new ApiError(400, "Not subscribed.")
        }

        // removing the subscription document with channel-subscriber pair
        // will be considered as unSubscription
        const response = await Subscription.deleteOne(
            {
                _id : sub._id
            }
        )

        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                {
                    response
                },
                "Unsubscribed successfully."
            )
        )
    }
)

export { 
    subscribe,
    getSubscribers,
    getSubscribedChannel,
    unSubscribe
}