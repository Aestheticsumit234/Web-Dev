import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Directory from "../model/directory.model.js";
import Session from "../model/session.model.js";
import User from "../model/User.model.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = new mongoose.Types.ObjectId();
    const rootDirId = new mongoose.Types.ObjectId();

    await Directory.create({
      _id: rootDirId,
      name: `root-${email}`,
      parentDirId: null,
      userId: userId,
    });

    await User.create({
      _id: userId,
      username,
      email,
      password: hashedPassword,
      rootDirId: rootDirId,
    });

    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(400).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "invalid email or password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "something went wrong." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "somthing went wrong" });
    }

    const session = await Session.create({ userId: user._id });

    if (!session) {
      return res.status(500).json({ error: "Session creation failed" });
    }

    res.cookie("sessionId", session._id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        rootDirId: user.rootDirId,
      },
    });
  } catch (error) {
    res.status(400).json({ error: "Login failed" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("sessionId");
    console.log("Logout requested");
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.log("Logout error:", error);
    res.status(400).json({ error: "Logout failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User found successfully!",
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("GetMe error:", error);
  }
};
