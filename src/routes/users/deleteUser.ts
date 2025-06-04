import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../models/User";

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string || "default_secret") as { userId: string };
    const userId = decoded.userId;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token", error: error });
    }
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};