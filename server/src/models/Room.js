import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref:"Hostel", required:true },
  roomNumber: { type:String, required:true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref:"User", default:null }
});

export default mongoose.model("Room", roomSchema);
