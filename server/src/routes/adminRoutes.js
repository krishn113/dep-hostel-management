import express from "express";
import {
  addHostel,
  getHostels,
  updateHostel,
  addRoom,
  getRooms,
  allocateBatch,
  getAllocations,
  allocateStudent,
  createStaff,
  updateBatchRule
} from "../controllers/adminController.js";

import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/hostels", protect, allowRoles("admin"), addHostel);
router.get("/hostels", protect, allowRoles("admin"), getHostels);
router.put("/hostels/:id", protect, allowRoles("admin"), updateHostel);

router.post("/rooms", protect, allowRoles("admin"), addRoom);
router.get("/rooms/:hostelId", protect, allowRoles("admin"), getRooms);

router.post("/allocations/batch", protect, allowRoles("admin"), allocateBatch);
router.get("/allocations/batch", protect, allowRoles("admin"), getAllocations);
router.put("/allocations/batch/:id", protect, allowRoles("admin"), updateBatchRule);

router.post("/allocations/student", protect, allowRoles("admin"), allocateStudent);

router.post("/staff", protect, allowRoles("admin"), createStaff);

export default router;
