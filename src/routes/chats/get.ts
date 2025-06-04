import express, { Request, Response } from 'express';
import Message from '../../models/Message';
import Chat from '../../models/Chat';
// GET   /chats
// Get all chats for the authenticated user (with participants, last message, unread count)

// GET /chats
export const getChats = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user._id; // assume req.user is set by auth middleware

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name profilePicture")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name profilePicture" }
      })
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to get chats", });
  }
};

// GET /chats/:chatId
export const getChat = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user._id;
    const { chatId } = req.params;

    // Ensure user is a participant
    const chat = await Chat.findOne({ _id: chatId, participants: userId })
      .populate("participants", "name avatarUrl")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name avatarUrl" }
      });

    if (!chat) return res.status(404).json({ error: "Chat not found" });

    // Get recent messages (e.g., last 30)
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("sender", "name avatarUrl");

    res.json({ chat, messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ error: "Failed to get chat" });
  }
};


// GET /messages/:chatId?before=<msgId>&limit=<n>
// export const getMessages = async (req: Request, res: Response) => {
//   try {
//     // @ts-ignore
//     const userId = req.user._id;
//     const { chatId } = req.params;
//     const { before, limit = 30 } = req.query;

//     let filter: any = { chat: chatId };
//     if (before) {
//       filter._id = { $lt: before }; // get older messages
//     }

//     const messages = await Message.find(filter)
//       .sort({ _id: -1 })
//       .limit(Number(limit))
//       .populate("sender", "name avatarUrl");

//     res.json(messages.reverse()); // return oldest first
//   } catch (err) {
//     res.status(500).json({ error: "Failed to get messages" });
//   }
// };