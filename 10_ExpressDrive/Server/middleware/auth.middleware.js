import userData from "../UserDB.json" with { type: "json" };

export const authenticateUser = (req, res, next) => {
  const { userId } = req.cookies;
  const user = userData.find((user) => user.id === userId);
  if (!userId || !user) return res.status(401).json({ error: "Unauthorized" });

  req.userId = userId;
  next();
};
