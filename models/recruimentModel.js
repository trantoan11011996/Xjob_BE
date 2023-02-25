const mongoose = require("mongoose");
const { Schema } = mongoose;

const recruimentSchema = new Schema(
  {
    title: String,
    name: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    description: String,
    position: String,
    type: String,
    level: String,
    age: String,
    experience: String,
    salary: String,
    numberApplicant: Number,
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    status: { type: String, default: "pending" },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    createAt: Date,
    deadline: Date,
  },
  { collection: "recruiments" }
);

const recruimentModel = mongoose.model("Recruiment", recruimentSchema);

module.exports = recruimentModel;
