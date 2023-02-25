const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: String,
  },
  {
    collection: "categories",
  }
);

const categoryModel = mongoose.model("Category", categorySchema);

module.exports = categoryModel;
