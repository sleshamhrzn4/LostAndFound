const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 chars"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 chars"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["lost", "found"],
    },
    status: {
      type: String,
      enum: ["unclaimed", "claimed"],
      default: "unclaimed",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    dateReported: {
      type: Date,
      default: Date.now,
    },
    reportedBy: {
      type: String,
      required: [true, "Reporter contact is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;