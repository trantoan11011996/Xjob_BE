const mongoose = require("mongoose");
const { Schema } = mongoose;

const operationSectorSchema = new Schema(
  {
    name: String,
  },
  {
    collection: "operationSectors",
  }
);

const operationSectorModel = mongoose.model(
  "OperationSector",
  operationSectorSchema
);

module.exports = operationSectorModel;
