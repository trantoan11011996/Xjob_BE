const amqplib = require("amqplib");
var Filter = require("bad-words");
const badWordsVN = require("../../data/badwords");
const recruimentModel = require("../../models/recruimentModel");
const mongoose = require("mongoose");
const connectDB = require("../../config/db");
//.env
const amqp_url_cloud =
  "amqps://qnutdlci:9lPH-Gm7ipJPKm2R4NnuZj5OCbA9nJBM@armadillo.rmq.cloudamqp.com/qnutdlci";
const amqp_url_docker = "";

const receiveQueue = async () => {
  try {
    //1. create connect
    const connect = await amqplib.connect(amqp_url_cloud);

    //2. create channel
    const channel = await connect.createChannel();

    //3. create name queue
    const nameQueue = "queue1";

    //4. create queue
    await channel.assertQueue(nameQueue, {
      durable: false,
    });

    //5. receive from queue
    await channel.consume(
      nameQueue,
      async (message) => {
        // console.log(message.content.toString());

        const id = message.content.toString();
        const filter = new Filter();
        const rcm = await recruimentModel.findById(id);

        const text = rcm.description + " " + rcm.title;
        const badWords = filter.clean(text);
        const textSplit = text.split(" ");

        for (let i of textSplit) {
          if (badWordsVN.includes(i)) {
            await recruimentModel.findByIdAndUpdate(id, {
              status: "removed",
            });
            console.log("Bad word VN");
            return;
          }
        }

        if (badWords.includes("*")) {
          await recruimentModel.findByIdAndUpdate(id, {
            status: "removed",
          });
          console.log("Bad word EN");
          return;
        } else {
          await recruimentModel.findByIdAndUpdate(id, {
            status: "active",
          });
          console.log("Success !");
          return;
        }
      },
      {
        noAck: true,
      }
    );

    //6. close connect and channel
  } catch (error) {
    console.log(error.message);
  }
};
connectDB.getInstance();
receiveQueue();
