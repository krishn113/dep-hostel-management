import express from "express";
import { signup, login, sendOtp, verifyOtp, forgotPassword, resetPassword, getMe, updatePhone } from "../controllers/authController.js";
import { protect, allowRoles } from "../middleware/auth.js";
import passport from "passport";
import { generateToken } from "../utils/generateToken.js";
const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.patch("/update-phone", protect, updatePhone);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", 
  (req, res, next) => {
    passport.authenticate("google", { 
      session: false, 
      // Redirect to signup with a 'reason' flag
      failureRedirect: `${process.env.CLIENT_URL}/signup?reason=not_registered` 
    })(req, res, next);
  },
  (req, res) => {
    const token = generateToken(req.user); 
    res.redirect(`${process.env.CLIENT_URL}/login-success?token=${token}`);
  }
);

export default router;
