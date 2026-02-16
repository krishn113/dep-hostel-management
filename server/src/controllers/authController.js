import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req,res)=>{
  try{
    const { name,email,password,year,entryNumber,degreeType,phone } = req.body;

    if(!email.endsWith("@iitrpr.ac.in"))
      return res.status(400).json({msg:"Only IIT Ropar email allowed"});

    const exists = await User.findOne({email});
    if(exists) return res.status(400).json({msg:"User already exists"});

    const hashed = await bcrypt.hash(password,10);

    const user = await User.create({
      name,email,password:hashed,year,entryNumber,degreeType,phone
    });

    res.json({msg:"Signup successful"});
  }catch(err){
    res.status(500).json({error:err.message});
  }
};

export const login = async (req,res)=>{
  const { email,password } = req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({msg:"Invalid credentials"});

  const ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.status(400).json({msg:"Invalid credentials"});

  const token = jwt.sign({id:user._id,role:user.role}, process.env.JWT_SECRET);
  res.json({ token, role:user.role });
};
