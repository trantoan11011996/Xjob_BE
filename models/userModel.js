const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: String,
    password: String,
    role: String,
    avatar: {},
    info: {},
    status: {
      type: String,
      default: "active",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    operationSector: {
      type: Schema.Types.ObjectId,
      ref: "OperationSector",
    },
  },
  {
    collection: "users",
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
