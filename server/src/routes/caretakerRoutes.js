import express from "express";
import auth from "../middleware/auth.js";
import permit from "../middleware/roles.js";
import {
    downloadStudents
} from "../controllers/caretakerController.js";

router.get("/dashboard", auth, permit("admin"), (req,res)=>{
  res.json({msg:"Welcome Caretaker"});
});
router.get("/students-excel", auth, permit("caretaker"), downloadStudents);
router.post("/upload-rooms", auth, permit("caretaker"), upload.single("file"), uploadRooms);

