import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text?: string;
  mediaUrl?: string;
  status: "sent" | "delivered" | "read";
  replyTo?: mongoose.Types.ObjectId;
  reactions: { emoji: string; users: mongoose.Types.ObjectId[] }[];
  createdAt: Date;
  updatedAt: Date;
  tempId: string;
}

const MessageSchema = new Schema<IMessage>(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    tempId: {
      type: String,
      default: () => Date.now().toString(),
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        users: [
          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

MessageSchema.path("reactions").default(() => []);

export default mongoose.model<IMessage>("Message", MessageSchema);
