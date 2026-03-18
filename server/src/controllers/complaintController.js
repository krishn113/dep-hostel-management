import Complaint from "../models/Complaint.js";
import YearAllocation from "../models/YearAllocation.js";
import User from "../models/User.js";

// 1. GET STUDENT'S OWN COMPLAINTS
export const getMyComplaints = async (req, res) => {
  try {
    // req.user.id comes from the protect middleware
    const complaints = await Complaint.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching your complaints" });
  }
};

export const createComplaint = async (req, res) => {
  try {
    const { title, category, description, isUrgent } = req.body;
    
    // 1. Destructure user details for the lookup
    const { year, gender, degreeType } = req.user;

    // 2. Find the allocation record to get the correct Hostel ID
    const allocation = await YearAllocation.findOne({ 
      year, 
      gender, 
      degreeType 
    });

    if (!allocation || !allocation.hostelId) {
      return res.status(404).json({ 
        msg: "No hostel ID found for your batch/gender allocation." 
      });
    }

    // 3. Create the complaint with the retrieved ID
    const newComplaint = new Complaint({
      student: req.user._id,
      hostelId: allocation.hostelId, // Now dynamically fetched from YearAllocation
      title,
      category,
      description,
      isUrgent: isUrgent || false,
      status: "Raised"
    });

    const savedComplaint = await newComplaint.save();
    res.status(201).json(savedComplaint);

  } catch (err) {
    console.error("CREATE COMPLAINT ERROR:", err);
    res.status(500).json({ msg: "Internal Server Error: " + err.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("student", "name roomNumber")
      .sort({ createdAt: -1 }); // <--- -1 means Descending (Latest First)
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching complaints" });
  }
};

export const submitSlots = async (req, res) => {
  try {
    const { slots } = req.body;
    await Complaint.findByIdAndUpdate(req.params.id, { 
      freeSlots: slots,
      // Optional: status: "Slots Provided"
    });
    res.json({ msg: "Slots updated" });
  } catch (err) {
    res.status(500).json({ msg: "Error updating slots" });
  }
};

// 3. STUDENT SUBMITS AVAILABILITY SLOTS (Matches /:id/submit-slots)
export const updateStudentSlots = async (req, res) => {
  const { id } = req.params;
  const { slots } = req.body;

  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ msg: "Complaint not found" });

    // Safety: Only allow updates if technician has asked for slots
    if (complaint.status !== "Get Slot") {
      return res.status(400).json({ msg: "Not in slot-collection phase" });
    }

    complaint.freeSlots = slots;
    complaint.updates.push({
      status: "Get Slot",
      message: `Student selected ${slots.length} availability slots.`,
      updatedBy: req.user._id
    });

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

// 4. CARETAKER MANAGING ACTIONS (Matches /:id/manage)
// This handles: Proposing Date, Scheduling Time, and Resolving
// server/src/controllers/complaintController.js

export const manageComplaint = async (req, res) => {
  const { id } = req.params;
  const { action, proposedDate, scheduledTime, reason } = req.body;

  try {
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ msg: "Complaint not found" });

    // --- PHASE 1: Caretaker asks for slots ---
    if (action === "Get Slot") {
      complaint.status = "Get Slot";
      complaint.proposedDate = proposedDate;
      complaint.updates.push({
        status: "Get Slot",
        message: `Technician requested availability for ${new Date(proposedDate).toLocaleDateString()}`,
        updatedBy: req.user._id
      });
    } 
    
    // --- PHASE 2: Caretaker picks the final hour ---
    else if (action === "Scheduled") {
      complaint.status = "Scheduled";
      complaint.scheduledTime = Number(scheduledTime);
      complaint.updates.push({
        status: "Scheduled",
        message: `Visit confirmed for ${scheduledTime}:00`,
        updatedBy: req.user._id
      });
    } 

    // --- NEW: RE-RAISED (The "Failure to Fix" Reset) ---
    else if (action === "Re-raised") {
      complaint.status = "Raised";
      complaint.scheduledTime = null;
      complaint.proposedDate = null;
      complaint.freeSlots = []; // Clear old availability to start fresh
      complaint.updates.push({
        status: "Raised",
        message: "Technician visit was incomplete. Complaint re-raised for new scheduling.",
        updatedBy: req.user._id
      });
    }

    // --- PHASE 3: Resolve ---
    else if (action === "Resolved") {
      complaint.status = "Resolved";
      complaint.resolvedAt = new Date();
      complaint.updates.push({
        status: "Resolved",
        message: "Issue has been fixed and resolved.",
        updatedBy: req.user._id
      });
    }

    // --- OPTIONAL: Rejected (For completeness) ---
    else if (action === "Rejected") {
      complaint.status = "Rejected";
      complaint.rejectionReason = reason;
      complaint.updates.push({
        status: "Rejected",
        message: `Request rejected: ${reason}`,
        updatedBy: req.user._id
      });
    }

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ msg: "Management Error", error: err.message });
  }
};

// 5. CARETAKER DASHBOARD STATS (For the Timeline View)
export const getSlotStatistics = async (req, res) => {
  const { date } = req.query;
  try {
    const queryDate = new Date(date);
    const complaints = await Complaint.find({
      proposedDate: queryDate,
      status: { $in: ["Get Slot", "Scheduled"] }
    }).populate("student", "name email phone roomNumber rollNo batch degree");

    // Calculate how many people are free at each hour
    const stats = {};
    complaints.forEach(c => {
      c.freeSlots.forEach(slot => {
        stats[slot] = (stats[slot] || 0) + 1;
      });
    });

    res.json({ stats, complaints });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch stats" });
  }
};

// Add this to complaintController.js
export const sendReminder = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ msg: "Not found" });

    // Logic check: Has it been 48 hours? (Optional safety check)
    const fortyEightHours = 48 * 60 * 60 * 1000;
    const timeElapsed = Date.now() - new Date(complaint.createdAt).getTime();

    if (timeElapsed < fortyEightHours) {
      return res.status(400).json({ msg: "Can only send reminder after 48 hours." });
    }

    complaint.isReminderSent = true;
    await complaint.save();
    
    res.json({ msg: "Reminder sent to caretaker!" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};