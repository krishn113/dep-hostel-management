import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: { type: String, enum: ["Boys", "Girls", "Mixed"], default: "Mixed" },
  totalRooms: { type: Number, default: 0 }
});

// Combination of hostel name and gender type is unique
hostelSchema.index({ name: 1, type: 1 }, { unique: true });

export default mongoose.model("Hostel", hostelSchema);
