const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Item = require("./models/Item");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

const uri = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB Connection"))
  .catch((err) => console.log(err));

// 📌 API Routes

// Get all items
app.get("/items", async (_req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Create new item
app.post("/items", async (req, res) => {
  const newItem = new Item({ name: req.body.name });
  await newItem.save();
  res.json(newItem);
});

app.put("/items/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name }, // Update the name
      { new: true } // Return the updated item
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle errors
  }
});

// Delete an item
app.delete("/items/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Item deleted" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port of ${PORT}`));
