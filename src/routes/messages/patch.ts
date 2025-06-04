import { Request, Response } from "express";
import Message from "../../models/Message";

// Edit a message (only sender can edit)
export const editMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { text, mediaUrl } = req.body;
    //@ts-ignore
    const userId = req.user._id;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (String(message.sender) !== String(userId)) {
      return res.status(403).json({ error: "You can only edit your own messages" });
    }
    if (text !== undefined) message.text = text;
    if (mediaUrl !== undefined) message.mediaUrl = mediaUrl;
    message.updatedAt = new Date();
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to edit message" });
  }
};

// Update a message status
export const updateMessageStatus = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body; // e.g., "delivered" or "read"
    if (!["sent", "delivered", "read"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const message = await Message.findByIdAndUpdate(
      messageId,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

// Edit a reaction on a message
export const editReaction = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { reaction } = req.body;
    //@ts-ignore
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Replace or add new reaction (assuming message.reactions: [{ user, reaction }])
    const idx = message.reactions.findIndex(r => String(r.user) === String(userId));
    if (idx >= 0) {
      message.reactions[idx].reaction = reaction;
    } else {
      message.reactions.push({ user: userId, reaction });
    }
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to update reaction" });
  }
};