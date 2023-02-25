const express = require("express");
const router = express.Router();

const { protect, checkAdmin } = require("../middlewares/authMiddleware");
const {
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
} = require("../controllers/adminController");

/* 1.
desc : get all users
route : GET /api/admin/users
access : private - login by admin
 */
router.get("/users", protect, checkAdmin, getAllUsers);

/* 2.
desc : update account admin
route : PUT /api/admin/users
access : private - login by admin
 */
router.put("/users", protect, checkAdmin, updateProfile);

/* 3.
desc : lock/unlock account user
route : PUT /api/admin/users/:id
access : private - login by admin
 */
router.put("/users/:id", protect, checkAdmin, updateStatusUser);

/* 4.
desc : create acc admin
route : POST /api/admin/users
access : private - login by admin
 */
router.post("/users", protect, checkAdmin, registerAdmin);

/* 5.
desc : get all recruiments
route : GET /api/admin/recruiments
access : private - login by admin
 */
router.get("/recruiments", protect, checkAdmin, getAllRecruiment);

/* 5.
desc : remove recruiment
route : PUT /api/admin/recruiments
access : private - login by admin
 */
router.put("/recruiments/:id", protect, checkAdmin, removedRecruiment);

/* 6.
desc : get all category
route : GET /api/admin/category
access : private - login by admin
 */
router.get("/category", protect, checkAdmin, getAllCategory);

/* 7.
desc : create new category
route : POST /api/admin/category
access : private - login by admin
 */
router.post("/category", protect, checkAdmin, createCategory);

/* 8.
desc : update category
route : PUT /api/admin/category/:id
access : private - login by admin
 */
router.put("/category/:id", protect, checkAdmin, updateCategory);

/* 9.
desc : get all operationSector
route : GET /api/admin/operation-sector
access : private - login by admin
 */
router.get("/operation-sector", protect, checkAdmin, getAllOperationSector);

/* 10.
desc : create new operationSector
route : POST /api/admin/operation-sector
access : private - login by admin
 */
router.post("/operation-sector", protect, checkAdmin, createOperationSector);

/* 11.
desc : update operationSector
route : PUT /api/admin/operation-sector/:id
access : private - login by admin
 */
router.put("/operation-sector/:id", protect, checkAdmin, updateOperationSector);

/* 12.
desc : login admin
route : POST /api/admin/login
access : public
 */
router.post("/login", login);

module.exports = router;
