const moongose = require("mongoose");
const { account } = require("../keys");

var connectDB = (function () {
  let instance;

  async function dbConfig() {
    // const dbUrl = "mongodb://localhost:27017/Xjob";
    const dbUrl = `mongodb+srv://${account}`;
    instance = await moongose.connect(dbUrl);
    return instance;
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = dbConfig();
      }

      console.log("Server Xjob is running ");
      return instance;
    },
  };
})();

module.exports = connectDB;
