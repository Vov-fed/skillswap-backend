import { io } from "../../socket";
import { Request, Response } from "express";
import Message from "../../models/Message";

// Delete a message (only sender or admin)
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    //@ts-ignore
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    // Allow only sender (or admin if you have admin logic)
    if (String(message.sender) !== String(userId)) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }
    await message.deleteOne();
    res.json({ message: "Message deleted" });
    // Emit real-time update for message deletion
    io.to(message.chat.toString()).emit("messageDeleted", messageId);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
};

// Delete all messages in a chat
export const deleteMessagesInChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    // You might want to check if the user is allowed to do this (owner/admin)
    await Message.deleteMany({ chat: chatId });
    // Emit real-time update for chat messages deletion
    io.to(chatId).emit("messagesDeleted", chatId);
    res.json({ message: "All messages deleted for chat" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete messages for chat" });
  }
};

// Remove the user's reaction from a message
export const removeReaction = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const emoji = req.query.emoji || req.body.emoji;
    if (!emoji) {
      return res.status(400).json({ error: "Emoji is required" });
    }
    //@ts-ignore
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    if (reactionIndex === -1) {
      return res.status(404).json({ error: "Reaction not found" });
    }

    const userIndex = message.reactions[reactionIndex].users.findIndex(u => String(u) === String(userId));
    if (userIndex !== -1) {
      message.reactions[reactionIndex].users.splice(userIndex, 1);
      if (message.reactions[reactionIndex].users.length === 0) {
        message.reactions.splice(reactionIndex, 1);
      }
    }
        await message.save();
        await message.populate([
          { path: "sender", select: "name profilePicture _id" },
          { path: "reactions.users", select: "name profilePicture _id" }
        ]);
// Emit real-time update for reaction removal
    io.to(message.chat.toString()).emit("messageUpdated", message);

    res.json(message);

  } catch (err) {
    res.status(500).json({ error: "Failed to remove reaction" });
  }
};