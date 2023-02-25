const mongoose = require("mongoose");
const { Schema } = mongoose;

const locationSchema = new Schema(
  {
    id: String,
    code: String,
    name: String,
    districts: [],
  },
  {
    collection: "locations",
  }
);

const locationModel = mongoose.model("Location", locationSchema);

module.exports = locationModel;
