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

export { 
    subscribe,
    getSubscribers
}