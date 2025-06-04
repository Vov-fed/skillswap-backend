import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    bio?: string;
    location?: string;
    profilePicture?: string;
    headerPicture?: string;
    role?: string;
    profession?: string;
    skills?: { name: string; }[];
    socials?: Record<string, string>;
    skilsInterested?: string[];
    skillsOffered?: string[];
    skillsRequested?: string[];
    skillsAccepted?: string[];
    posts?: Types.ObjectId[];
    chats?: Types.ObjectId[];
}

const UserSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    name:{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    headerPicture: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        default: 'user'
    },
    profession: {
        type: String,
        default: ''
    },
    skills: {
        type: [
            {
                name: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    socials: {
        type: Object,
        default: {}
    },
    skillRequestings: {
        type: [String],
        default: []
    },
    skillsInterested: {
        type: [String],
        default: []
    },
    skillsAccepted: {
        type: [String],
        default: []
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        default: []
    }],
    chats: [{
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        default: []
    }]
});

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;