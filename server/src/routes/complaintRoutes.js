import express from "express";
const router = express.Router();
import { createComplaint, getMyComplaints, getCaretakerComplaints, toggleUpvote, bulkUpdateComplaints, submitStudentSlots, scheduleVisit, resolveOrReset, quickResolve, getStudentHistory, requestReschedule } from "../controllers/complaintController.js";
import { protect, caretakerOnly } from "../middleware/auth.js"; // Your JWT protector

router.post("/", protect, createComplaint);
router.get("/my-complaints", protect, getMyComplaints);



router.get("/caretaker", protect, caretakerOnly, getCaretakerComplaints);
router.patch("/bulk-update", protect, caretakerOnly, bulkUpdateComplaints);


router.get("/:id/history", protect, caretakerOnly, getStudentHistory);
router.patch("/:id/upvote", protect, toggleUpvote);
router.patch("/:id/submit-slots", protect, submitStudentSlots);
router.patch("/:id/schedule-visit", protect, caretakerOnly, scheduleVisit);
router.patch("/:id/resolve-reset", protect, caretakerOnly, resolveOrReset);
router.patch("/:id/quick-resolve", protect, caretakerOnly, quickResolve);
router.patch("/:id/reschedule", requestReschedule)
router.patch("/:id/manage", protect, caretakerOnly, async (req, res) => {
  try {
    const { action, reason } = req.body; 
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return res.status(404).json({ message: "Not found" });

    if (action === "Resolve") {
      complaint.status = "Resolved";
      complaint.timeline.resolvedAt = new Date();
    } 
    else if (action === "Reject") {
      complaint.status = "Rejected";
      complaint.rejectionReason = reason; // Matches your schema
      complaint.timeline.resolvedAt = new Date(); // Closing the ticket
    }
    else if (action === "Get Slot") {
      complaint.status = "Get Slot";
      complaint.scheduledVisit = undefined;
    }
    
    await complaint.save();
    res.json({ message: `Complaint ${action}ed successfully`, complaint });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

export default router;