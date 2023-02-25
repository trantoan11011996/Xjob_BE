const multer = require("multer");

const configMulter = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //files khi upload xong sẽ nằm trong thư mục "uploads" này - các bạn có thể tự định nghĩa thư mục này
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      // tạo tên file = thời gian hiện tại nối với số ngẫu nhiên => tên file chắc chắn không bị trùng
      const filename = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, filename + "-" + file.originalname);
    },
  });
  //Khởi tạo middleware với cấu hình trên, lưu trên local của server khi dùng multer
  const upload = multer({ storage: storage }).single("formFile");
  console.log("upload", upload);
  return upload;
};
module.exports = configMulter;
