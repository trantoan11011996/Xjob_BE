const asyncHandle = require("express-async-handler");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const protect = asyncHandle(async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      const token = authorization.split(" ")[1];
      const userVerify = jwt.verify(token, "secretKey");
      const userInfo = await userModel
        .findById(userVerify.id)
        .select("-password");
      req.userInfo = userInfo;
      next();
    } catch (error) {
      res.status(400);
      throw new Error(error);
    }
  } else {
    res.status(401);
    throw new Error("You dont have permisson to access");
  }
});

const checkAdmin = asyncHandle(async (req, res, next) => {
  if (req.userInfo.role == "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("You dont have permisson to access");
  }
});

const checkCandidate = asyncHandle(async (req, res, next) => {
  if (req.userInfo.role == "candidate") {
    next();
  } else {
    res.status(401);
    throw new Error("You dont have permisson to access");
  }
});

const checkRecruiter = asyncHandle(async (req, res, next) => {
  if (req.userInfo.role == "recruiter") {
    next();
  } else {
    res.status(401);
    throw new Error("You dont have permisson to access");
  }
});

module.exports = {
  protect,
  checkAdmin,
  checkCandidate,
  checkRecruiter,
};
