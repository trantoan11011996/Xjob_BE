const mongoose = require("mongoose");
const { Schema } = mongoose;

const applicationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    recruimentId: {
      type: Schema.Types.ObjectId,
      ref: "Recruiment",
    },
    cv: String,
    status: { type: String, default: "pending" },
    createAt: String,
  },
  {
    collection: "applications",
  }
);

const applicationModel = mongoose.model("Application", applicationSchema);

module.exports = applicationModel;
