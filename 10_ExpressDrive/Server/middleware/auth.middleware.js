import { ObjectId } from "mongodb";

export const authenticateUser = async (req, res, next) => {
  const { userId } = req.cookies;
  const db = req.db;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(userId) });

  if (!user) return res.status(401).json({ error: "Unauthorized" });

  req.userId = user._id.toString();
  next();
};
