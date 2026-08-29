require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function run() {

  await mongoose.connect(process.env.MONGO_URI);
  

  const result = await User.updateOne(
    { email: "admin@gmail.com" },
    { $set: { role: "admin" } }
  );

  console.log(result);
  mongoose.disconnect();
}

run();