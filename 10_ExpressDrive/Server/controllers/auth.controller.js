import { writeFile } from "fs/promises";
import { Db, ObjectId } from "mongodb";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const db = req.db;
    const dirCollection = db.collection("directories");

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const userRootDir = await dirCollection.insertOne({
      name: `root-${email}`,
      parentDirId: null,
      files: [],
      directories: [],
    });

    const rootDirId = userRootDir.insertedId;

    const createdUser = await db.collection("users").insertOne({
      username,
      email,
      password,
      rootDirId,
    });

    const userId = createdUser.insertedId;
    await dirCollection.updateOne({ _id: rootDirId }, { $set: { userId } });
    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = req.db;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await db.collection("users").findOne({ email, password });

    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials!" });
    }

    const userOId = user._id.toString();
    res.cookie("userId", userOId, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: userOId,
        username: user.username,
        email: user.email,
        password: user.password,
      },
    });
  } catch (error) {
    res.status(400).json({ error: "Login failed" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("userId");
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
    const userId = req.userId;

    const user = await req.db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User found successfully!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
      },
    });
  } catch (error) {}
};
