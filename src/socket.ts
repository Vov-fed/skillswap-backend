// Call initSocket(server) in your main app entry after creating the HTTP server.
import { Server } from "socket.io";
import http from "http";
import Message from "./models/Message";

let io: Server;

export const initSocket = (server: http.Server) => {
io = new Server(server, {
  cors: {
    origin: "https://skillswap-mauve.vercel.app",
    methods: ["GET", "POST"],
    credentials: true
  }
});

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("joinChat", async ({ chatId, userId }) => {
    socket.join(chatId);
    // Find messages in this chat that are "sent" and not from this user
    const undelivered = await Message.find({
      chat: chatId,
      status: "sent",
      sender: { $ne: userId }
    });
    
    for (const msg of undelivered) {
      msg.status = "delivered";
      await msg.save();
      await msg.populate([
        { path: "sender", select: "name profilePicture _id" },
        { path: "reactions.users", select: "name profilePicture _id" }
      ]);
      io.to(chatId).emit("messageUpdated", msg);
    }
  });

    socket.on("readMessage", async ({ chatId, userId }) => {
    const deliveredMessages = await Message.find({
      chat: chatId,
      status: "delivered",
      sender: { $ne: userId }
    });
    for (const msg of deliveredMessages) {
      msg.status = "read";
      await msg.save();
      await msg.populate([
        { path: "sender", select: "name profilePicture _id" },
        { path: "reactions.users", select: "name profilePicture _id" }
      ]);
      io.to(chatId).emit("messageUpdated", msg);
      console.log(`Message ${msg._id} marked as read in chat ${chatId}`);
    }
  });

  
    socket.on("reactToMessage", async ({ messageId, emoji, userId }) => {
      console.log("Received reactToMessage event", { messageId, emoji, userId });
      const msg = await Message.findById(messageId);
      if (!msg) return;

      // Find reaction object for this emoji
      let reaction = msg.reactions.find(r => r.emoji === emoji);
      console.log("Found reaction?", !!reaction);
      if (reaction) {
        // If user already reacted, remove previous reaction or add new one
        const userIndex = reaction.users.findIndex(u => u.toString() === userId);
        console.log("User index in reaction.users:", userIndex);
        if (userIndex !== -1) {
          reaction.users.splice(userIndex, 1);
          io.to(msg.chat.toString()).emit("messageReacted", msg, reaction);
          io.to(msg.chat.toString()).emit("reactionAdded", {
            messageId: msg._id.toString(),
            emoji
          });
          console.log(`User ${userId} removed reaction ${emoji} from message ${messageId}`);
        } else {
          reaction.users.push(userId);
          io.to(msg.chat.toString()).emit("messageReacted", msg, reaction);
          io.to(msg.chat.toString()).emit("reactionAdded", {
            messageId: msg._id.toString(),
            emoji
          });
          console.log(`User ${userId} reacted with ${emoji} to message ${messageId}`);
        }
      } else {
        msg.reactions.push({ emoji, users: [userId] });
        console.log("Created new reaction entry");
        io.to(msg.chat.toString()).emit("messageReacted", msg, { emoji, users: [userId] });
        io.to(msg.chat.toString()).emit("reactionAdded", {
          messageId: msg._id.toString(),
          emoji
        });
        console.log(`User ${userId} reacted with ${emoji} to message ${messageId}`);
      }
      await msg.save();
      await msg.populate([
        { path: "sender", select: "name profilePicture _id" },
        { path: "reactions.users", select: "name profilePicture _id" }
      ]);
      io.to(msg.chat.toString()).emit("messageUpdated", msg);
    });

    socket.on("leaveChat", (chatId) => {
      socket.leave(chatId);
      // Optionally: console.log(`${socket.id} left chat ${chatId}`);
    });

    socket.on("disconnect", () => {
      // Optionally: console.log("Client disconnected:", socket.id);
    });
  });
};

export { io };