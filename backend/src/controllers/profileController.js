import User from "../models/Users.js";

/* ================= GET PROFILE ================= */
export const getProfile = async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE PARENT ================= */
export const updateParent = async (req, res) => {
  try {
    const { email, parentName, phone } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { parentName, phone },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Parent updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE INFANT ================= */
export const updateInfant = async (req, res) => {
  try {
    const { email, infantId, updatedData } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const infant = user.infants.id(infantId);

    if (!infant) {
      return res.status(404).json({ message: "Infant not found" });
    }

    Object.assign(infant, updatedData);
    await user.save();

    res.status(200).json({
      message: "Infant updated successfully",
      infants: user.infants,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
