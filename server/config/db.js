const mongoose = require("mongoose");

const atlasConnect = async () => {
  try {
    const connectionUri = process.env.ATLAS_URI || process.env.MONGO_URI;
    await mongoose.connect(connectionUri);
    console.log("✅ Database Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed");
    throw error;
  }
};

module.exports = { atlasConnect };