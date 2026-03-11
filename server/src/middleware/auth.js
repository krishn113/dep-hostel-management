import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ msg: "Not authenticated" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // UPDATE: Added 'role' and 'name' to the select string.
    // Ensure these match the fields your Student Dashboard uses to avoid 'undefined' errors.
    const user = await User.findById(decoded.id)
      .select("+role +name +year +gender +degreeType +hostelId +hostelName");

    if (!user) return res.status(401).json({ msg: "User not found" });

    // Session invalidation check
    if (user.tokenVersion !== decoded.tv)
      return res.status(401).json({ msg: "Session expired. Login again." });

    req.user = user;
    next();
  } catch (err) {
    // Better logging for debugging "State Gap" issues
    console.error("Auth Middleware Error:", err.message);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    // This check only works if 'role' was selected in the protect middleware above
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ msg: "Access denied" });
    next();
  };
};