import { Request, Response } from "express";
import Chat from "../../models/Chat";

export const createChat = async (req: Request, res: Response) => {
  try {
    const { participants, isGroup, groupName, groupAvatar } = req.body;
    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({ error: "Participants required" });
    }
    // Prevent duplicate private chat
    if (!isGroup) {
      const existingChat = await Chat.findOne({
        isGroup: false,
        participants: { $all: participants, $size: 2 }
      });
      if (existingChat) {
        return res.status(200).json(existingChat);
      }
    }
    const chat = new Chat({
      participants,
      isGroup: !!isGroup,
      groupName: isGroup ? groupName : "",
      groupAvatar: isGroup ? groupAvatar : "",
    });
    await chat.save();
    const fullChat = await chat.populate("participants", "name avatarUrl");
    res.status(201).json(fullChat);
  } catch (err) {
    res.status(500).json({ error: "Failed to create chat" });
  }
};