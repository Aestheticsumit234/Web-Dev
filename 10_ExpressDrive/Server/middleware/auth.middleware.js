import User from "../model/User.model.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const { userId } = req.cookies;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
