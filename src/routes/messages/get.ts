import { Request, Response } from "express";
import Message from "../../models/Message";

export const getMessagesByChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { before, limit = 150 } = req.query;
    const query: any = { chat: chatId };

    if (before) {
      query._id = { $lt: before };
    }

    const messages = await Message.find(query)
      .sort({ _id: -1 }) // Newest first
      .limit(Number(limit))
      .populate([
        { path: "sender", select: "name profilePicture" },
        { path: "reactions.users", select: "name profilePicture" }
      ])
      .exec();

    // Return in chronological order
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};


export const getMessageById = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId)
      .populate([
        { path: "sender", select: "name profilePicture" },
        { path: "reactions.users", select: "name profilePicture" }
      ]);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch message" });
  }
};

export const searchMessagesInChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Query required" });
    }
    const messages = await Message.find({
      chat: chatId,
      text: { $regex: q, $options: "i" }
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate([
        { path: "sender", select: "name profilePicture" },
        { path: "reactions.users", select: "name profilePicture" }
      ]);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to search messages" });
  }
};