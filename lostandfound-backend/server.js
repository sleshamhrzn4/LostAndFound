
require("dotenv").config();


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Item = require("./models/Item");
const authController = require("./controller/authController");
const { requireAuth, requireAdmin } = require("./middleware/auth");
const Log = require("./models/log");
const Claim = require("./models/claim");

const cloudinary = require("./config/cloudinary");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


const app = express();


app.use(cors());
app.use(express.json());


const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));


app.get("/api/items", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.location) filter.location = req.query.location;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: "i" };
    }

    const items = await Item.find(filter);
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });


  }
});


app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (item === null) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});

app.get("/api/logs", requireAuth, async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});


app.post("/api/items", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const category = req.body.category;
    const type = req.body.type;
    const location = req.body.location;
    const reportedBy = req.body.reportedBy;

    if (!title || !description || !category || !type || !location || !reportedBy) {
      return res
        .status(400)
        .json({ message: "Title, description, category, type, location and reportedBy   are required" });
    }

    let imageUrl = "";

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "lostandfound" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    const newItem = await Item.create({
      title,
      description,
      category,
      type,
      status: "unclaimed",
      location,
      dateReported: new Date(),
      reportedBy,
      imageUrl,
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});

app.put("/api/items/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (updatedItem === null) {
      return res.status(404).json({ message: "Item not found" });
    }

    await Log.create({
      itemId: updatedItem._id,
      action: `Status changed to "${status}"`,
      performedBy: req.user.email,
    });
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});


app.delete("/api/items/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);



    if (deletedItem === null) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});


app.post("/api/claims", requireAuth, async (req, res) => {
  try {
    const { itemId, message } = req.body;
    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const newClaim = await Claim.create({
      itemId,
      claimedBy: req.user.id,
      message,
    });

    res.status(201).json(newClaim);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});


app.get("/api/claims", requireAuth, async (req, res) => {
  try {
    const claims = await Claim.find().populate("itemId").populate("claimedBy");
    res.status(200).json(claims);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});

app.get("/api/claims/mine", requireAuth, async (req, res) => {
  try {
    const claims = await Claim.find({ claimedBy: req.user.id }).populate("itemId", "title category");
    res.status(200).json(claims);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});


app.put("/api/claims/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be either approved or rejected" });
    }

    const updatedClaim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },);

    if (!updatedClaim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (status === "approved") {
      await Item.findByIdAndUpdate(updatedClaim.itemId, { status: "claimed" });

      await Log.create({
        itemId: updatedClaim.itemId,
        action: `Claim approved for item`,
        performedBy: req.user.email,
      });
    }


    res.status(200).json(updatedClaim);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});

app.post("/api/register", authController.register);
app.post("/api/login", authController.login);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});
