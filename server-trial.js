const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage;
const Grid = require("gridfs-stream");

const app = express();
const mongoURI = "mongodb://localhost:27017/yourDatabase";
mongoose.connect(mongoURI);

const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Configure Multer to upload files to GridFS
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => ({ filename: file.originalname, bucketName: "uploads" }),
});
const upload = multer({ storage });

// Upload image endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ fileId: req.file.id, filePath: `/image/${req.file.filename}` });
});

// Serve images dynamically
app.get("/image/:filename", async (req, res) => {
  const file = await gfs.files.findOne({ filename: req.params.filename });
  if (!file) return res.status(404).send("No file found");

  const readStream = gfs.createReadStream(file.filename);
  readStream.pipe(res);
});

app.listen(5000, () => console.log("Server running on port 5000"));
