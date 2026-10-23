const mongoose = require("mongoose");

const atlasConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.ATLAS_URI);
    console.log("✅ Database Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed");
    throw error;
  }
};

module.exports = { atlasConnect };