import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  type: { type: String, enum: ["Boys", "Girls", "Mixed"], default: "Mixed" },
  totalRooms: { type: Number, default: 0 }
});

export default mongoose.model("Hostel", hostelSchema);
