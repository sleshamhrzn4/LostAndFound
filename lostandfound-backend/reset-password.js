require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const newPassword = "admin123";
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result = await User.updateOne(
    { email: "admin@gmail.com" },
    { $set: { password: hashedPassword } }
  );

  console.log(result);
  console.log("New password is:", newPassword);
  mongoose.disconnect();
}

run();