import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    img: {
        type: String,
    },
    likes: {
        type: Array,
        default: []
    },
    comments: {
        type: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                content: {
                    type: String,
                    required: true
                },
                date: {
                    type: Date,
                    default: Date.now
                },
                likes: {
                    type: Array,
                    default: []
                }
            }
        ],
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Post', PostSchema);