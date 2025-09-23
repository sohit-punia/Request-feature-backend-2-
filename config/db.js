// import mongoose from "mongoose";

// const connectDB = async (mongoURI) => {
//   try {
//     await mongoose.connect(mongoURI, {
//       // options not needed for mongoose 7+, kept for older compatibility
//     });
//     console.log("MongoDB connected");
//   } catch (err) {
//     console.error("MongoDB connection error:", err.message);
//     process.exit(1);
//   }
// };

// export default connectDB;

// config/db.js
// backend/config/db.js
import mongoose from "mongoose";

const connectDB = async (mongoURI) => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");

    // Connection details
    console.log("🔹 Database name:", conn.connection.db.databaseName);
    console.log("🔹 Host:", conn.connection.host);
    console.log("🔹 Port:", conn.connection.port);

    // List collections in the current DB
    try {
      const cols = await conn.connection.db.listCollections().toArray();
      console.log("🔹 Collections:", cols.map(c => c.name));
    } catch (err) {
      console.log("Could not list collections:", err.message);
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
