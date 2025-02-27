const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken"); 
const Item = require("./models/Item"); // Your Item model

const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET; // Store your JWT secret in .env

mongoose.connect(uri);

// Authentication Middleware (JWT)
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; //

    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Invalid token
      }

      req.user = user; // Add user info to request object
      next(); // Proceed to the next middleware/route handler
    });
  } else {
    res.sendStatus(401); // No token provided
  }
};

// API Routes (Example - adapt as needed)

// Get all items (no authentication required)
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Example protected routes (require authentication)
app.post("/items", authenticateJWT, async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/items/:id", authenticateJWT, async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/items/:id", authenticateJWT, async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Example login route (replace with your actual login logic)
app.post("/login", (req, res) => {
  const { username, password } = req.body; // Get credentials from request body

  // ***REPLACE THIS WITH YOUR ACTUAL AUTHENTICATION LOGIC***
  //  Check username/password against database, etc.
  const user = { id: 1, username: username }; // Example user (replace with real user data)

  if (user) {
    // If authentication is successful
    const token = jwt.sign(user, jwtSecret, { expiresIn: "1h" }); // Create JWT
    res.json({ token }); // Send token back to the client
  } else {
    res.sendStatus(401); // Unauthorized
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
