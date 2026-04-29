import HostelLeaving from "../models/HostelLeaving.js";
import GuestHouseBooking from "../models/GuestHouseBooking.js";
import generatePDF from "../utils/generatePDF.js";
import { sendGuestHouseMail } from "../utils/sendMail.js";
import User from "../models/User.js";
import LostFound from "../models/LostFound.js";
import { processAndSaveFile } from "../utils/localUpload.js";

// @route POST /api/student/forms/leave OR /api/hostel-leaving/apply
export const applyHostelLeaving = async (req, res) => {
  try {
    const { 
      reason, leavingDate, returnDate, 
      nameOfParents, contactOfParents, addressDuringLeave,
      applicantName, applicantDepartment, applicantEntryNo, applicantMobileNo
    } = req.body;

    // Auto calculate duration (in days)
    const duration = Math.ceil((new Date(returnDate) - new Date(leavingDate)) / (1000 * 60 * 60 * 24));

    const application = await HostelLeaving.create({
      studentId: req.user._id,
      hostelId: req.user.hostelId, // Assuming student has a hostelId
      reason,
      leavingDate,
      returnDate,
      nameOfParents,
      contactOfParents,
      addressDuringLeave,
      duration,
      applicantName,
      applicantDepartment,
      applicantEntryNo,
      applicantMobileNo
    });

    res.status(201).json({ message: "Hostel leaving application submitted", application });
  } catch (error) {
    console.error("Error applying for hostel leaving:", error);
    res.status(500).json({ error: "Failed to submit hostel leaving application" });
  }
};

// @route POST /api/student/forms/guesthouse OR /api/guesthouse/book
export const bookGuestHouse = async (req, res) => {
  try {
    const data = req.body;
    
    const booking = await GuestHouseBooking.create({
      ...data,
      studentId: req.user._id,
      hostelId: req.user.hostelId // Optional, if linked to a specific hostel
    });

    const pdfPath = await generatePDF(data, booking._id);

    // Get warden email. In a real scenario, you'd fetch the warden from the DB
    // based on hostelId or a global warden role. For now, we will fetch the first warden or use a default.
    const warden = await User.findOne({ role: "warden" });
    const wardenEmail = warden ? warden.email : "warden@college.edu";

    await sendGuestHouseMail(
      wardenEmail,
      data,
      pdfPath
    );

    res.status(201).json({ message: "Guest house booking submitted successfully", booking });
  } catch (error) {
    console.error("Error booking guest house:", error);
    res.status(500).json({ error: "Booking failed" });
  }
};

// @route GET /api/student/forms
export const getMyForms = async (req, res) => {
  try {
    const leavingForms = await HostelLeaving.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    const guestHouseForms = await GuestHouseBooking.find({ studentId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      leavingForms,
      guestHouseForms
    });
  } catch (error) {
    console.error("Error fetching my forms:", error);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
};

export const createPost = async (req, res) => {
  try {
    // Process the image manually using the utility we created
    let imageUrl = null;
    if (req.file) {
      imageUrl = await processAndSaveFile(req.file, 'lost-found');
    }

    const post = await LostFound.create({
      title: req.body.title,
      description: req.body.description,
      imageUrl: imageUrl, // Now stores /uploads/lost-found/filename.webp
      type: req.body.type,
      visibility: req.body.visibility,
      contactNumber: req.body.contactNumber,
      postedBy: req.user._id,
      hostelId: req.user.hostelId
    });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {

    const posts = await LostFound.find({
      status: "active",
      $or: [
        { visibility: "global" },
        { visibility: "hostel", hostelId: req.user.hostelId }
      ]
    })
    .populate("postedBy", "name")
    .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markResolved = async (req, res) => {
  try {

    const post = await LostFound.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Only the original poster can resolve it
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the person who posted this can mark it resolved" });
    }

    await LostFound.findByIdAndUpdate(req.params.id, { status: "resolved" });

    res.json({ message: "Item marked resolved" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};