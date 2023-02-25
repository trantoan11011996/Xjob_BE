const asyncHandle = require("express-async-handler");
const { validateRecruiment } = require("../config/validate");
const applicationModel = require("../models/applicationModel");
const recruimentModel = require("../models/recruimentModel");
const sendQueue = require("../rabbitMQ/queue/producer");

const createRecruiment = asyncHandle(async (req, res) => {
  const body = { ...req.body };
  const text = body.title + " " + body.description;

  const { error } = validateRecruiment(body);
  if (error) {
    res.status(400);
    throw new Error(error);
  }

  const recruiment = await await (
    await (
      await (
        await recruimentModel.create(body)
      ).populate({
        path: "name",
        select: "info.name -_id",
      })
    ).populate({
      path: "location",
      select: "name -_id",
    })
  ).populate({
    path: "category",
    select: "name -_id",
  });

  // sendMessage rabbitMQ

  sendQueue({ message: String(recruiment._id) });
  res.json(recruiment);
});

const getAllRecruiment = asyncHandle(async (req, res) => {
  const search = req.query.search || "";
  const page = req.query.page || 1;
  const pageSize = 16;
  const category = req.query.category || "";
  const fieldSort = req.query.fieldSort || "";
  const typeSort = req.query.typeSort || "";

  const arr = [];
  // arr.push({ $or: [{ status: "active" }, { status: "extended" }] });
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
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .sort(sort)
    .populate([
      {
        path: "name",
        select: "info.name avatar -_id",
      },
      {
        path: "location",
        select: "name -_id",
      },
      {
        path: "category",
        select: "name -_id",
      },
    ])
    .select("title avatar name location salary avatar createAt deadline");

  const countDoc = await recruimentModel.countDocuments(options);
  res.json({ countDoc, recruiment });
});

const getRecruimentHomePage = asyncHandle(async (req, res) => {
  const page = req.query.page || 1;
  const pageSize = 10;
  const search = req.query.search || "";
  const category = req.query.category || "";
  const fieldSort = req.query.fieldSort || "";
  const typeSort = req.query.typeSort || "";

  const arr = [];
  if (req.body.categoryId) {
    arr.push({ category: req.body.categoryId });
    arr.push({ $or: [{ status: "active" }, { status: "extended" }] });
  } else {
    arr.push({ $or: [{ status: "active" }, { status: "extended" }] });
  }
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
        select: "name -_id",
      },
      {
        path: "category",
        select: "name -_id",
      },
    ])
    .select("title avatar name location salary avatar createAt deadline");
  const countDoc = await recruimentModel.countDocuments(options);
  res.json({ countDoc, recruiment });
});

const getDetailRecruiment = asyncHandle(async (req, res) => {
  const recruimentId = req.params.id;

  const rcm = await recruimentModel.findById(recruimentId).populate([
    {
      path: "name",
      select: "info avatar -_id",
    },
    {
      path: "location",
    },
    {
      path: "category",
    },
  ]);
  res.json(rcm);
});

const getMyRecruiment = asyncHandle(async (req, res) => {
  const recruiterId = req.userInfo._id;
  const search = req.query.search || "";
  const page = req.query.page || 1;
  const pageSize = 16;
  const category = req.query.category || "";
  const fieldSort = req.query.fieldSort || "";
  const typeSort = req.query.typeSort || "";
  const status = req.query.status || "";

  const arr = [];
  arr.push({ name: recruiterId });
  if (search) {
    arr.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ],
    });
  }
  if (category) {
    arr.push({ category: { $eq: category } });
  }
  if (status) {
    arr.push({ status: { $eq: status } });
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
  const myRcm = await recruimentModel
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
        select: "name -_id",
      },
      {
        path: "category",
        select: "name -_id",
      },
    ])
    .select("title name location salary createAt deadline");

  const countDoc = await recruimentModel.countDocuments(options);

  res.json({ countDoc, myRcm });
});

