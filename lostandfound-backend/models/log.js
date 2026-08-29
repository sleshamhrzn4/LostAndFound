const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Log = mongoose.model("Log", logSchema);

module.exports = Log;