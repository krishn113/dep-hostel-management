import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  assignedYears: [String],   // e.g. ["2022","2023"]
  caretakers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  wardens: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
},{ timestamps:true });

export default mongoose.model("Hostel", hostelSchema);
