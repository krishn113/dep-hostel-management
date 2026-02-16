import express from "express";
import auth from "../middleware/auth.js";
import permit from "../middleware/roles.js";
import {
  addHostel,
  assignHostelToYear,
  assignHostelToStudent,
  addRooms
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", auth, permit("admin"), (req,res)=>{
  res.json({msg:"Welcome Admin"});
});
router.post("/add-hostel", auth, permit("admin"), addHostel);
router.post("/assign-year", auth, permit("admin"), assignHostelToYear);
router.post("/assign-student", auth, permit("admin"), assignHostelToStudent);
router.post("/add-rooms", auth, permit("admin"), addRooms);

export default router;
