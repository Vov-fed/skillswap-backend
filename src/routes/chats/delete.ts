import express from "express";
import Chat from "../../models/Chat";
import Message from "../../models/Message";

export const deleteChat = async (req: express.Request, res: express.Response) => {
    try {
        const { chatId } = req.params;

        // Find the chat and ensure it exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        // Delete all messages of this chat
        await Message.deleteMany({ chat: chatId });

        // Delete the chat
        await Chat.deleteOne({ _id: chatId });

        return res.status(200).json({ message: "Chat and messages deleted successfully" });
    } catch (error) {
        console.error("Error deleting chat:", error);
        return res.status(500).json({ error: "Server error" });
    }
};