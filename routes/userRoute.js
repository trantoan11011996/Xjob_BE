var express = require("express");
var router = express.Router();
const multer = require("multer");

const {
  protect,
  checkAdmin,
  checkRecruiter,
} = require("../middlewares/authMiddleware");

const {
  createUser,
  login,
  updateProfile,
  forgotPassword,
  updatePassword,
  getProfile,
  getLocation,
  getCategory,
  getOperationSector,
  uploadSingleFile,
  listRecruiter,
  detailRecruiter,
  listJob,
} = require("../controllers/userController");

/* 1.
desc : register
route : POST /api/users/register
access : public
*/
router.post("/register", createUser);

/* 2.
desc : login
route : POST /api/users/login
access : public
*/
router.post("/login", login);

/* 3.
desc : update profile
route : PUT /api/users/update-profile
access : private - login
*/
router.put("/update-profile", protect, updateProfile);

/* 4.
desc : update password
route : PUT /api/users/update-password
access : private - login
*/
router.put("/update-password", protect, updatePassword);

/* 5.
desc : forgot password
route : POST /api/users/forgot-password
access : public
*/
router.post("/forgot-password", forgotPassword);

/* 6.
desc : get profile user
route : GET /api/users/profile
access : private - login
*/
router.get("/profile", protect, getProfile);

/* 7.
desc : get location
route : GET /api/users/location
access : private - login
*/
router.get("/location", getLocation);

/* 8.
desc : get category
route : GET /api/users/category
access : private - login
*/
router.get("/category", getCategory);

/* 9.
desc : get operationSector
route : GET /api/users/operation-sector
access : private - login
*/
router.get("/operation-sector", getOperationSector);

/* 10.
desc : upload single file
route : POST /api/users/upload-single-file
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
  "/upload-single-file",
  protect,
  upload.single("formFile"),
  uploadSingleFile
);

/* 11.
desc : get list recruiter
route : GET /api/users/list-recruiter
access : public
*/
router.get("/list-recruiter", listRecruiter);

/* 12.
desc : get detail recruiter
route : GET /api/users/detail-recruiter/:id
access : public
*/
router.get("/detail-recruiter/:id", detailRecruiter);

/* 13.
desc : get list application
route : GET /api/users/list-application/:id
access : public
*/
router.get("/list-application/:id", listJob);

module.exports = router;
