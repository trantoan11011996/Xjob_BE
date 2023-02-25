const express = require("express");
const router = express.Router();
const schedule = require("node-schedule");
const recruimentModel = require("../models/recruimentModel");
const multer = require("multer");

const {
  protect,
  checkRecruiter,
  checkCandidate,
} = require("../middlewares/authMiddleware");

const {
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
  approvalApplication,
  deleteApplication,
  closeRecruiment,
  checkRecruiment,
} = require("../controllers/recruimentController");
const asyncHandle = require("express-async-handler");

// Schedule for update status expire
schedule.scheduleJob(
  "* * * * *",
  asyncHandle(async () => {
    const rcm = await recruimentModel.updateMany(
      {
        $and: [
          { $or: [{ status: "active" }, { status: "extended" }] },
          { deadline: { $lte: new Date().toISOString() } },
        ],
      },
      { status: "expired" }
    );
  })
);

/* 1.
desc : create new recruiment
route : POST /api/recruiments/new
access : private - login by recruiter
 */
router.post("/new", protect, checkRecruiter, createRecruiment);

/* 2.
desc : get recruiment for homepage
route : POST /api/recruiments/home-page
access : public or private
 */
router.post("/home-page", getRecruimentHomePage);

/* 3.
desc : get all recruiment
route : GET /api/recruiments/
access : public
 */
router.get("/", getAllRecruiment);

/* 4.
desc : get detail recruiment
route : GET /api/recruiments/:id
access : public
 */
router.get("/detail/:id", getDetailRecruiment);

/* 5.
desc : get recruiment for recruiter
route : GET /api/recruiments/my-recruiment
access : private - login
*/

router.get("/my-recruiment", protect, checkRecruiter, getMyRecruiment);

/* 6.
desc : apply job
route : POST /api/recruiments/apply
access : private - login
*/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //files khi upload xong sẽ nằm trong thư mục "uploads" này - các bạn có thể tự định nghĩa thư mục này
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    // tạo tên file = thời gian hiện tại nối với số ngẫu nhiên => tên file chắc chắn không bị trùng
    const filename = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, filename + "-" + file.originalname);
  },
});
//Khởi tạo middleware với cấu hình trên, lưu trên local của server khi dùng multer
const upload = multer({ storage: storage });

router.post(
  "/apply/:id",
  protect,
  checkCandidate,
  upload.single("formFile"),
  userApply
);

/* 7.
desc : delete recruiment
route : DEL /api/recruiments/detail/:id
access : private - login
*/
router.delete("/detail/:id", protect, checkRecruiter, removeRecruiment);

/* 8.
desc : update recruiment
route : PUT /api/recruiments/:id
access : private - login
*/
router.put("/:id", protect, checkRecruiter, updateRecruiment);

/* 9.
desc : get list candidate applied job
route : GET /api/recruiments/detail/list-candidate-application
access : private - login
*/
router.get(
  "/list-candidate-application/:id",
  protect,
  checkRecruiter,
  getListCandidateApplication
);

/* 10.
desc : get list recruiment applied 
route : GET /api/recruiments/detail/list-recruiment-application
access : private - login
*/
router.get(
  "/list-recruiment-application",
  protect,
  checkCandidate,
  getListRecruimentApplication
);

/* 11.
desc : approval application by 
route : PUT /api/recruiments/application
access : private - login
*/
router.put("/application/:id", protect, checkRecruiter, approvalApplication);

/* 12.
desc : delete application
route : DEL /api/recruiments/application/:id
access : private - login
*/
router.delete("/application/:id", protect, checkCandidate, deleteApplication);

/* 13.
desc : close recruiment
route : PUT /api/recruiments/close/:id
access : private - login
*/
router.put("/close/:id", protect, checkRecruiter, closeRecruiment);

/* 14.
desc : check recruiment
route : GET /api/recruiments/check/:rcmId/:userId
access : private - login
*/
router.get("/check/:id", protect, checkCandidate, checkRecruiment);

module.exports = router;
