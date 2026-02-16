import User from "../models/User.js";
import XLSX from "xlsx";
import Room from "../models/Room.js";

export const uploadRooms = async (req,res)=>{
  const wb = XLSX.read(req.file.buffer);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  for (let r of rows){
    const user = await User.findOne({ email:r.email });
    await Room.findOneAndUpdate(
      { hostelId:req.user.hostelId, roomNumber:r.roomNumber },
      { studentId:user._id }
    );
    await User.findByIdAndUpdate(user._id,{ roomNumber:r.roomNumber });
  }
  res.json({msg:"Rooms updated"});
};

export const downloadStudents = async (req,res)=>{
  const users = await User.find({ hostelId:req.user.hostelId, role:"student" });
  const data = users.map(u=>({
    name:u.name, email:u.email, entry:u.entryNumber, roomNumber:""
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  const buf = XLSX.write(wb,{type:"buffer", bookType:"xlsx"});
  res.setHeader("Content-Disposition","attachment; filename=students.xlsx");
  res.send(buf);
};
