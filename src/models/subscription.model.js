import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        channel : { // the user to whome subscriber is subscribing to.
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        subscribers : { // the user who is subscribing to a channel.
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    }, 
    {
        timestamps : true
    }
)

export const Subscription = mongoose.model('Subscription', subscriptionSchema)