const userApply = asyncHandle(async (req, res) => {
  const userId = req.userInfo._id;
  const recruimentId = req.params.id;
  const createAt = new Date().toLocaleDateString();
  const file = req.file;
  const cv = req.file.path;

  if (!file) {
    res.status(400);
    throw new Error("Upload file again!");
  }

  const applicant = await applicationModel.create({
    userId,
    recruimentId,
    cv,
    createAt,
  });

  res.json("Success !");
});

const removeRecruiment = asyncHandle(async (req, res) => {
  const rcmId = req.params.id;
  const rcm = await recruimentModel.deleteOne({ _id: rcmId });
  const apply = await applicationModel.deleteMany({ recruimentId: rcmId });
  res.json("Delete success !");
});

const updateRecruiment = asyncHandle(async (req, res) => {
  const rcmId = req.params.id;
  const body = { ...req.body };
  const rcm = await recruimentModel.findById(rcmId);

  if (new Date(body.deadline).toISOString() > rcm.deadline.toISOString()) {
    body.status = "extended";
  }

  const updateRcm = await recruimentModel.updateOne({ _id: rcmId }, body);

  sendQueue({ message: String(rcm._id) });
  res.json("Success !");
});

const getListCandidateApplication = asyncHandle(async (req, res) => {
  const status = req.query.status || "";
  const recruimentId = req.params.id;
  const arr = [];
  let obj = {};

  arr.push({ recruimentId });
  if (status) {
    arr.push({ status });
  }
  if (arr.length == 0) {
    obj = {};
  } else {
    obj = { $and: arr };
  }
  const application = await applicationModel
    .find(obj)
    .populate(["userId", "recruimentId"]);
  res.json(application);
});

const getListRecruimentApplication = asyncHandle(async (req, res) => {
  const userId = req.userInfo._id;
  const status = req.query.status || "";
  const arr = [];
  let obj = {};

  arr.push({ userId });
  if (status) {
    arr.push({ status });
  }
  if (arr.length == 0) {
    obj = {};
  } else {
    obj = { $and: arr };
  }

  const application = await applicationModel
    .find(obj)
    .select("recruimentId status -userId")
    .populate({
      path: "recruimentId",
      populate: [
        {
          path: "name",
          select: "info avatar",
        },
        {
          path: "location",
          select: "name ",
        },
        {
          path: "category",
          select: "name ",
        },
      ],
    })
    .populate("userId");
  res.json(application);
});

const approvalApplication = asyncHandle(async (req, res) => {
  const appId = req.params.id;
  const status = req.body.status;

  const app = await applicationModel.findById(appId);
  if (status != "accepted" && status != "denied") {
    res.status(400);
    throw new Error("Status must be 'accepted' or 'denied' ");
  }
  app.status = status;

  await app.save();
  res.json("Success !");
});

const deleteApplication = asyncHandle(async (req, res) => {
  const appID = req.params.id;
  console.log(appID);
  const app = await applicationModel.findById(appID);
  await app.remove();
  res.json(app);
});

const closeRecruiment = asyncHandle(async (req, res) => {
  const rcmId = req.params.id;
  const rcm = await recruimentModel.findById(rcmId);

  rcm.status = "closed";
  await rcm.save();

  res.json("Success !");
});

const checkRecruiment = asyncHandle(async (req, res) => {
  const rcmId = req.params.id;
  const userId = req.userInfo._id;
  const app = await applicationModel.findOne({
    $and: [{ recruimentId: rcmId }, { userId: userId }, { status: "pending" }],
  });
  if (app) {
    res.json(true);
  } else {
    res.json(false);
  }
});

module.exports = {
  createRecruiment,
  getRecruimentHomePage,
  getAllRecruiment,
  getDetailRecruiment,
  getMyRecruiment,
  userApply,
  removeRecruiment,
  updateRecruiment,
  getListCandidateApplication,
  getListRecruimentApplication,
  deleteApplication,
  approvalApplication,
  closeRecruiment,
  checkRecruiment,
};
