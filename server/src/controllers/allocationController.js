import YearAllocation from "../models/YearAllocation.js";

export const getStudentAllocation = async (req, res) => {
  try {
    const { year, gender, degreeType } = req.query;
    
    // Find allocation matching the student's year, gender, and degree
    const allocation = await YearAllocation.findOne({ year, gender, degreeType })
      .populate("hostelId"); // This joins the Hostel collection to get the name

    if (!allocation) {
      return res.status(404).json({ message: "No hostel allocated for these criteria" });
    }

    res.status(200).json(allocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};