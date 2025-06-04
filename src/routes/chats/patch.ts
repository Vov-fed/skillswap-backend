import express from "express";
import Chat from "../../models/Chat";


export const patchChat = async (req: express.Request, res: express.Response) => {
  try {
    const { chatId } = req.params;
    const { groupName, groupAvatar, participants } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    if (!chat.isGroup) {
      if (groupName || groupAvatar || participants) {
        return res.status(400).json({ error: "Cannot update group fields on a private chat" });
      }
    } else {
      if (groupName !== undefined) chat.groupName = groupName;
      if (groupAvatar !== undefined) chat.groupAvatar = groupAvatar;
      if (participants !== undefined) {
        if (!Array.isArray(participants)) {
          return res.status(400).json({ error: "Participants must be an array of user IDs" });
        }
        chat.participants = participants;
      }
    }

    await chat.save();
    const updatedChat = await Chat.findById(chatId).populate("participants", "name avatarUrl");
    return res.json(updatedChat);
  } catch (error) {
    return res.status(500).json({ error: error || "Server error" });
  }
};