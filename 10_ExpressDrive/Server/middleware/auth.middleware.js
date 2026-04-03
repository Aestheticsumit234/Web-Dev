import Session from "../model/session.model.js";
import User from "../model/User.model.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (!sessionId) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized: Session not found" });
    }

    const user = await User.findById(session.userId);

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
