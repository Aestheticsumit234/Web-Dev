import { writeFile } from "fs/promises";
import UserData from "../UserDB.json" with { type: "json" };
import DirectoriesData from "../DirectoriesDB.json" with { type: "json" };
import { log } from "console";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = crypto.randomUUID();
    const dirId = crypto.randomUUID();

    console.log(`
        Username: ${username}
        Email: ${email}
        Password: ${password}
        `);

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }
    const existingUser = UserData.find((user) => user.email === email);

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    DirectoriesData.push({
      id: dirId,
      name: `root-${email}`,
      userId,
      parentDirId: null,
      files: [],
      directories: [],
    });

    const newUser = {
      id: userId,
      username,
      email,
      password,
      rootDirId: dirId,
    };

    UserData.push(newUser);
    await writeFile("./DirectoriesDB.json", JSON.stringify(DirectoriesData));
    await writeFile("./UserDB.json", JSON.stringify(UserData));
    res.status(200).json({ message: "Registration successful", user: newUser });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = UserData.find((user) => user.email === email);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid Credentials!" });
    }

    res.cookie("userId", user.id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
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
    console.log(userId);
    const user = UserData.find((user) => user.id === userId);
    console.log(user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User found successfully!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
      },
    });
  } catch (error) {}
};
