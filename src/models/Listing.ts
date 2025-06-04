import mongoose from 'mongoose';


const ListingSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    offeredSkill:{
        type: String,
        required: true
    },
    wantedSkill:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});