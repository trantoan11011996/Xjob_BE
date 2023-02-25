const asyncHandle = require("express-async-handler");
const { validateForAll } = require("../config/validate");
const recruimentModel = require("../models/recruimentModel");
const userModel = require("../models/userModel");
const generateToken = require("../untils/generateToken");
const nodemailer = require("nodemailer");
const categoryModel = require("../models/categoryModel");
const operationSectorModel = require("../models/operationSectorModel");
const bcrypt = require("bcryptjs");

const login = asyncHandle(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email: email });
  if (user) {
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (passwordIsCorrect) {
      if (user.status == "locked") {
        res.status(400);
        throw new Error(
          "Tài khoản của bạn đã bị vô hiệu hóa vì vi phạm chính sách về các tiêu chuẩn cộng đồng. Vui lòng liên hệ với chúng tôi để mở khóa."
        );
      }

      const userReturn = await userModel.findById(user._id).select("-password");

      res.json({
        id: userReturn._id,
        email: userReturn.email,
        role: userReturn.role,
        avatar: userReturn.avatar,
        info: userReturn.info,
        token: generateToken(userReturn._id),
      });
    } else {
      res.status(400);
      throw new Error("Password is not correct");
    }
  } else {
    res.status(400);
    throw new Error("Email is not correct");
  }
});

const getAllUsers = asyncHandle(async (req, res) => {
  const search = req.query.search || "";
  const role = req.query.role || "";
  const status = req.query.status || "";

  const arr = [];
  if (search) {
    arr.push({
      $or: [
        { "info.name": { $regex: search, $options: "i" } },
        { "info.fullName": { $regex: search, $options: "i" } },
      ],
    });
  }
  if (role) {
    arr.push({ role: role });
  }
  if (status) {
    arr.push({ status: status });
  }

  let options = {};
  if (!arr.length) {
    options = {};
  } else {
    options = { $and: arr };
  }

  const users = await userModel.find(options).select("-password");
  res.json(users);
});

const updateProfile = asyncHandle(async (req, res) => {
  const body = { ...req.body };
  const user = await userModel.findById(req.userInfo._id);

  user.info = body.info;
  user.password = body.password || user.password;

  await user.save();

  res.json({
    user: user.info,
  });
});

const updateStatusUser = asyncHandle(async (req, res) => {
  const userId = req.params.id;
  const status = req.body.status;
  const user = await userModel.findById(userId);

  if (status != "active" && status != "locked") {
    res.status(400);
    throw new Error("Status must be 'active' or 'locked'");
  }
  user.status = status;
  await user.save();

  res.json("Success !");
});

const registerAdmin = asyncHandle(async (req, res) => {
  const body = { ...req.body };
  const { error } = validateForAll(body);
  if (error) {
    res.status(400);
    throw new Error(error);
  } else {
    const userExist = await userModel.findOne({ email: body.email });
    if (userExist) {
      res.status(400);
      throw new Error("Email existed");
    }
    if (body.role != "admin") {
      res.status(400);
      throw new Error("Wrong role");
    } else {
      const user = await userModel.create(body);

      res.json({
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  }
});

const getAllRecruiment = asyncHandle(async (req, res) => {
  const search = req.query.search || "";
  const page = req.query.page || 1;
  const pageSize = 10;
  const category = req.query.category || "";
  const status = req.query.status || "";
  const fieldSort = req.query.fieldSort || "";
  const typeSort = req.query.typeSort || "";

  const arr = [];
  arr.push({ status: { $ne: "removed" } });
  if (search) {
    arr.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ],
    });
  }
  if (category) {
    arr.push({ category: category });
  }
  if (status) {
    arr.push({ status: status });
  }

  let sort = "";
  if (fieldSort) {
    if (typeSort == "asc") {
      sort = fieldSort;
    } else {
      sort = "-" + fieldSort;
    }
  }

  let options = {};
  if (arr.length == 0) {
    options = {};
  } else {
    options = { $and: arr };
  }

  const recruiment = await recruimentModel
    .find(options)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(sort)
    .populate([
      {
        path: "name",
        select: "info.name avatar -_id",
      },
      {
        path: "location",
        select: "name",
      },
      {
        path: "category",
        select: "name",
      },
    ]);
  const countDoc = await recruimentModel.countDocuments(options);
  res.json({ countDoc, recruiment });
});

const removedRecruiment = asyncHandle(async (req, res) => {
  const rcmId = req.params.id;
  const rcm = await recruimentModel.findById(rcmId).populate("name");
  const reason = req.body.reason;
  const email = rcm.name.info.email;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ducvietb79@gmail.com", // generated ethereal user
      pass: "aavfpodadmnwyfwd", // generated ethereal password
    },
  });
  const user = await userModel.findById(rcm.name);
  if (user) {
    await transporter.sendMail({
      from: "ducvietb79@gmail.com", // sender address
      to: `${email}`, // list of receivers
      subject: "Your recruiment has been removed", // Subject line
      html: ` 
      <h2>Hello ${email} !</h2>
      <p>${reason}</p>
      `, // html body
    });
    console.log(email);
    rcm.status = "removed";
    await rcm.save();

    res.json("Success !");
  } else {
    res.status(400);
    throw new Error("User not found !");
  }
});

const getAllCategory = asyncHandle(async (req, res) => {
  const search = req.query.search || "";
  const category = await categoryModel.find({
    name: { $regex: search, $options: "i" },
  });

  res.json(category);
});

const createCategory = asyncHandle(async (req, res) => {
  const body = { ...req.body };
  const category = await categoryModel.findOne({ name: body.name });
  if (category) {
    res.status(400);
    throw new Error("Category existed");
  } else {
    await categoryModel.create(body);
    res.json("Success !");
  }
});

const updateCategory = asyncHandle(async (req, res) => {
  const categoryId = req.params.id;
  const name = req.body.name;
  const category = await categoryModel.findById(categoryId);
  if (category) {
    category.name = name;
    await category.save();

    res.json("Success !");
  } else {
    res.status(400);
    throw new Error("Category is not exist");
  }
});

const getAllOperationSector = asyncHandle(async (req, res) => {
  const search = req.query.search || "";
  const operationSector = await operationSectorModel.find({
    name: { $regex: search, $options: "i" },
  });

  res.json(operationSector);
});

const createOperationSector = asyncHandle(async (req, res) => {
  const body = { ...req.body };
  const operationSector = await operationSectorModel.findOne({
    name: body.name,
  });
  if (operationSector) {
    res.status(400);
    throw new Error("Category existed");
  } else {
    await operationSectorModel.create(body);
    res.json("Success !");
  }
});

const updateOperationSector = asyncHandle(async (req, res) => {
  const operationSectorId = req.params.id;
  const name = req.body.name;
  const operationSector = await operationSectorModel.findById(
    operationSectorId
  );
  if (operationSector) {
    operationSector.name = name;
    await operationSector.save();

    res.json("Success !");
  } else {
    res.status(400);
    throw new Error("Category is not exist");
  }
});

module.exports = {
  getAllUsers,
  updateProfile,
  updateStatusUser,
  registerAdmin,
  getAllRecruiment,
  removedRecruiment,
  getAllCategory,
  createCategory,
  updateCategory,
  getAllOperationSector,
  createOperationSector,
  updateOperationSector,
  login,
};
