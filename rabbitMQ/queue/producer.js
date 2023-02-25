const amqplib = require("amqplib");
//.env
const amqp_url_cloud =
  "amqps://qnutdlci:9lPH-Gm7ipJPKm2R4NnuZj5OCbA9nJBM@armadillo.rmq.cloudamqp.com/qnutdlci";
const amqp_url_docker = "";

const sendQueue = async ({ message }) => {
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

    //5. send to queue
    await channel.sendToQueue(nameQueue, Buffer.from(message), {
      // expiration: "10000",
    });

    //6. close connect and channel
  } catch (error) {
    console.log(error.message);
  }
};
const message = process.argv.slice(2).join(" ") || "hiiiii";

// sendQueue({ message });

module.exports = sendQueue;
