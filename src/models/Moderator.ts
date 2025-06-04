import mongoose from "mongoose";

const ModeratorSchema = new mongoose.Schema(
    {
        skillId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Skill",
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        reportedAt: {
            type: Date,
            default: Date.now
        }
    }
);
export default mongoose.model("Moderator", ModeratorSchema);