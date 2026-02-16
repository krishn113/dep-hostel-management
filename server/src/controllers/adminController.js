import Hostel from "../models/Hostel.js";
import User from "../models/User.js";
import Room from "../models/Room.js";



export const addRooms = async (req,res)=>{
  const { hostelId, rooms } = req.body; // rooms = ["101","102","103"]
  const data = rooms.map(r=>({ hostelId, roomNumber:r }));
  await Room.insertMany(data);
  res.json({msg:"Rooms added"});
};


// Add hostel
export const addHostel = async (req,res)=>{
  try{
    const { name } = req.body;
    const hostel = await Hostel.create({ name });
    res.json(hostel);
  }catch(err){
    res.status(500).json({error:err.message});
  }
};


// Assign hostel to year
export const assignHostelToYear = async (req,res)=>{
  try{
    const { hostelId, year } = req.body;

    await Hostel.findByIdAndUpdate(hostelId, {
      $addToSet:{ assignedYears: year }
    });

    // assign hostel to all students of that year
    await User.updateMany(
      { year, role:"student" },
      { hostelId }
    );

    res.json({msg:"Hostel assigned to year"});
  }catch(err){
    res.status(500).json({error:err.message});
  }
};


// Assign hostel to individual student
export const assignHostelToStudent = async (req,res)=>{
  try{
    const { studentId, hostelId } = req.body;

    await User.findByIdAndUpdate(studentId,{ hostelId });

    res.json({msg:"Hostel assigned to student"});
  }catch(err){
    res.status(500).json({error:err.message});
  }
};
