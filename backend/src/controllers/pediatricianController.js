import Pediatrician from "../models/Pediatrician.js";
import mongoose from "mongoose";

/* ADD CONTACT */

export const addPediatrician = async (req, res) => {
  try {

    const { parentId, name, phone } = req.body;

    const doctor = new Pediatrician({
      parentId: new mongoose.Types.ObjectId(parentId),
      name,
      phone,
    });

    await doctor.save();

    res.json({ message: "Contact added", doctor });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET CONTACTS */

export const getPediatricians = async (req, res) => {

  try {

    const { parentId } = req.params;

    const doctors = await Pediatrician.find({ parentId });

    res.json(doctors);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

/* DELETE CONTACT */

export const deletePediatrician = async (req, res) => {

  try {

    const { id } = req.params;

    await Pediatrician.findByIdAndDelete(id);

    res.json({ message: "Contact deleted" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};