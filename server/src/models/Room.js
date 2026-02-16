import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
  roomNumber: String,
  capacity: Number,
  occupiedCount: { type: Number, default: 0 }
});

export default mongoose.model("Room", roomSchema);
