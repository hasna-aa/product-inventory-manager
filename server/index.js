
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Product routes
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Inventory Manager Backend is working!");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log("Database error:", error.message));

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
