const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  const token = jwt.sign({ id: id }, "secretKey", {
    expiresIn: "1d",
  });
  return token;
};

module.exports = generateToken;
