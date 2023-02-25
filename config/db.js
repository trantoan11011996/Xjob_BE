const moongose = require("mongoose");
const { account } = require("../keys");
moongose.set('strictQuery', false);

var connectDB = (function () {
  let instance;

  async function dbConfig() {
    // const dbUrl = "mongodb://localhost:27017/Xjob";
    const dbUrl = "mongodb+srv://toantran9695:Toan%40123@cluster0.qawakok.mongodb.net/Xjob?retryWrites=true&w=majority"
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
