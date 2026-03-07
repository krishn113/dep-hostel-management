import Hostel from "../models/Hostel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import YearAllocation from "../models/YearAllocation.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- Hostels ---
export const addHostel = async (req, res) => {
  try {
    const { name, type, roomConfigs } = req.body;
    
    // 1. Create Hostel
    const hostel = await Hostel.create({ name, type });

    // 2. Create Rooms based on configs
    if (Array.isArray(roomConfigs) && roomConfigs.length > 0) {
      const roomsToCreate = [];
      let totalRoomsCount = 0;
      const prefixCount = { 1: 0, 2: 0, 3: 0 };

      for (const config of roomConfigs) {
        const capacity = parseInt(config.capacity);
        const count = parseInt(config.rooms) || 0;

        if (count > 0 && capacity > 0) {
          const prefix = capacity === 1 ? 'S' : (capacity === 2 ? 'D' : (capacity === 3 ? 'T' : `C${capacity}-`));
          
          let roomType = "Single";
          if (capacity === 2) roomType = "Double";
          if (capacity === 3) roomType = "Triple";

          for (let i = 1; i <= count; i++) {
            prefixCount[capacity] = (prefixCount[capacity] || 0) + 1;
            roomsToCreate.push({
              roomNumber: `${prefix}${prefixCount[capacity]}`,
              hostelId: hostel._id,
              type: roomType
            });
            totalRoomsCount++;
          }
        }
      }

      if (roomsToCreate.length > 0) {
        await Room.insertMany(roomsToCreate);
        hostel.totalRooms = totalRoomsCount;
        await hostel.save();
      }
    }

    res.status(201).json(hostel);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Hostel with this name and type already exists." });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find();
    res.json(hostels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateHostel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    
    // Check if another hostel with same name+type exists (excluding current)
    const exists = await Hostel.findOne({ name, type, _id: { $ne: id } });
    if (exists) {
      return res.status(400).json({ error: "Hostel with this name and type already exists." });
    }

    const hostel = await Hostel.findByIdAndUpdate(id, { name, type }, { new: true });
    if (!hostel) return res.status(404).json({ error: "Hostel not found" });
    
    res.json(hostel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Rooms ---
export const addRoom = async (req, res) => {
  try {
    const { hostelId, roomNumber, capacity } = req.body;
    const room = await Room.create({ hostelId, roomNumber, capacity });

    // Update total rooms in Hostel
    await Hostel.findByIdAndUpdate(hostelId, { $inc: { totalRooms: 1 } });

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// massAddRooms removed - rooms are now added during hostel creation

export const getRooms = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const rooms = await Room.find({ hostelId });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Allocations (Batch) ---
export const allocateBatch = async (req, res) => {
  try {
    const { year, gender, degreeType, hostelId } = req.body;

    // Upsert allocation rule
    const allocation = await YearAllocation.findOneAndUpdate(
      { year, gender, degreeType },
      { hostelId },
      { upsert: true, new: true }
    );

    res.json({ msg: "Allocation rule saved", allocation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllocations = async (req, res) => {
  try {
    const allocations = await YearAllocation.find().populate("hostelId");
    res.json(allocations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- Specific Student Allocation ---
export const allocateStudent = async (req, res) => {
  try {
    const { email, hostelId, roomNumber } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { hostelId, roomNumber },
      { new: true }
    );
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Increment occupied count for room (simplified logic, ideally check capacity)
    if (roomNumber) {
      await Room.findOneAndUpdate({ hostelId, roomNumber }, { $inc: { occupiedCount: 1 } });
    }

    res.json({ msg: "Student allocated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, email, role, hostelId, gender } = req.body;

    if (!["warden", "caretaker"].includes(role))
      return res.status(400).json({ error: "Invalid role" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "User already exists" });

    // generate password
    const rawPassword = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      hostelId,
      gender
    });

    // email credentials
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Hostel Management Login Credentials",
      text: `
Hello ${name},

You have been added as ${role}.

Login:
Email: ${email}
Password: ${rawPassword}

Please login and change your password immediately.

– Hostel Admin
`
    });

    res.json({ msg: "Staff created & email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create staff" });
  }
};

export const updateBatchRule = async (req, res) => {
  await Allocation.findByIdAndUpdate(req.params.id, req.body);
  res.json({ msg: "Rule updated" });
};
