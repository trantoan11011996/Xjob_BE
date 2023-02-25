const userModel = require("../models/userModel");
const locationModel = require("../models/locationModel");
const categoryModel = require("../models/categoryModel");
const operationSectorModel = require("../models/operationSectorModel");
const recruimentModel = require("../models/recruimentModel");
const asyncHandle = require("express-async-handler");
const generateToken = require("../untils/generateToken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const fs = require("fs");
const {
  validateForAll,
  validateForCandidate,
  validateForRecruiter,
  validateChangePassword,
} = require("../config/validate");

const createUser = asyncHandle(async (req, res) => {
  const body = { ...req.body };
  const { error } = validateForAll(body);
  if (error) {
    res.status(400);
    throw new Error("Email or password invalid");
  } else {
    const userExist = await userModel.findOne({ email: body.email });
    if (userExist) {
      res.status(400);
      throw new Error("Email existed");
    }
    if (body.role != "candidate" && body.role != "recruiter") {
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

const login = asyncHandle(async (req, res) => {
  const { email, password } = req.body;
  let flagPopulate = "";

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
      if (user.role == "candidate") {
        flagPopulate = "category";
      } else if (user.role == "operationSector") {
        flagPopulate = "operationSector";
      } else {
        res.status(400);
        throw new Error("Email or password incorrect");
      }
      const userReturn = await userModel
        .findById(user._id)
        .select("-password")
        .populate(flagPopulate);

      res.json({
        id: userReturn._id,
        email: userReturn.email,
        role: userReturn.role,
        avatar: userReturn.avatar,
        info: userReturn.info,
        status: userReturn.status,
        [flagPopulate]: userReturn[flagPopulate],
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

const updateProfile = asyncHandle(async (req, res) => {
  const { body, userInfo } = req;
  let flagValidate = function () {};
  let flagPopulate = "";

  if (userInfo.role == "candidate") {
    flagValidate = validateForCandidate;
    flagPopulate = "category";
  } else if (userInfo.role == "recruiter") {
    flagValidate = validateForRecruiter;
    flagPopulate = "operationSector";
  } else {
    res.status(400);
    throw new Error("Role must be 'candidate' or 'recruiter'");
  }
  const { error } = flagValidate(body.info);
  if (error) {
    res.status(400);
    throw new Error(error);
  }
  const user = await userModel.findById(userInfo._id);
  user.info = body.info;
  user[flagPopulate] = body[flagPopulate];
  // user[flagPopulate] = body.category || body.operationSector;
  await user.save();
  const newUser = await userModel
    .findById(userInfo._id)
    .select("-password")
    .populate(flagPopulate);

  res.json(newUser);
});

const updatePassword = asyncHandle(async (req, res) => {
  const { currentPassword, newPassword, repeatNewPassword } = req.body;
  const { error } = validateChangePassword(req.body);

  if (error) {
    res.status(400);
    throw new Error(error);
  }

  const user = await userModel.findById(req.userInfo._id);
  const passwordIsCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (passwordIsCorrect) {
    user.password = newPassword;
    await user.save();
    res.json("Update successed");
  } else {
    res.status(400);
    throw new Error("Password incorrect");
  }
});

const forgotPassword = asyncHandle(async (req, res) => {
  // create random string for new password
  const generateString = (n) => {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < n; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return `Rd9*${text}`;
  };
  const newPassword = generateString(8);

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ducvietb79@gmail.com", // generated ethereal user
      pass: "aavfpodadmnwyfwd", // generated ethereal password
    },
  });
  const user = await userModel.findOne({ email: req.body.email });
  if (user) {
    await transporter.sendMail({
      from: "ducvietb79@gmail.com", // sender address
      to: `${req.body.email}`, // list of receivers
      subject: "Change your password", // Subject line
      html: ` 
      <h2>Hello ${req.body.email} !</h2>
      <p>Your new password</p>
      <h1>${newPassword}</h1>
      <a href="http://localhost:3000/login">Go here</a>
      `, // html body
    });

    user.password = newPassword;
    await user.save();
    res.json("Please check your email");
  } else {
    res.status(400);
    throw new Error("Email is not exist");
  }
  // send mail with defined transport object
});

const getProfile = asyncHandle(async (req, res) => {
  const { _id, role } = req.userInfo;
  let flag = "";
  if (role == "candidate") {
    flag = "category";
  } else {
    flag = "operationSector";
  }
  const user = await userModel
    .findById(_id)
    .select("-password ")
    .populate(flag, "-_id");
  res.json(user);
});

const getLocation = asyncHandle(async (req, res) => {
  const location = await locationModel.find();
  res.json(location);
});

const getCategory = asyncHandle(async (req, res) => {
  const category = await categoryModel.find();
  res.json(category);
});

const getOperationSector = asyncHandle(async (req, res) => {
  const operationSector = await operationSectorModel.find();
  res.json(operationSector);
});

const uploadSingleFile = asyncHandle(async (req, res, next) => {
  //nhận dữ liệu từ form
  const file = req.file;

  // Kiểm tra nếu không phải dạng file thì báo lỗi
  if (!file) {
    res.status(400);
    throw new Error("Upload file again!");
  }

  // const user = await userModel.findById(req.userInfo._id);
  const user = await userModel.findById(req.userInfo._id);
  // const img = fs.readFileSync(req.file.path);
  // const encode_image = img.toString("base64");

  // Define a JSONobject for the image attributes for saving to database
  // const finalImg = {
  //   contentType: req.file.mimetype,
  //   image: Buffer.from(encode_image, "base64"),
  // };

  const pathImage = req.file.path;

  user.avatar = pathImage;
  await user.save();

  res.json(pathImage);
  // res.render("image", { file: file });
});

const listRecruiter = asyncHandle(async (req, res) => {
  const search = req.query.search;
  const page = req.query.page || 1;
  const pageSize = 10;
  const operationSector = req.query.operationSector || "";

  const arr = [];
  arr.push({ role: "recruiter" });
  arr.push({ status: "active" });
  if (search) {
    arr.push({ "info.name": { $regex: search, $options: "i" } });
  }
  if (operationSector) {
    arr.push({ operationSector: operationSector });
  }

  let obj = {};
  if (arr.length == 0) {
    obj = {};
  } else {
    obj = { $and: arr };
  }

  const rcts = await userModel
    .find(obj)
    .populate("operationSector")
    .skip(pageSize * (page - 1))
    .limit(pageSize);
  const countDoc = await userModel.countDocuments(obj);

  res.json({ countDoc, rcts });
});

const detailRecruiter = asyncHandle(async (req, res) => {
  const rctId = req.params.id;
  const rct = await userModel
    .findById(rctId)
    .populate("operationSector")
    .select("-password");
  res.json(rct);
});

const listJob = asyncHandle(async (req, res) => {
  const id = req.params.id;
  const rcms = await recruimentModel
    .find({ name: id })
    .populate([{ path: "location", select: "name" }, { path: "category" }]);
  res.json(rcms);
});

module.exports = {
  createUser,
  forgotPassword,
  login,
  getProfile,
  getLocation,
  getCategory,
  getOperationSector,
  updateProfile,
  updatePassword,
  uploadSingleFile,
  listRecruiter,
  detailRecruiter,
  listJob,
};
