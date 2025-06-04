// Import Socket.io server instance
import { io } from "../../socket";
import { Request, Response } from "express";
import Message from "../../models/Message";
import Chat from "../../models/Chat";

// Send a new message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, text, mediaUrl, replyTo, tempId } = req.body;
    //@ts-ignore
    const sender = req.user._id; // from auth middleware

    if (!chatId || (!text && !mediaUrl)) {
      return res
        .status(400)
        .json({ error: "chatId and text or media required" });
    }

    // Create the message
    const message = new Message({
      chat: chatId,
      sender,
      text,
      mediaUrl,
      replyTo,
      status: "sent",
      tempId,
    });
    await message.save();

    // Update chat's lastMessage
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    res.status(201).json(message);

    // --- Real-time: emit new message to chat room via Socket.io ---
    // Populate sender if needed before emitting
    await message.populate("sender", "name avatarUrl");
    io.to(chatId).emit("newMessage", message);
    // -------------------------------------------------------------
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Mark one message as read
export const markMessageRead = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByIdAndUpdate(
      messageId,
      { status: "read" },
      { new: true }
    );
    if (!message) return res.status(404).json({ error: "Message not found" });
    res.json(message);
    io.to(message.chat.toString()).emit("messageUpdated", message);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

// Mark all messages in chat as read (for the user)
export const markAllReadInChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    //@ts-ignore
    const userId = req.user._id;
    // Only mark messages not sent by this user
    await Message.updateMany(
      { chat: chatId, sender: { $ne: userId }, status: { $ne: "read" } },
      { $set: { status: "read" } }
    );
    res.json({ message: "All messages marked as read" });

  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

// Add a reaction (like, emoji, etc.) to a message
export const reactToMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body; // reaction is the emoji string
    //@ts-ignore
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    
    if (!message) return res.status(404).json({ error: "Message not found" });
    // Ensure reactions array exists
    if (!Array.isArray(message.reactions)) {
      message.reactions = [];
    }

    // Remove userId from all reaction.users arrays first (only one reaction per user allowed)
    for (const r of message.reactions) {
      r.users = r.users.filter((u: any) => u.toString() !== userId.toString());
    }
    // Then, add userId to the selected emoji's users
    let reactionObj = message.reactions.find((r: any) => r.emoji === reaction);
    if (reactionObj) {
      reactionObj.users.push(userId);
    } else {
      message.reactions.push({ emoji: reaction, users: [userId] });
    }
    // Optionally, remove reaction objects with empty users arrays (cleanup)
    message.reactions = message.reactions.filter(
      (r: any) => r.users.length > 0
    );
    await message.save();
    // Populate sender and nested reactions.users with name and profilePicture
    await message.populate([
      { path: "sender", select: "name profilePicture _id" },
      { path: "reactions.users", select: "name profilePicture _id" }
    ]);
    io.to(message.chat.toString()).emit("reactionAdded", {
      messageId: message._id,
      emoji: reaction,
      userId,
    });
    res.json(message);
    io.to(message.chat.toString()).emit("messageUpdated", message);
  } catch (err) {
    res.status(500).json({ error: "Failed to add reaction" });
  }
  
};
